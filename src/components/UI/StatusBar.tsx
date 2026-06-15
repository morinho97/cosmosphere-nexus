import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { Activity } from 'lucide-react';

export default function StatusBar() {
  const { simTime, fps, totalSatellites, satellites, activeSatelliteCategories, conjunctions, spaceWeather, activeView } = useStore();

  const visibleCount = satellites.filter(s => activeSatelliteCategories.has(s.category)).length;
  const criticalAlerts = conjunctions.filter(c => c.severity === 'critical' || c.severity === 'high').length;
  const VIEW_LABELS: Record<string, string> = {
    globe: 'Globe View', command: 'Mission Control', traffic: 'Orbital Traffic',
    weather: 'Space Weather', sustainability: 'Sustainability', constellations: 'Constellation Intel',
    launches: 'Launch Schedule', alerts: 'Alerts', analytics: 'Analytics',
  };

  return (
    <div
      className="flex items-center gap-5 px-4 py-1.5"
      style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(2,4,8,0.95) 100%)',
        borderTop: '1px solid rgba(0,212,255,0.06)',
        pointerEvents: 'none',
        minHeight: '32px',
      }}
    >
      {/* Live pulse */}
      <div className="flex items-center gap-1.5">
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#39FF14', boxShadow: '0 0 6px #39FF14' }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <span className="text-xs font-mono text-gray-600 uppercase tracking-wider">LIVE</span>
      </div>

      {/* UTC */}
      <span className="text-xs font-mono text-gray-700">
        {simTime.toISOString().replace('T', ' ').slice(0, 19)} UTC
      </span>

      {/* Active view */}
      <span className="text-xs font-mono" style={{ color: '#00D4FF44' }}>
        {VIEW_LABELS[activeView] ?? activeView}
      </span>

      <div className="flex-1" />

      {/* Stats row */}
      <Stat label="Tracking" value={`${visibleCount.toLocaleString()} / ${totalSatellites.toLocaleString()}`} color="#00D4FF" />
      <Stat label="Kp" value={spaceWeather.kpIndex.toFixed(1)} color={spaceWeather.kpIndex >= 5 ? '#FF6B35' : '#39FF14'} />
      <Stat label="FPS" value={fps.toString()} color={fps >= 50 ? '#39FF14' : fps >= 30 ? '#F59E0B' : '#EF4444'} />
      {criticalAlerts > 0 && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Stat label="ALERTS" value={criticalAlerts.toString()} color="#ff3d3d" />
        </motion.div>
      )}

      <span className="text-gray-800 font-mono hidden md:block" style={{ fontSize: '10px' }}>
        COSMOSPHERE NEXUS v2.0 · Three.js · satellite.js · CelesTrak
      </span>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      <span className="text-gray-700 uppercase tracking-wider" style={{ fontSize: '9px' }}>{label}</span>
      <span className="font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
