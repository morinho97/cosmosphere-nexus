import { create } from 'zustand';
import type { AppState, SatelliteData, SatelliteCategory, ConjunctionAlert, SpaceWeatherData, SustainabilityMetrics, CameraMode, ActiveView } from '../types';
import { GROUND_STATIONS } from '../data/groundStations';
import { UPCOMING_LAUNCHES } from '../data/launches';

const MOCK_SPACE_WEATHER: SpaceWeatherData = {
  kpIndex: 3.3,
  solarFlux: 142,
  solarWindSpeed: 487,
  protonFlux: 0.8,
  xrayClass: 'C2.1',
  auroraStrength: 'moderate',
  stormLevel: 'none',
  radBeltActive: false,
  updated: new Date(),
};

const MOCK_SUSTAINABILITY: SustainabilityMetrics = {
  totalObjects: 27686,
  activeSatellites: 8965,
  deadSatellites: 3420,
  debrisFragments: 14800,
  rocketBodies: 2270,
  orbitalPollutionScore: 68,
  annualLaunchRate: 2847,
  annualDeorbitRate: 890,
  kesslerRiskLevel: 'medium',
  cleanSpaceScore: 34,
};

export const useStore = create<AppState>((set) => ({
  // Satellites
  satellites: [],
  selectedSatellite: null,
  activeSatelliteCategories: new Set<SatelliteCategory>(['iss', 'starlink', 'gps', 'galileo', 'glonass', 'weather', 'scientific', 'communication']),
  isLoading: true,
  loadingProgress: 0,

  // Time
  simTime: new Date(),
  timeOffset: 0,
  isPlaying: true,
  playSpeed: 1,

  // UI flags
  showSidebar: true,
  showInfoPanel: false,
  showFilters: false,
  showTimeMachine: false,
  showDebris: false,
  showGroundStations: true,
  showHeatmap: false,
  showOrbits: false,
  showBeams: false,
  showConstellation: false,
  showSpaceWeather: false,
  showTraffic: false,
  showSustainability: false,
  activeView: 'globe',

  // Globe / camera
  globeAutoRotate: true,
  globePointOfView: { lat: 20, lng: 0, altitude: 2.5 },
  cameraMode: 'free',

  // Data
  conjunctions: generateMockConjunctions(),
  groundStations: GROUND_STATIONS,
  launches: UPCOMING_LAUNCHES,
  spaceWeather: MOCK_SPACE_WEATHER,
  sustainabilityMetrics: MOCK_SUSTAINABILITY,

  // Stats
  totalSatellites: 0,
  visibleSatellites: 0,
  fps: 60,

  // ── Actions ──────────────────────────────────────────────────────────────
  setSatellites: (sats) => set({ satellites: sats, totalSatellites: sats.length }),

  setSelectedSatellite: (sat) => set({
    selectedSatellite: sat,
    showInfoPanel: !!sat,
    globeAutoRotate: sat ? false : useStore.getState().globeAutoRotate,
  }),

  toggleCategory: (cat) => set((state) => {
    const next = new Set(state.activeSatelliteCategories);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    return { activeSatelliteCategories: next };
  }),

  setTimeOffset: (offset) => set({
    timeOffset: offset,
    simTime: new Date(Date.now() + offset * 3_600_000),
  }),

  setIsPlaying:     (playing) => set({ isPlaying: playing }),
  setPlaySpeed:     (speed)   => set({ playSpeed: speed }),
  toggleSidebar:    ()        => set((s) => ({ showSidebar: !s.showSidebar })),
  setShowInfoPanel: (show)    => set({ showInfoPanel: show }),
  setActiveView:    (view)    => set({ activeView: view }),
  setFps:           (fps)     => set({ fps }),
  setLoadingProgress: (p)     => set({ loadingProgress: p }),
  setIsLoading:     (loading) => set({ isLoading: loading }),
  setCameraMode:    (mode)    => set({ cameraMode: mode }),

  toggleFeature: (feature) => set((state) => ({
    ...state,
    [feature]: !((state as unknown) as Record<string, unknown>)[feature],
  })),

  setGlobeAutoRotate: (v) => set({ globeAutoRotate: v }),
}));

// ── Mock data generators ──────────────────────────────────────────────────────

function generateMockConjunctions(): ConjunctionAlert[] {
  return [
    { id: '1', sat1: 'STARLINK-1234',  sat2: 'COSMOS 2251 DEB', probability: 0.0023,  distance: 4.2,  time: new Date(Date.now() + 2   * 3_600_000), severity: 'medium'   },
    { id: '2', sat1: 'ISS (ZARYA)',    sat2: 'SL-16 R/B',       probability: 0.00008, distance: 12.1, time: new Date(Date.now() + 8   * 3_600_000), severity: 'low'      },
    { id: '3', sat1: 'STARLINK-5678',  sat2: 'IRIDIUM 33 DEB',  probability: 0.0145,  distance: 1.8,  time: new Date(Date.now() + 0.5 * 3_600_000), severity: 'critical' },
    { id: '4', sat1: 'ONEWEB-0234',   sat2: 'FENGYUN DEB',     probability: 0.0031,  distance: 3.6,  time: new Date(Date.now() + 4   * 3_600_000), severity: 'high'     },
    { id: '5', sat1: 'GPS IIF-10',    sat2: 'BREEZE-M DEB',    probability: 0.00012, distance: 18.4, time: new Date(Date.now() + 12  * 3_600_000), severity: 'low'      },
  ];
}
