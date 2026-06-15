import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, RotateCcw, Play, Pause, ChevronRight, Bell, Zap } from 'lucide-react';
import { useStore } from '../../store';
import { useState } from 'react';

export default function TopBar() {
  const {
    simTime, timeOffset, isPlaying, setIsPlaying,
    showTimeMachine, toggleFeature, globeAutoRotate, setGlobeAutoRotate,
    conjunctions, satellites, playSpeed, setPlaySpeed,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof satellites>([]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchResults(
      satellites.filter(s =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.noradId.toString().includes(q)
      ).slice(0, 7)
    );
  };

  const criticalCount = conjunctions.filter(c => c.severity === 'critical').length;

  const speeds = [0.25, 0.5, 1, 2, 5, 10, 30, 60];
  const speedIdx = speeds.indexOf(playSpeed);

  return (
    <div
      className="absolute top-4 left-4 right-4 z-50 flex items-center gap-2"
      style={{ pointerEvents: 'none' }}
    >
      {/* ── Search ── */}
      <div className="relative flex-1 max-w-xs" style={{ pointerEvents: 'auto' }}>
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hud-corners"
          style={{
            background: 'rgba(4,13,26,0.93)',
            border: '1px solid rgba(0,212,255,0.18)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Search size={13} className="text-gray-600 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search satellite, NORAD ID..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="bg-transparent text-white outline-none placeholder-gray-700 flex-1 font-mono text-xs"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="text-gray-700 hover:text-gray-400 font-mono text-xs">✕</button>
          )}
        </div>
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full mt-1.5 left-0 right-0 rounded-xl overflow-hidden z-50"
              style={{
                background: 'rgba(4,13,26,0.99)',
                border: '1px solid rgba(0,212,255,0.18)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {searchResults.map(sat => (
                <button
                  key={sat.id}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                  onClick={() => {
                    useStore.getState().setSelectedSatellite(sat);
                    setSearchQuery(''); setSearchResults([]);
                  }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: sat.color, boxShadow: `0 0 5px ${sat.color}` }} />
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-white text-xs font-mono truncate">{sat.name}</div>
                    <div className="text-gray-600 font-mono" style={{ fontSize: '10px' }}>
                      #{sat.noradId} · {Math.round(sat.altitude).toLocaleString()} km · {sat.category}
                    </div>
                  </div>
                  <ChevronRight size={11} className="text-gray-700 flex-shrink-0" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Time display ── */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{
          background: 'rgba(4,13,26,0.93)',
          border: '1px solid rgba(0,212,255,0.13)',
          backdropFilter: 'blur(20px)',
          pointerEvents: 'auto',
        }}
      >
        <Clock size={12} className="text-cosmos-plasma flex-shrink-0" />
        <span className="text-white font-mono text-xs leading-none">
          {simTime.toISOString().replace('T', ' ').slice(0, 19)} UTC
        </span>
        {timeOffset !== 0 && (
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded font-bold"
            style={{
              background: timeOffset > 0 ? 'rgba(57,255,20,0.15)' : 'rgba(255,61,61,0.15)',
              color: timeOffset > 0 ? '#39FF14' : '#ff3d3d',
            }}
          >
            {timeOffset > 0 ? '+' : ''}{timeOffset}h
          </span>
        )}
      </div>

      {/* ── Playback controls ── */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 rounded-xl"
        style={{
          background: 'rgba(4,13,26,0.93)',
          border: '1px solid rgba(0,212,255,0.13)',
          backdropFilter: 'blur(20px)',
          pointerEvents: 'auto',
        }}
      >
        <IconBtn
          icon={isPlaying ? <Pause size={13} /> : <Play size={13} />}
          label={isPlaying ? 'Pause' : 'Play'}
          onClick={() => setIsPlaying(!isPlaying)}
          active={isPlaying} color="#39FF14"
        />
        <IconBtn
          icon={<Clock size={13} />}
          label="Time Machine"
          onClick={() => toggleFeature('showTimeMachine')}
          active={showTimeMachine} color="#00D4FF"
        />
        <IconBtn
          icon={<RotateCcw size={13} />}
          label="Auto-rotate"
          onClick={() => setGlobeAutoRotate(!globeAutoRotate)}
          active={globeAutoRotate} color="#F59E0B"
        />
        {/* Speed display */}
        <div className="flex items-center gap-1 px-2 border-l border-white/10 ml-1">
          <button
            onClick={() => speedIdx > 0 && setPlaySpeed(speeds[speedIdx - 1])}
            className="text-gray-600 hover:text-gray-300 font-mono text-xs transition-colors"
          >−</button>
          <span className="text-gray-400 font-mono text-xs w-8 text-center">
            {playSpeed < 1 ? `${playSpeed}×` : `${playSpeed}×`}
          </span>
          <button
            onClick={() => speedIdx < speeds.length - 1 && setPlaySpeed(speeds[speedIdx + 1])}
            className="text-gray-600 hover:text-gray-300 font-mono text-xs transition-colors"
          >+</button>
        </div>
      </div>

      {/* ── Critical alert bell ── */}
      {criticalCount > 0 && (
        <motion.button
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="relative p-2.5 rounded-xl"
          style={{
            background: 'rgba(255,61,61,0.14)',
            border: '1px solid rgba(255,61,61,0.4)',
            color: '#ff3d3d',
            pointerEvents: 'auto',
          }}
          onClick={() => useStore.getState().setActiveView('alerts')}
        >
          <Bell size={14} />
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold"
            style={{ background: '#ff3d3d', color: 'white', fontSize: '9px' }}
          >
            {criticalCount}
          </span>
        </motion.button>
      )}
    </div>
  );
}

function IconBtn({ icon, label, onClick, active, color }: {
  icon: React.ReactNode; label: string; onClick: () => void; active?: boolean; color?: string;
}) {
  return (
    <button
      onClick={onClick} title={label}
      className="px-2 py-1.5 rounded-lg text-xs transition-all hover:scale-105 active:scale-95"
      style={{
        background: active ? `${color || '#00D4FF'}18` : 'transparent',
        color: active ? (color || '#00D4FF') : '#555',
        border: active ? `1px solid ${color || '#00D4FF'}33` : '1px solid transparent',
      }}
    >
      {icon}
    </button>
  );
}
