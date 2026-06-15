import type { SatelliteData, SatelliteCategory, TLEData } from "../types";
import { CATEGORY_COLORS } from "../types";
// @ts-ignore
import * as satellite from "satellite.js";

const EARTH_RADIUS_KM = 6371;

// ── Backend config ────────────────────────────────────────────────────────────
// Flask backend runs on localhost:5000 — no CORS issues, fetches CelesTrak server-side
const FLASK_API = "http://localhost:5000/api";
const FLASK_TIMEOUT_MS = 90000;

interface TLESource {
  category: SatelliteCategory;
  label: string;
}

const TLE_SOURCES: TLESource[] = [
  { category: "iss", label: "ISS" },
  { category: "starlink", label: "Starlink" },
  { category: "gps", label: "GPS" },
  { category: "galileo", label: "Galileo" },
  { category: "glonass", label: "GLONASS" },
  { category: "weather", label: "Weather" },
  { category: "scientific", label: "Scientific" },
  { category: "communication", label: "Active" },
];

const MAX_PER_CATEGORY: Partial<Record<SatelliteCategory, number>> = {
  starlink: 50,
  gps: 40,
  galileo: 30,
  glonass: 30,
  weather: 50,
  scientific: 80,
  communication: 20,
  iss: 1,
};

function parseTLEText(text: string, category: SatelliteCategory): TLEData[] {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const tles: TLEData[] = [];
  for (let i = 0; i < lines.length - 2; i += 3) {
    if (lines[i + 1]?.startsWith("1 ") && lines[i + 2]?.startsWith("2 ")) {
      tles.push({
        name: lines[i].replace(/^0 /, "").trim(),
        tle1: lines[i + 1],
        tle2: lines[i + 2],
      });
    }
  }
  return tles;
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(id);
    return r;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

/** Check if Flask backend is reachable */
async function isBackendAvailable(): Promise<boolean> {
  try {
    const r = await fetchWithTimeout(`${FLASK_API}/health`, 2000);
    return r.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch all TLEs at once from Flask backend (/api/tle/all)
 * Returns map of category → TLEData[]
 */
async function fetchAllFromBackend(): Promise<
  Map<SatelliteCategory, TLEData[]>
> {
  const resp = await fetchWithTimeout(`${FLASK_API}/tle/all`, FLASK_TIMEOUT_MS);
  if (!resp.ok) throw new Error("Backend /tle/all failed: " + resp.status);
  const json = await resp.json();
  const result = new Map<SatelliteCategory, TLEData[]>();
  for (const [cat, tles] of Object.entries(json.categories ?? {})) {
    result.set(cat as SatelliteCategory, tles as TLEData[]);
  }
  return result;
}

export function tleToSatelliteData(
  tle: TLEData,
  category: SatelliteCategory,
  date: Date,
): SatelliteData | null {
  try {
    const satrec = satellite.twoline2satrec(tle.tle1, tle.tle2);
    const posVel = satellite.propagate(satrec, date);
    if (!posVel.position || typeof posVel.position === "boolean") return null;
    const gmst = satellite.gstime(date);
    const geo = satellite.eciToGeodetic(posVel.position, gmst);
    const lat = satellite.degreesLat(geo.latitude);
    const lng = satellite.degreesLong(geo.longitude);
    const alt = geo.height;
    const vel = posVel.velocity;
    const speed =
      typeof vel === "object" && "x" in vel
        ? Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2)
        : 7.8;
    const noradId = parseInt(tle.tle1.substring(2, 7).trim(), 10);
    const inclination = parseFloat(tle.tle2.substring(8, 16).trim());
    const meanMotion = parseFloat(tle.tle2.substring(52, 63).trim());
    const period = meanMotion > 0 ? 1440 / meanMotion : 90;
    return {
      id: `${category}-${noradId}`,
      name: tle.name,
      noradId,
      category,
      tle1: tle.tle1,
      tle2: tle.tle2,
      position: { lat, lng, alt },
      velocity: {
        x: typeof vel === "object" && "x" in vel ? vel.x : 0,
        y: typeof vel === "object" && "y" in vel ? vel.y : 0,
        z: typeof vel === "object" && "z" in vel ? vel.z : 0,
        speed,
      },
      inclination,
      altitude: alt,
      period,
      color: CATEGORY_COLORS[category],
      operator: getCategoryOperator(category),
      country: "International",
      missionType: getCategoryMission(category),
    };
  } catch {
    return null;
  }
}

export function updateSatellitePositions(
  satellites: SatelliteData[],
  date: Date,
): SatelliteData[] {
  return satellites.map((sat) => {
    if (!sat.tle1 || !sat.tle2) {
      return sat;
    }
    try {
      const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
      const posVel = satellite.propagate(satrec, date);
      if (!posVel.position || typeof posVel.position === "boolean") return sat;
      const gmst = satellite.gstime(date);
      const geo = satellite.eciToGeodetic(posVel.position, gmst);
      const vel = posVel.velocity;
      const speed =
        typeof vel === "object" && "x" in vel
          ? Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2)
          : 7.8;
      return {
        ...sat,
        position: {
          lat: satellite.degreesLat(geo.latitude),
          lng: satellite.degreesLong(geo.longitude),
          alt: geo.height,
        },
        velocity: {
          x: typeof vel === "object" ? vel.x : 0,
          y: typeof vel === "object" ? vel.y : 0,
          z: typeof vel === "object" ? vel.z : 0,
          speed,
        },
        altitude: geo.height,
      };
    } catch {
      return sat;
    }
  });
}

export function computeOrbitTrail(
  sat: SatelliteData,
  date: Date,
  minutesBefore = 90,
  steps = 180,
): Array<[number, number, number]> {
  const points: Array<[number, number, number]> = [];
  try {
    const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
    for (let i = steps; i >= 0; i--) {
      const t = new Date(date.getTime() - (i / steps) * minutesBefore * 60000);
      const pv = satellite.propagate(satrec, t);
      if (!pv.position || typeof pv.position === "boolean") continue;
      const gmst = satellite.gstime(t);
      const geo = satellite.eciToGeodetic(pv.position, gmst);
      points.push([
        satellite.degreesLat(geo.latitude),
        satellite.degreesLong(geo.longitude),
        geo.height,
      ]);
    }
  } catch {}
  return points;
}

/**
 * Main fetch function:
 * 1. Try Flask backend (/api/tle/all) — server-side fetch, no CORS
 * 2. Fall back to mock data per category if backend is unreachable
 */
export async function fetchSatellites(
  onProgress?: (loaded: number, total: number) => void,
): Promise<SatelliteData[]> {
  const allSatellites: SatelliteData[] = [];
  const now = new Date();
  const total = TLE_SOURCES.length;

  // Try Flask backend first
  const backendUp = await isBackendAvailable();

  if (backendUp) {
    console.info(
      "[Cosmosphere] Flask backend detected — fetching real TLE data",
    );
    try {
      const tleMap = await fetchAllFromBackend();
      let loaded = 0;
      for (const source of TLE_SOURCES) {
        const tles = tleMap.get(source.category) ?? [];
        const limit = MAX_PER_CATEGORY[source.category] ?? 100;
        for (const tle of tles.slice(0, limit)) {
          const sd = tleToSatelliteData(tle as TLEData, source.category, now);
          if (sd) allSatellites.push(sd);
        }
        if (tles.length > 0) {
          console.info(
            `[Cosmosphere] ✓ ${source.label}: ${tles.length} satellites`,
          );
        } else {
          console.warn(
            `[Cosmosphere] No data for ${source.label} — using mock`,
          );
          allSatellites.push(
            ...generateMockSatellites(
              source.category,
              MAX_PER_CATEGORY[source.category] ?? 20,
            ),
          );
        }
        loaded++;
        onProgress?.(loaded, total);
      }
      return allSatellites;
    } catch (err) {
      console.warn(
        "[Cosmosphere] Backend batch fetch failed, trying per-category fallback:",
        err,
      );
    }
  } else {
    console.warn(
      "[Cosmosphere] Flask backend not reachable — using mock data. Start backend with: cd backend && python app.py",
    );
  }

  // Fallback: generate mock data for all categories instantly
  let loaded = 0;
  for (const source of TLE_SOURCES) {
    allSatellites.push(
      ...generateMockSatellites(
        source.category,
        MAX_PER_CATEGORY[source.category] ?? 20,
      ),
    );
    loaded++;
    onProgress?.(loaded, total);
  }
  return allSatellites;
}

// ── Mock data ──────────────────────────────────────────────────────────────────

function generateMockSatellites(
  category: SatelliteCategory,
  count: number,
): SatelliteData[] {
  const altitudes: Record<SatelliteCategory, number> = {
    iss: 420,
    starlink: 550,
    gps: 20200,
    galileo: 23222,
    glonass: 19100,
    weather: 800,
    scientific: 700,
    communication: 35786,
    debris: 600,
    rocket_body: 500,
  };
  const alt = altitudes[category] ?? 550;
  const incMap: Record<SatelliteCategory, number> = {
    iss: 51.6,
    starlink: 53,
    gps: 55,
    galileo: 56,
    glonass: 64.8,
    weather: 98,
    scientific: 97,
    communication: 0,
    debris: 70,
    rocket_body: 70,
  };
  const inc = incMap[category] ?? 53;
  return Array.from({ length: count }, (_, i) => {
    const plane = Math.floor(i / Math.max(1, count / 6));
    const phaseInPlane = (i % Math.max(1, count / 6)) / Math.max(1, count / 6);
    const raan = (plane / 6) * 360;
    const maRad = phaseInPlane * 2 * Math.PI;
    const incRad = (inc * Math.PI) / 180;
    const raanRad = (raan * Math.PI) / 180;
    const lat = (Math.asin(Math.sin(incRad) * Math.sin(maRad)) * 180) / Math.PI;
    const lng =
      ((((Math.atan2(Math.cos(incRad) * Math.sin(maRad), Math.cos(maRad)) +
        raanRad) *
        180) /
        Math.PI +
        540) %
        360) -
      180;
    return {
      id: `${category}-mock-${i}`,
      name: `${CATEGORY_LABELS_MAP[category]}-${String(i + 1).padStart(4, "0")}`,
      noradId: 50000 + i,
      category,
      tle1: "",
      tle2: "",
      position: { lat, lng, alt },
      velocity: { x: 0, y: 0, z: 0, speed: category === "gps" ? 3.87 : 7.8 },
      inclination: inc,
      altitude: alt,
      period: category === "gps" ? 718 : 95,
      color: CATEGORY_COLORS[category],
      operator: getCategoryOperator(category),
      country: "International",
      missionType: getCategoryMission(category),
    };
  });
}

export function generateMockSatellitesForAllCategories(): SatelliteData[] {
  const all: SatelliteData[] = [];
  const entries: Array<[SatelliteCategory, number]> = [
    ["iss", 1],
    ["starlink", 300],
    ["gps", 40],
    ["galileo", 30],
    ["glonass", 30],
    ["weather", 50],
    ["scientific", 80],
    ["communication", 150],
  ];
  for (const [cat, count] of entries)
    all.push(...generateMockSatellites(cat, count));
  return all;
}

const CATEGORY_LABELS_MAP: Record<SatelliteCategory, string> = {
  iss: "ISS",
  starlink: "STARLINK",
  gps: "GPS",
  galileo: "GALILEO",
  glonass: "GLONASS",
  weather: "WEATHER",
  scientific: "SCI",
  communication: "COMMS",
  debris: "DEBRIS",
  rocket_body: "ROCKET",
};

function getCategoryOperator(cat: SatelliteCategory): string {
  const map: Record<SatelliteCategory, string> = {
    iss: "NASA/Roscosmos/ESA/JAXA/CSA",
    starlink: "SpaceX",
    gps: "US Space Force",
    galileo: "ESA / EU",
    glonass: "Roscosmos",
    weather: "NOAA / ESA",
    scientific: "Various",
    communication: "Various",
    debris: "N/A",
    rocket_body: "N/A",
  };
  return map[cat] ?? "Unknown";
}

function getCategoryMission(cat: SatelliteCategory): string {
  const map: Record<SatelliteCategory, string> = {
    iss: "Space Station / Research",
    starlink: "Broadband Internet",
    gps: "Navigation / Positioning",
    galileo: "Navigation / Positioning",
    glonass: "Navigation / Positioning",
    weather: "Meteorology",
    scientific: "Earth Science / Research",
    communication: "Telecommunications",
    debris: "Space Debris",
    rocket_body: "Launch Vehicle Remnant",
  };
  return map[cat] ?? "Unknown";
}
