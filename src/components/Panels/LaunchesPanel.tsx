import { motion } from 'framer-motion';
import { Rocket, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';

export default function LaunchesPanel() {
  const { activeView, launches } = useStore();
  if (activeView !== 'launches') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-16 right-4 w-80 z-40"
      style={{
        background: 'rgba(4,13,26,0.96)',
        border: '1px solid rgba(0,212,255,0.12)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        pointerEvents: 'auto',
      }}
    >
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <Rocket size={14} className="text-cosmos-solar" />
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Upcoming Launches</span>
      </div>

      <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
        {launches.map((launch, i) => (
          <motion.div
            key={launch.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-3 rounded-xl transition-all cursor-pointer group hover:bg-white/5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-mono font-semibold truncate">{launch.name}</div>
                <div className="text-cosmos-solar text-xs font-mono opacity-80 mt-0.5">{launch.vehicle}</div>
              </div>
              <StatusBadge status={launch.status} />
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs font-mono">
                <MapPin size={10} />
                <span className="truncate">{launch.site}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs font-mono">
                <Calendar size={10} />
                <span>{formatLaunchDate(launch.date)}</span>
                <span className="text-gray-700 ml-1">· {getCountdown(launch.date)}</span>
              </div>
            </div>

            <p className="text-gray-600 text-xs mt-2 leading-relaxed line-clamp-2">{launch.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    upcoming: { bg: '#00D4FF15', border: '#00D4FF33', text: '#00D4FF' },
    active: { bg: '#39FF1420', border: '#39FF1455', text: '#39FF14' },
    completed: { bg: '#ffffff10', border: '#ffffff20', text: '#888' },
  }[status] ?? { bg: '#00D4FF15', border: '#00D4FF33', text: '#00D4FF' };

  return (
    <span
      className="text-xs font-mono px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0"
      style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
    >
      {status}
    </span>
  );
}

function formatLaunchDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCountdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Launched';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `T-${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `T-${hours}h ${mins}m`;
}
