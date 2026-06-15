import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Clock } from 'lucide-react';
import { useStore } from '../../store';

export default function AlertsPanel() {
  const { activeView, conjunctions } = useStore();
  if (activeView !== 'alerts') return null;

  const sorted = [...conjunctions].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-16 right-4 w-80 z-40"
      style={{
        background: 'rgba(4,13,26,0.96)',
        border: '1px solid rgba(255,61,61,0.2)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        pointerEvents: 'auto',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
      }}
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Conjunction Alerts</span>
        </div>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,61,61,0.2)', color: '#ff3d3d', border: '1px solid rgba(255,61,61,0.3)' }}
        >
          {conjunctions.length} active
        </span>
      </div>

      <div className="p-3 space-y-3">
        {sorted.map((c, i) => {
          const color = getSeverityColor(c.severity);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-3 rounded-xl"
              style={{
                background: `${color}08`,
                border: `1px solid ${color}25`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                  animate={c.severity === 'critical' ? { opacity: [1, 0.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color }}>
                  {c.severity} risk
                </span>
                <span className="ml-auto text-gray-600 text-xs font-mono">
                  {(c.probability * 100).toFixed(4)}%
                </span>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <div className="text-gray-300 font-semibold truncate">{c.sat1}</div>
                <div className="text-gray-500 flex items-center gap-1">
                  <Zap size={8} style={{ color }} />
                  <span className="truncate">{c.sat2}</span>
                </div>
              </div>

              <div className="mt-2 flex gap-3 text-xs font-mono text-gray-600">
                <span>⟷ {c.distance.toFixed(1)} km</span>
                <span className="flex items-center gap-1">
                  <Clock size={9} />
                  In {formatCountdown(c.time)}
                </span>
              </div>

              {c.severity === 'critical' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs font-mono p-2 rounded text-center"
                  style={{ background: 'rgba(255,61,61,0.15)', color: '#ff3d3d' }}
                >
                  ⚠ IMMEDIATE MANEUVER RECOMMENDED
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function getSeverityColor(s: string) {
  return s === 'critical' ? '#ff3d3d' : s === 'high' ? '#ff6b35' : s === 'medium' ? '#F59E0B' : '#39FF14';
}

function formatCountdown(d: Date) {
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return 'NOW';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
