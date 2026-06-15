# Cosmosphere Nexus — Architecture

## Directory Structure

```
src/
├── components/
│   ├── Effects/          # Background visual FX
│   │   ├── AuroraEffect.tsx      # Canvas aurora borealis
│   │   ├── CosmicDust.tsx        # Drifting space particles
│   │   └── ShootingStars.tsx     # Occasional shooting stars
│   │
│   ├── Globe/            # Core 3D globe
│   │   └── GlobeComponent.tsx    # globe.gl wrapper + Three.js enhancements
│   │
│   ├── Panels/           # View panels (right side)
│   │   ├── AIInsightsPanel.tsx   # AI heuristic orbital analysis
│   │   ├── AlertsPanel.tsx       # Conjunction alerts feed
│   │   ├── AnalyticsPanel.tsx    # Orbital distribution charts
│   │   ├── CommandCenter.tsx     # Mission control dashboard
│   │   ├── ConstellationExplorer.tsx  # Network topology visualizer
│   │   ├── DebrisPanel.tsx       # Space debris statistics
│   │   ├── HeatmapPanel.tsx      # Density heatmap legend
│   │   ├── LaunchesPanel.tsx     # Upcoming launch schedule
│   │   ├── OrbitalTrafficPanel.tsx   # Highway congestion
│   │   ├── SatelliteInfoPanel.tsx    # Selected satellite telemetry
│   │   ├── SpaceWeatherPanel.tsx     # Solar/geomagnetic data
│   │   └── SustainabilityPanel.tsx   # Debris & Kessler risk
│   │
│   └── UI/               # Chrome / navigation
│       ├── CameraControls.tsx    # Cinematic mode selector
│       ├── LoadingScreen.tsx     # Animated boot sequence
│       ├── Sidebar.tsx           # 8-view navigation hub
│       ├── StatusBar.tsx         # Bottom telemetry bar
│       ├── TimeMachine.tsx       # ±24h time slider
│       └── TopBar.tsx            # Search + playback controls
│
├── data/                 # Static reference data
│   ├── constellations.ts         # 8 constellation definitions
│   ├── groundStations.ts         # 18 ground stations (NASA/ESA/ISRO/SpaceX)
│   └── launches.ts               # Upcoming launch events
│
├── hooks/                # React hooks
│   ├── useGlobeClock.ts          # RAF-based position updater
│   ├── useKeyboardShortcuts.ts   # Global key bindings
│   ├── useSatellites.ts          # TLE fetch + store hydration
│   └── useTimeSimulation.ts      # Sim clock driver
│
├── services/
│   └── satelliteService.ts       # CelesTrak TLE fetch + SGP4 propagation
│
├── shaders/              # GLSL shader strings
│   ├── atmosphere.frag.ts        # Rayleigh scattering rim glow
│   ├── atmosphere.vert.ts        # Normal-based vertex shader
│   ├── orbitTrail.ts             # Fading animated trail
│   └── stars.ts                  # Size-attenuated star points
│
├── store/
│   └── index.ts                  # Zustand global state
│
├── types/
│   └── index.ts                  # All TypeScript interfaces
│
└── utils/
    └── index.ts                  # Math/formatting helpers

## Data Flow

CelesTrak TLE ──► satelliteService.ts ──► Zustand store
                                             │
                    useGlobeClock ◄──────────┤
                    (RAF position updates)    │
                                             ▼
                                    GlobeComponent.tsx
                                    (globe.gl renderer)

## State Management (Zustand)

Single flat store with:
- satellites[]           — live propagated positions
- selectedSatellite      — currently focused object
- simTime / timeOffset   — simulation clock
- activeSatelliteCategories — visible filter set
- activeView             — which panel is shown
- spaceWeather           — solar/geomagnetic data
- sustainabilityMetrics  — debris statistics
- conjunctions[]         — collision alerts
- Feature flags          — showOrbits, showBeams, etc.

## Performance Strategy

1. **Instanced rendering** — globe.gl uses Three.js Points (GPU-batched)
2. **Propagation batching** — positions updated every 800ms via RAF loop
3. **Category filtering** — only visible categories sent to renderer
4. **Lazy loading** — AIInsightsPanel code-split into separate chunk
5. **CJS bundle** — globe.gl loaded as CommonJS to avoid ESM/WebGPU conflicts
