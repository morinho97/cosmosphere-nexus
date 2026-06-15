import { lazy, Suspense } from 'react';
import GlobeComponent from './components/Globe/GlobeComponent';
import Sidebar from './components/UI/Sidebar';
import TopBar from './components/UI/TopBar';
import StatusBar from './components/UI/StatusBar';
import TimeMachine from './components/UI/TimeMachine';
import LoadingScreen from './components/UI/LoadingScreen';
import CameraControls from './components/UI/CameraControls';
import SatelliteInfoPanel from './components/Panels/SatelliteInfoPanel';
import AnalyticsPanel from './components/Panels/AnalyticsPanel';
import LaunchesPanel from './components/Panels/LaunchesPanel';
import AlertsPanel from './components/Panels/AlertsPanel';
import DebrisPanel from './components/Panels/DebrisPanel';
import HeatmapPanel from './components/Panels/HeatmapPanel';
import SpaceWeatherPanel from './components/Panels/SpaceWeatherPanel';
import OrbitalTrafficPanel from './components/Panels/OrbitalTrafficPanel';
import SustainabilityPanel from './components/Panels/SustainabilityPanel';
import ConstellationExplorer from './components/Panels/ConstellationExplorer';
import CommandCenter from './components/Panels/CommandCenter';
import AuroraEffect from './components/Effects/AuroraEffect';
import ShootingStars from './components/Effects/ShootingStars';
import CosmicDust from './components/Effects/CosmicDust';
import { useSatellites } from './hooks/useSatellites';
import { useGlobeClock } from './hooks/useGlobeClock';
import { useTimeSimulation } from './hooks/useTimeSimulation';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useStore } from './store';

const AIInsightsPanel = lazy(() => import('./components/Panels/AIInsightsPanel'));

export default function App() {
  useSatellites();
  useTimeSimulation();
  useGlobeClock();
  useKeyboardShortcuts();

  const { showSidebar } = useStore();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-cosmos-void">
      {/* ── Background FX ── */}
      <CosmicDust />
      <ShootingStars />
      <AuroraEffect />

      {/* ── Globe ── */}
      <div className="absolute inset-0 z-10">
        <GlobeComponent />
      </div>

      {/* ── Loading ── */}
      <LoadingScreen />

      {/* ── UI Layer ── */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div style={{ pointerEvents: 'auto' }}>
          <Sidebar />
        </div>

        <div
          className="absolute top-0 right-0"
          style={{
            left: showSidebar ? '256px' : '0',
            transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: 'none',
          }}
        >
          <TopBar />
        </div>

        {/* All view panels — each self-guards with activeView check */}
        <SatelliteInfoPanel />
        <AnalyticsPanel />
        <LaunchesPanel />
        <AlertsPanel />
        <DebrisPanel />
        <HeatmapPanel />
        <SpaceWeatherPanel />
        <OrbitalTrafficPanel />
        <SustainabilityPanel />
        <ConstellationExplorer />
        <CommandCenter />

        <AIWrapper />
        <TimeMachine />
        <CameraControls />

        <div className="absolute bottom-0 left-0 right-0">
          <StatusBar />
        </div>
      </div>

      <KeyboardHint />
    </div>
  );
}

function AIWrapper() {
  const { activeView } = useStore();
  if (activeView !== 'analytics') return null;
  return (
    <div className="absolute bottom-20 right-4 w-72 z-40" style={{ pointerEvents: 'auto' }}>
      <Suspense fallback={
        <div className="h-32 rounded-xl animate-pulse"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }} />
      }>
        <AIInsightsPanel />
      </Suspense>
    </div>
  );
}

function KeyboardHint() {
  const { isLoading } = useStore();
  if (isLoading) return null;
  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{ animation: 'fadeInOut 7s ease forwards' }}
    >
      <style>{`
        @keyframes fadeInOut {
          0%   { opacity:0; transform:translateX(-50%) translateY(10px); }
          12%  { opacity:1; transform:translateX(-50%) translateY(0); }
          75%  { opacity:1; }
          100% { opacity:0; }
        }
      `}</style>
      <div
        className="px-5 py-2 rounded-full flex items-center gap-4"
        style={{
          background: 'rgba(4,13,26,0.9)',
          border: '1px solid rgba(0,212,255,0.12)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 30px rgba(0,212,255,0.06)',
        }}
      >
        {[['Space','play/pause'],['R','rotate'],['T','time'],['B','sidebar'],['1-8','views'],['Esc','deselect']].map(([k,v]) => (
          <span key={k} className="text-gray-600 font-mono" style={{ fontSize: '11px' }}>
            <span className="text-gray-400">{k}</span> {v}
          </span>
        ))}
      </div>
    </div>
  );
}
