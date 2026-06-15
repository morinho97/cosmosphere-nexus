// ─────────────────────────────────────────────────────────────────────────────
//  Cosmosphere Nexus — Core TypeScript types
// ─────────────────────────────────────────────────────────────────────────────

// ── Satellite ─────────────────────────────────────────────────────────────────

export interface TLEData {
  name: string;
  tle1: string;
  tle2: string;
}

export interface SatellitePosition {
  lat: number;
  lng: number;
  alt: number; // km above surface
}

export interface SatelliteVelocity {
  x: number;
  y: number;
  z: number;
  speed: number; // km/s
}

export interface SatelliteData {
  id: string;
  name: string;
  noradId: number;
  category: SatelliteCategory;
  tle1: string;
  tle2: string;
  position: SatellitePosition;
  velocity: SatelliteVelocity;
  inclination: number;
  altitude: number; // km
  period: number;   // minutes
  operator?: string;
  country?: string;
  launchDate?: string;
  missionType?: string;
  color: string;
  status?: 'active' | 'dead' | 'debris';
  riskScore?: number; // 0-100
}

export type SatelliteCategory =
  | 'iss'
  | 'starlink'
  | 'gps'
  | 'galileo'
  | 'glonass'
  | 'weather'
  | 'scientific'
  | 'communication'
  | 'debris'
  | 'rocket_body';

// ── Space Weather ─────────────────────────────────────────────────────────────

export interface SpaceWeatherData {
  kpIndex: number;           // 0–9 geomagnetic activity
  solarFlux: number;         // F10.7 cm solar flux
  solarWindSpeed: number;    // km/s
  protonFlux: number;        // particles/cm²/s
  xrayClass: string;         // 'A', 'B', 'C', 'M', 'X' + magnitude
  auroraStrength: 'none' | 'low' | 'moderate' | 'strong' | 'severe';
  stormLevel: 'none' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5';
  radBeltActive: boolean;
  updated: Date;
}

export interface RadiationZone {
  id: string;
  name: string;
  altMin: number;
  altMax: number;
  latMin: number;
  latMax: number;
  intensity: number; // 0-1
  color: string;
}

// ── Orbital Traffic ───────────────────────────────────────────────────────────

export interface OrbitalHighway {
  id: string;
  name: string;
  altKm: number;
  width: number;      // km
  density: number;    // 0-1 congestion
  color: string;
  satCount: number;
}

export interface TrafficCorridor {
  altMin: number;
  altMax: number;
  density: number;
  label: string;
}

// ── Sustainability ────────────────────────────────────────────────────────────

export interface SustainabilityMetrics {
  totalObjects: number;
  activeSatellites: number;
  deadSatellites: number;
  debrisFragments: number;
  rocketBodies: number;
  orbitalPollutionScore: number; // 0-100 (higher = worse)
  annualLaunchRate: number;
  annualDeorbitRate: number;
  kesslerRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  cleanSpaceScore: number; // 0-100 (higher = better)
}

// ── Constellation ─────────────────────────────────────────────────────────────

export interface ConstellationInfo {
  id: string;
  name: string;
  operator: string;
  category: SatelliteCategory;
  color: string;
  totalPlanned: number;
  deployed: number;
  operational: number;
  altitude: number;
  inclination: number;
  purpose: string;
  coverage: string;
  firstLaunch: string;
  description: string;
}

// ── Camera Modes ──────────────────────────────────────────────────────────────

export type CameraMode =
  | 'free'
  | 'follow'        // lock to selected satellite
  | 'flythrough'    // cinematic auto-tour
  | 'topdown'       // polar view
  | 'terminator'    // track day/night line
  | 'iss_cockpit';  // ISS perspective

// ── Ground Station / Launch / Conjunction ────────────────────────────────────

export interface GroundStation {
  id: string;
  name: string;
  agency: string;
  lat: number;
  lng: number;
  type: 'NASA' | 'ESA' | 'ISRO' | 'Starlink' | 'Other';
  color: string;
}

export interface LaunchEvent {
  id: string;
  name: string;
  vehicle: string;
  site: string;
  lat: number;
  lng: number;
  date: string;
  status: 'upcoming' | 'active' | 'completed';
  description: string;
}

export interface ConjunctionAlert {
  id: string;
  sat1: string;
  sat2: string;
  probability: number;
  distance: number;
  time: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ── App State ─────────────────────────────────────────────────────────────────

export type ActiveView =
  | 'globe'
  | 'analytics'
  | 'launches'
  | 'alerts'
  | 'weather'
  | 'traffic'
  | 'sustainability'
  | 'constellations'
  | 'command';

export interface AppState {
  // Satellites
  satellites: SatelliteData[];
  selectedSatellite: SatelliteData | null;
  activeSatelliteCategories: Set<SatelliteCategory>;
  isLoading: boolean;
  loadingProgress: number;

  // Time
  simTime: Date;
  timeOffset: number;
  isPlaying: boolean;
  playSpeed: number;

  // UI flags
  showSidebar: boolean;
  showInfoPanel: boolean;
  showFilters: boolean;
  showTimeMachine: boolean;
  showDebris: boolean;
  showGroundStations: boolean;
  showHeatmap: boolean;
  showOrbits: boolean;
  showBeams: boolean;
  showConstellation: boolean;
  showSpaceWeather: boolean;
  showTraffic: boolean;
  showSustainability: boolean;
  activeView: ActiveView;

  // Globe
  globeAutoRotate: boolean;
  globePointOfView: { lat: number; lng: number; altitude: number };
  cameraMode: CameraMode;

  // Data
  conjunctions: ConjunctionAlert[];
  groundStations: GroundStation[];
  launches: LaunchEvent[];
  spaceWeather: SpaceWeatherData;
  sustainabilityMetrics: SustainabilityMetrics;

  // Stats
  totalSatellites: number;
  visibleSatellites: number;
  fps: number;

  // Actions
  setSatellites: (sats: SatelliteData[]) => void;
  setSelectedSatellite: (sat: SatelliteData | null) => void;
  toggleCategory: (cat: SatelliteCategory) => void;
  setTimeOffset: (offset: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaySpeed: (speed: number) => void;
  toggleSidebar: () => void;
  setShowInfoPanel: (show: boolean) => void;
  setActiveView: (view: ActiveView) => void;
  setFps: (fps: number) => void;
  setLoadingProgress: (p: number) => void;
  setIsLoading: (loading: boolean) => void;
  toggleFeature: (feature: string) => void;
  setGlobeAutoRotate: (v: boolean) => void;
  setCameraMode: (mode: CameraMode) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<SatelliteCategory, string> = {
  iss:           '#FFD700',
  starlink:      '#00D4FF',
  gps:           '#39FF14',
  galileo:       '#FF6B35',
  glonass:       '#FF3D9A',
  weather:       '#A855F7',
  scientific:    '#F59E0B',
  communication: '#06B6D4',
  debris:        '#6B7280',
  rocket_body:   '#EF4444',
};

export const CATEGORY_LABELS: Record<SatelliteCategory, string> = {
  iss:           'ISS',
  starlink:      'Starlink',
  gps:           'GPS',
  galileo:       'Galileo',
  glonass:       'GLONASS',
  weather:       'Weather',
  scientific:    'Scientific',
  communication: 'Comms',
  debris:        'Debris',
  rocket_body:   'Rocket Bodies',
};
