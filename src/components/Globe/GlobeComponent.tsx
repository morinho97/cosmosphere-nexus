/**
 * GlobeComponent — High-performance 3D globe with:
 * - Milky Way / orange nebula background (like satellitemap.space)
 * - Animated glowing satellite dots
 * - Real directional sun light + visible sun sphere
 * - Camera modes: follow, flythrough, polar, ISS, terminator
 * - FPS optimized: pointsMerge for Starlink, throttled position updates
 */
import { useEffect, useRef, useCallback } from "react";
import { useStore } from "../../store";
import type { SatelliteData, GroundStation } from "../../types";
import * as SatLib from "satellite.js";

const EARTH_RADIUS_KM = 6371;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getGlobe(): any {
  return (window as any).Globe;
}

const TEXTURES = [
  {
    globe:
      "https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-blue-marble.jpg",
    bump: "https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-topology.png",
  },
  {
    globe: "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
    bump: "https://unpkg.com/three-globe/example/img/earth-topology.png",
  },
];

async function resolveTextures() {
  for (const t of TEXTURES) {
    try {
      const r = await fetch(t.globe, {
        method: "HEAD",
        signal: AbortSignal.timeout(3000),
      });
      if (r.ok) return t;
    } catch {
      /**/
    }
  }
  return TEXTURES[0];
}

export default function GlobeComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const sunAngleRef = useRef<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sunObjRef = useRef<{ light: any; mesh: any; halo: any } | null>(null);
  const lastPovRef = useRef<{ lat: number; lng: number; alt: number }>({
    lat: 20,
    lng: 0,
    alt: 2.5,
  });
  const flythroughRef = useRef<number>(0);

  const {
    satellites,
    activeSatelliteCategories,
    selectedSatellite,
    setSelectedSatellite,
    showGroundStations,
    groundStations,
    showOrbits,
    showBeams,
    showConstellation,
    simTime,
    globeAutoRotate,
    setGlobeAutoRotate,
    setFps,
    cameraMode,
  } = useStore();

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || globeRef.current) return;
    const el = containerRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;

    async function tryInit() {
      if (globeRef.current) return;
      const Factory = getGlobe();
      if (!Factory) {
        console.warn("[Globe] Not ready");
        return;
      }
      const tex = await resolveTextures();
      initGlobe(el, Factory, tex);
    }

    if (win.__globeGLReady) tryInit();
    else if (typeof win.__onGlobeGLReady === "function")
      win.__onGlobeGLReady(tryInit);
    else {
      let n = 0;
      const poll = setInterval(() => {
        if (getGlobe()) {
          clearInterval(poll);
          tryInit();
        } else if (++n > 75) clearInterval(poll);
      }, 200);
      return () => clearInterval(poll);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function initGlobe(
      el: HTMLElement,
      Factory: any,
      tex: (typeof TEXTURES)[0],
    ) {
      const globe = Factory()(el);
      globeRef.current = globe;

      // ── Earth ──────────────────────────────────────────────────────────────
      // Use resolved blue-marble texture (dark texture unreliable on local network)
      // Apply a dark tint via renderer to get the satellitemap.space navy look
      globe
        .globeImageUrl(tex.globe)
        .bumpImageUrl(tex.bump)
        .backgroundImageUrl("")
        .showGraticules(true)
        .showAtmosphere(true)
        .atmosphereColor("rgba(50,100,255,0.75)")
        .atmosphereAltitude(0.13);

      // Darken the globe material after a short delay (globe.gl sets it async)
      setTimeout(() => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const THREE = (window as any).THREE;
          const scene = globe.scene?.();
          if (!THREE || !scene) return;
          scene.traverse((obj: any) => {
            // Find the globe sphere mesh and darken its material
            if (
              obj.isMesh &&
              obj.geometry?.type === "SphereGeometry" &&
              obj.material?.map
            ) {
              obj.material.color = new THREE.Color(0.35, 0.45, 0.65); // navy tint
              obj.material.needsUpdate = true;
            }
          });
        } catch (_) {}
      }, 1500);

      globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);

      // ── Renderer ────────────────────────────────────────────────────────────
      try {
        const renderer = globe.renderer?.();
        if (renderer) {
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5 for FPS
          renderer.toneMapping = 4; // ACESFilmic
          renderer.toneMappingExposure = 1.05;
          renderer.shadowMap.enabled = false; // disable shadows for FPS
          // Dark space background — canvas background
          renderer.setClearColor(0x000005, 1);
        }
      } catch (_) {}

      // ── Three.js scene: Milky Way nebula + Sun ─────────────────────────────
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const THREE = (window as any).THREE;
        const scene = globe.scene?.();

        if (THREE && scene) {
          // Remove globe.gl default lights
          const toRemove: object[] = [];
          scene.traverse((o: any) => {
            if (o.isAmbientLight || o.isDirectionalLight) toRemove.push(o);
          });
          toRemove.forEach((o: any) => scene.remove(o));

          // Deep space ambient (very dim — night side should be dark)
          scene.add(new THREE.AmbientLight(0x0a0a1a, 0.6));

          // ── Milky Way background sphere (orange/red nebula like satellitemap.space) ──
          const bgGeo = new THREE.SphereGeometry(900, 32, 32);
          // Custom texture via canvas — orange nebula
          const bgCanvas = document.createElement("canvas");
          bgCanvas.width = 1024;
          bgCanvas.height = 512;
          const ctx = bgCanvas.getContext("2d")!;
          // Base — deep space black
          ctx.fillStyle = "#000005";
          ctx.fillRect(0, 0, 1024, 512);
          // Orange/red nebula clouds (like satellitemap.space milky way)
          const addNebula = (
            x: number,
            y: number,
            r: number,
            color: string,
            alpha: number,
          ) => {
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(
              0,
              color.replace(")", `,${alpha})`).replace("rgb", "rgba"),
            );
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1024, 512);
          };
          addNebula(300, 260, 280, "rgb(120,40,10)", 0.55); // main orange band
          addNebula(520, 240, 220, "rgb(90,20,5)", 0.45);
          addNebula(700, 280, 200, "rgb(60,15,5)", 0.35);
          addNebula(150, 200, 160, "rgb(80,30,8)", 0.3);
          addNebula(850, 220, 180, "rgb(50,10,3)", 0.25);
          addNebula(400, 150, 120, "rgb(140,60,15)", 0.2); // brighter center
          addNebula(600, 320, 150, "rgb(40,8,2)", 0.2);
          // Star field
          for (let i = 0; i < 2000; i++) {
            const sx = Math.random() * 1024;
            const sy = Math.random() * 512;
            const sr = Math.random() * 1.2;
            const brightness = Math.random();
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fillStyle =
              brightness > 0.97
                ? `rgba(255,220,180,${brightness})`
                : `rgba(200,210,255,${brightness * 0.7})`;
            ctx.fill();
          }
          const bgTex = new THREE.CanvasTexture(bgCanvas);
          const bgMat = new THREE.MeshBasicMaterial({
            map: bgTex,
            side: THREE.BackSide,
          });
          scene.add(new THREE.Mesh(bgGeo, bgMat));

          // ── Sun ────────────────────────────────────────────────────────────
          const sunLight = new THREE.DirectionalLight(0xfff4e0, 3.8);
          sunLight.position.set(400, 60, 150);
          scene.add(sunLight);

          // Sun sphere
          const sunMesh = new THREE.Mesh(
            new THREE.SphereGeometry(9, 24, 24),
            new THREE.MeshBasicMaterial({ color: 0xffee77 }),
          );
          sunMesh.position.copy(sunLight.position);
          scene.add(sunMesh);

          // Sun glow halo
          const haloMesh = new THREE.Mesh(
            new THREE.SphereGeometry(16, 24, 24),
            new THREE.MeshBasicMaterial({
              color: 0xffcc33,
              transparent: true,
              opacity: 0.15,
              depthWrite: false,
            }),
          );
          haloMesh.position.copy(sunLight.position);
          scene.add(haloMesh);

          // Outer soft glow
          const outerGlow = new THREE.Mesh(
            new THREE.SphereGeometry(28, 24, 24),
            new THREE.MeshBasicMaterial({
              color: 0xff9900,
              transparent: true,
              opacity: 0.06,
              depthWrite: false,
            }),
          );
          outerGlow.position.copy(sunLight.position);
          scene.add(outerGlow);

          sunObjRef.current = {
            light: sunLight,
            mesh: sunMesh,
            halo: haloMesh,
          };

          // ── Animate sun drift + FPS tracking ──────────────────────────────
          const SUN_DIST = 450;
          let fpsF = 0,
            fpsL = performance.now();

          const loop = () => {
            animFrameRef.current = requestAnimationFrame(loop);

            // FPS
            fpsF++;
            const now = performance.now();
            if (now - fpsL >= 1000) {
              useStore
                .getState()
                .setFps(Math.round((fpsF * 1000) / (now - fpsL)));
              fpsF = 0;
              fpsL = now;
            }

            // Sun slow orbit
            sunAngleRef.current += 0.00015;
            const sx = Math.cos(sunAngleRef.current) * SUN_DIST;
            const sy = 80;
            const sz = Math.sin(sunAngleRef.current) * SUN_DIST;
            sunLight.position.set(sx, sy, sz);
            sunMesh.position.set(sx, sy, sz);
            haloMesh.position.set(sx, sy, sz);
            outerGlow.position.set(sx, sy, sz);

            // Camera modes
            handleCameraMode();
          };
          loop();
        }
      } catch (e) {
        console.warn("[Globe] Three.js setup error:", e);
        let fpsF = 0,
          fpsL = performance.now();
        const fallback = () => {
          animFrameRef.current = requestAnimationFrame(fallback);
          fpsF++;
          const now = performance.now();
          if (now - fpsL >= 1000) {
            useStore
              .getState()
              .setFps(Math.round((fpsF * 1000) / (now - fpsL)));
            fpsF = 0;
            fpsL = now;
          }
        };
        fallback();
      }

      // ── Controls ────────────────────────────────────────────────────────────
      const controls = globe.controls?.();
      if (controls) {
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.rotateSpeed = 0.45;
        controls.zoomSpeed = 0.7;
        controls.minDistance = 101;
        controls.maxDistance = 800;
        controls.addEventListener("start", () =>
          useStore.getState().setGlobeAutoRotate(false),
        );
      }

      // ── Sizing ──────────────────────────────────────────────────────────────
      const setSize = () => {
        const w = el.clientWidth || window.innerWidth;
        const h = el.clientHeight || window.innerHeight;
        globe.width(w).height(h);
      };
      const ro = new ResizeObserver(setSize);
      ro.observe(el);
      window.addEventListener("resize", setSize);
      setSize();
      setTimeout(setSize, 100);
      setTimeout(setSize, 500);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el as any).__cleanup = () => {
        ro.disconnect();
        window.removeEventListener("resize", setSize);
        cancelAnimationFrame(animFrameRef.current);
        try {
          globe._destructor?.();
        } catch (_) {}
      };
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = (el as any).__cleanup;
      if (c) c();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Camera mode handler (called every frame) ─────────────────────────────
  const handleCameraMode = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const { cameraMode, selectedSatellite } = useStore.getState();

    if (cameraMode === "follow" && selectedSatellite) {
      // Smoothly follow selected satellite
      const { lat, lng, alt } = selectedSatellite.position;
      const targetAlt = Math.max(0.5, (alt / EARTH_RADIUS_KM) * 3.5);
      globe.pointOfView({ lat, lng, altitude: targetAlt }, 500);
    } else if (cameraMode === "topdown") {
      globe.pointOfView({ lat: 90, lng: 0, altitude: 2.2 }, 800);
    } else if (cameraMode === "iss_cockpit") {
      const iss = useStore
        .getState()
        .satellites.find((s) => s.category === "iss");
      if (iss) {
        const { lat, lng, alt } = iss.position;
        globe.pointOfView(
          { lat, lng, altitude: alt / EARTH_RADIUS_KM + 0.05 },
          300,
        );
      }
    } else if (cameraMode === "terminator") {
      // Follow the day/night terminator (sun direction projected onto Earth)
      const angle = sunAngleRef.current;
      const sunLng = (((angle * 180) / Math.PI) % 360) - 180;
      globe.pointOfView({ lat: 0, lng: sunLng, altitude: 2.0 }, 1000);
    } else if (cameraMode === "flythrough") {
      flythroughRef.current += 0.0008;
      const t = flythroughRef.current;
      const lat = Math.sin(t * 0.7) * 40;
      const lng = ((t * 20) % 360) - 180;
      const alt = 1.8 + Math.sin(t * 1.3) * 0.4;
      globe.pointOfView({ lat, lng, altitude: alt }, 100);
    }
  }, []);

  // ── Auto-rotate ────────────────────────────────────────────────────────────
  useEffect(() => {
    const controls = globeRef.current?.controls?.();
    if (!controls) return;
    controls.autoRotate = globeAutoRotate && cameraMode === "free";
    controls.autoRotateSpeed = 0.25;
  }, [globeAutoRotate, cameraMode]);

  // ── Satellite dots ────────────────────────────────────────────────────────
  // Uses globe.gl pointsData — reliable, works regardless of init timing.
  // pointResolution(12) + small radius = crisp round dots like satellitemap.space
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const visible = satellites.filter((s) =>
      activeSatelliteCategories.has(s.category),
    );
    console.log("Visible satellites:", visible.length);

    const real = visible.filter((s) => s.tle1 && s.tle2);

    console.log("Real satellites:", real.length);
    console.log("First real satellite:", real[0]);

    globe
      .pointsData(
        visible.filter(
          (s) =>
            Number.isFinite(s.position.lat) &&
            Number.isFinite(s.position.lng) &&
            Number.isFinite(s.position.alt),
        ),
      )
      .pointLat((d: object) => (d as SatelliteData).position.lat)
      .pointLng((d: object) => (d as SatelliteData).position.lng)
      .pointAltitude((d: object) =>
        Math.min((d as SatelliteData).position.alt / EARTH_RADIUS_KM, 0.15),
      )
      .pointColor((d: object) => {
        const sat = d as SatelliteData;
        return sat.id === selectedSatellite?.id ? "#FFFFFF" : sat.color;
      })
      .pointRadius(0.28)
      .pointResolution(32) // high enough for round dots, not bars
      .pointsMerge(false)
      .pointLabel((d: object) => buildTooltip(d as SatelliteData))
      .onPointClick((d: object) => {
        const sat = d as SatelliteData;
        setSelectedSatellite(selectedSatellite?.id === sat.id ? null : sat);
      })
      .onPointHover((d: object | null) => {
        if (containerRef.current)
          containerRef.current.style.cursor = d ? "pointer" : "default";
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satellites, activeSatelliteCategories, selectedSatellite]);

  // ── Orbit trail ────────────────────────────────────────────────────────────
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (!selectedSatellite || !showOrbits) {
      globe.pathsData([]);
      return;
    }
    const pts = computeOrbitArc(selectedSatellite);
    globe
      .pathsData([{ points: pts, color: selectedSatellite.color }])
      .pathPoints("points")
      .pathPointLat((p: object) => (p as number[])[0])
      .pathPointLng((p: object) => (p as number[])[1])
      .pathPointAlt((p: object) => (p as number[])[2] / EARTH_RADIUS_KM)
      .pathColor((d: object) => {
        const pd = d as { color: string };
        return [
          pd.color + "00",
          pd.color + "55",
          pd.color + "BB",
          pd.color + "FF",
        ];
      })
      .pathStroke(1.5)
      .pathDashLength(0.05)
      .pathDashGap(0.008)
      .pathDashAnimateTime(8000);
  }, [selectedSatellite, showOrbits, simTime]);

  // ── Ground stations ────────────────────────────────────────────────────────
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (!showGroundStations) {
      globe.labelsData([]);
      return;
    }
    globe
      .labelsData(groundStations)
      .labelLat((d: object) => (d as GroundStation).lat)
      .labelLng((d: object) => (d as GroundStation).lng)
      .labelAltitude(0.002)
      .labelText((d: object) => (d as GroundStation).name.slice(0, 22))
      .labelSize(0.4)
      .labelColor((d: object) => (d as GroundStation).color)
      .labelDotRadius(0.4)
      .labelDotOrientation(() => "top" as const)
      .labelResolution(2);
  }, [groundStations, showGroundStations]);

  // ── Coverage rings ─────────────────────────────────────────────────────────
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (!selectedSatellite || !showBeams) {
      globe.ringsData([]);
      return;
    }
    const h = selectedSatellite.altitude,
      R = EARTH_RADIUS_KM;
    globe
      .ringsData([
        {
          lat: selectedSatellite.position.lat,
          lng: selectedSatellite.position.lng,
          maxR: (Math.acos(R / (R + h)) * 180) / Math.PI,
          propagationSpeed: 1.5,
          repeatPeriod: 1400,
          color: selectedSatellite.color,
        },
      ])
      .ringColor((d: object) => {
        const rd = d as { color: string };
        return (t: number) =>
          `${rd.color}${Math.round((1 - t) * 0xbb)
            .toString(16)
            .padStart(2, "0")}`;
      })
      .ringMaxRadius("maxR")
      .ringPropagationSpeed("propagationSpeed")
      .ringRepeatPeriod("repeatPeriod");
  }, [selectedSatellite, showBeams]);

  // ── Starlink mesh — safe linear scan, max 120 links ─────────────────────
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (!showConstellation) {
      globe.arcsData([]);
      return;
    }

    // Sort by lat so nearby satellites are sequential — O(n log n) not O(n²)
    const sl = satellites
      .filter((s) => s.category === "starlink")
      .sort((a, b) => a.position.lat - b.position.lat)
      .slice(0, 60); // only 60 sats for the mesh

    const links: object[] = [];
    // Only link each sat to its immediate neighbors in the sorted list
    for (let i = 0; i < sl.length - 1 && links.length < 120; i++) {
      const a = sl[i],
        b = sl[i + 1];
      links.push({
        startLat: a.position.lat,
        startLng: a.position.lng,
        endLat: b.position.lat,
        endLng: b.position.lng,
        startAlt: a.position.alt / EARTH_RADIUS_KM,
        endAlt: b.position.alt / EARTH_RADIUS_KM,
      });
    }

    globe
      .arcsData(links)
      .arcStartLat("startLat")
      .arcStartLng("startLng")
      .arcEndLat("endLat")
      .arcEndLng("endLng")
      .arcAltitude(0.04)
      .arcColor(() => ["#00D4FF22", "#00D4FFaa"])
      .arcStroke(0.3)
      .arcDashLength(0.5)
      .arcDashGap(0.3)
      .arcDashAnimateTime(4000);
  }, [satellites, showConstellation]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "#000005",
      }}
    />
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildTooltip(sat: SatelliteData): string {
  return `<div style="background:rgba(2,4,10,0.97);border:1px solid ${sat.color}55;border-radius:8px;padding:10px 14px;font-family:'JetBrains Mono',monospace;color:${sat.color};font-size:11px;line-height:1.75;min-width:170px;box-shadow:0 0 24px ${sat.color}22;pointer-events:none;">
    <div style="font-weight:700;font-size:12px;color:#fff;margin-bottom:5px">${sat.name}</div>
    <div>ALT <b>${Math.round(sat.altitude).toLocaleString()} km</b></div>
    <div>LAT ${sat.position.lat.toFixed(2)}°  LNG ${sat.position.lng.toFixed(2)}°</div>
    <div>SPD ${sat.velocity.speed.toFixed(2)} km/s</div>
    <div style="margin-top:5px;opacity:0.45;font-size:9px">${sat.category.toUpperCase()} · NORAD #${sat.noradId}</div>
  </div>`;
}

function computeOrbitArc(sat: SatelliteData): number[][] {
  if (!sat.tle1 || !sat.tle2) return keplerianArc(sat);
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const satrec = (SatLib as any).twoline2satrec(sat.tle1, sat.tle2);
    const now = new Date(),
      period = sat.period * 60 * 1000;
    const pts: number[][] = [];
    for (let i = 0; i <= 180; i++) {
      const t = new Date(now.getTime() - period / 2 + (i / 180) * period);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pv = (SatLib as any).propagate(satrec, t);
      if (!pv.position || typeof pv.position === "boolean") continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gmst = (SatLib as any).gstime(t);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const geo = (SatLib as any).eciToGeodetic(pv.position, gmst);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pts.push([
        (SatLib as any).degreesLat(geo.latitude),
        (SatLib as any).degreesLong(geo.longitude),
        geo.height / 6371,
      ]);
    }
    return pts;
  } catch {
    return keplerianArc(sat);
  }
}

function keplerianArc(sat: SatelliteData): number[][] {
  const inc = (sat.inclination * Math.PI) / 180;
  return Array.from({ length: 181 }, (_, i) => {
    const a = (i / 180) * 2 * Math.PI - Math.PI;
    const lat = (Math.asin(Math.sin(inc) * Math.sin(a)) * 180) / Math.PI;
    const lng =
      ((sat.position.lng +
        (Math.atan2(Math.cos(inc) * Math.sin(a), Math.cos(a)) * 180) / Math.PI +
        180) %
        360) -
      180;
    return [lat, lng, sat.altitude];
  });
}
