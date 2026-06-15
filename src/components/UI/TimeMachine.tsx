import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useStore } from '../../store';

export default function TimeMachine() {
  const { showTimeMachine, timeOffset, setTimeOffset, simTime, toggleFeature, setIsPlaying, isPlaying } = useStore();

  const snapPoints = [-24, -12, -6, -3, -1, 0, 1, 3, 6, 12, 24];

  return (
    <AnimatePresence>
      {showTimeMachine && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[560px]"
        >
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(4,13,26,0.97)',
              border: '1px solid rgba(0,212,255,0.25)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 0 60px rgba(0,212,255,0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-cosmos-plasma" />
                <span className="text-xs font-mono text-cosmos-plasma uppercase tracking-widest">Time Machine</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white text-xs font-mono">
                  {simTime.toUTCString().replace(' GMT', '')}
                </span>
                <button onClick={() => toggleFeature('showTimeMachine')} className="text-gray-600 hover:text-gray-400">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="relative">
              <input
                type="range"
                min={-24}
                max={24}
                step={0.25}
                value={timeOffset}
                onChange={e => setTimeOffset(parseFloat(e.target.value))}
                className="w-full accent-cosmos-plasma cursor-pointer"
                style={{ height: '4px' }}
              />
              {/* Tick marks */}
              <div className="flex justify-between mt-2">
                {snapPoints.map(p => (
                  <button
                    key={p}
                    onClick={() => setTimeOffset(p)}
                    className="text-xs font-mono transition-all hover:scale-110"
                    style={{ color: p === timeOffset ? '#00D4FF' : p === 0 ? '#666' : '#444', fontSize: '10px' }}
                  >
                    {p === 0 ? 'NOW' : `${p > 0 ? '+' : ''}${p}h`}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick presets */}
            <div className="flex gap-2 mt-4">
              {[
                { label: '−24h', value: -24 },
                { label: '−12h', value: -12 },
                { label: '−6h', value: -6 },
                { label: 'NOW', value: 0 },
                { label: '+6h', value: 6 },
                { label: '+12h', value: 12 },
                { label: '+24h', value: 24 },
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => setTimeOffset(p.value)}
                  className="flex-1 py-1.5 text-xs font-mono rounded-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: timeOffset === p.value ? 'rgba(0,212,255,0.18)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${timeOffset === p.value ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: timeOffset === p.value ? '#00D4FF' : p.value === 0 ? '#aaa' : '#666',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {timeOffset !== 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-center text-xs font-mono"
                style={{ color: timeOffset > 0 ? '#39FF14' : '#ff6b6b' }}
              >
                {timeOffset > 0
                  ? `↗ Predicting +${timeOffset}h into the future`
                  : `↙ Replaying ${Math.abs(timeOffset)}h ago`}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
