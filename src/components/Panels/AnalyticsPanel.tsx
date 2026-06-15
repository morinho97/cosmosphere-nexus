import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../types';
import type { SatelliteCategory } from '../../types';

const CATEGORIES: SatelliteCategory[] = ['starlink', 'gps', 'galileo', 'glonass', 'weather', 'scientific', 'communication', 'iss'];

export default function AnalyticsPanel() {
  const { activeView, satellites, conjunctions } = useStore();
  if (activeView !== 'analytics') return null;

  const categoryBreakdown = CATEGORIES.map(cat => ({
    cat,
    count: satellites.filter(s => s.category === cat).length,
    color: CATEGORY_COLORS[cat],
    label: CATEGORY_LABELS[cat],
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...categoryBreakdown.map(c => c.count));

  const leoCount = satellites.filter(s => s.altitude < 2000).length;
  const meoCount = satellites.filter(s => s.altitude >= 2000 && s.altitude < 20000).length;
  const geoCount = satellites.filter(s => s.altitude >= 20000).length;

  const avgAlt = satellites.length > 0
    ? satellites.reduce((s, sat) => s + sat.altitude, 0) / satellites.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-16 right-4 w-72 z-40 space-y-3"
      style={{ pointerEvents: 'auto' }}
    >
      <Panel title="Orbital Distribution">
        <div className="space-y-2">
          {categoryBreakdown.map(({ cat, count, color, label }) => (
            <div key={cat}>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span style={{ color }}>{label}</span>
                <span className="text-gray-400">{count}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 6px ${color}66` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Altitude Zones">
        <div className="grid grid-cols-3 gap-2">
          <AltZone label="LEO" sublabel="< 2,000 km" count={leoCount} color="#00D4FF" />
          <AltZone label="MEO" sublabel="2k–20k km" count={meoCount} color="#F59E0B" />
          <AltZone label="GEO+" sublabel="> 20,000 km" count={geoCount} color="#8B5CF6" />
        </div>
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-600 font-mono">Average Altitude</div>
          <div className="text-cosmos-plasma font-mono font-bold text-lg">{Math.round(avgAlt).toLocaleString()} km</div>
        </div>
      </Panel>

      <Panel title="Conjunction Alerts">
        <div className="space-y-2">
          {conjunctions.map(c => (
            <div
              key={c.id}
              className="p-2 rounded-lg text-xs font-mono"
              style={{
                background: getSeverityColor(c.severity) + '15',
                border: `1px solid ${getSeverityColor(c.severity)}33`,
              }}
            >
              <div className="flex justify-between mb-1">
                <span style={{ color: getSeverityColor(c.severity) }} className="uppercase text-xs tracking-wider">
                  {c.severity}
                </span>
                <span className="text-gray-500">{(c.probability * 100).toExponential(2)}%</span>
              </div>
              <div className="text-gray-300 truncate">{c.sat1}</div>
              <div className="text-gray-500 truncate">× {c.sat2}</div>
              <div className="text-gray-600 mt-1">
                Distance: {c.distance.toFixed(1)} km · In {formatTimeToEvent(c.time)}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </motion.div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(4,13,26,0.96)',
        border: '1px solid rgba(0,212,255,0.12)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">{title}</div>
      {children}
    </div>
  );
}

function AltZone({ label, sublabel, count, color }: { label: string; sublabel: string; count: number; color: string }) {
  return (
    <div
      className="text-center p-2 rounded-lg"
      style={{ background: `${color}10`, border: `1px solid ${color}22` }}
    >
      <div className="font-display text-base font-bold" style={{ color }}>{count}</div>
      <div className="font-mono text-xs text-white mt-0.5">{label}</div>
      <div className="font-mono text-gray-600" style={{ fontSize: '9px' }}>{sublabel}</div>
    </div>
  );
}

function getSeverityColor(s: string) {
  return s === 'critical' ? '#ff3d3d' : s === 'high' ? '#ff6b35' : s === 'medium' ? '#F59E0B' : '#39FF14';
}

function formatTimeToEvent(d: Date) {
  const diff = d.getTime() - Date.now();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
