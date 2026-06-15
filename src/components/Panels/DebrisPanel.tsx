/**
 * DebrisPanel — Space debris statistics & visualisation legend.
 * When showDebris is active this panel renders alongside the globe.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Circle } from 'lucide-react';
import { useStore } from '../../store';

interface DebrisBand {
  label: string;
  altRange: string;
  count: number;
  color: string;
  description: string;
}

const DEBRIS_BANDS: DebrisBand[] = [
  {
    label: 'LEO Fragment Cloud',
    altRange: '300–800 km',
    count: 14_800,
    color: '#EF4444',
    description: 'Primarily from Fengyun-1C ASAT test (2007) and Iridium-Cosmos collision (2009). Densest debris band in Earth orbit.',
  },
  {
    label: 'Rocket Bodies',
    altRange: '200–36,000 km',
    count: 2_270,
    color: '#F59E0B',
    description: 'Expended upper stages from launches spanning 1957–present. Many are tumbling and uncontrolled.',
  },
  {
    label: 'Mission-related Debris',
    altRange: '450–1,200 km',
    count: 9_900,
    color: '#8B5CF6',
    description: 'Clamp bands, lens covers, explosive bolts, and paint flakes. Smallest trackable fragments ~10 cm.',
  },
  {
    label: 'GEO Graveyard',
    altRange: '36,100–36,500 km',
    count: 870,
    color: '#6B7280',
    description: 'Retired GEO satellites boosted to "disposal orbit" 300 km above GEO. Will remain for millions of years.',
  },
];

const STATS = [
  { label: 'Trackable objects (≥10 cm)', value: '27,000+', color: '#EF4444' },
  { label: 'Estimated fragments ≥1 cm', value: '~500,000', color: '#F59E0B' },
  { label: 'Fragments ≥1 mm', value: '>100 million', color: '#8B5CF6' },
  { label: 'Combined mass in orbit', value: '~9,300 t', color: '#6B7280' },
];

export default function DebrisPanel() {
  const { showDebris, toggleFeature } = useStore();

  return (
    <AnimatePresence>
      {showDebris && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: 'spring', damping: 24, stiffness: 200 }}
          className="absolute top-16 right-4 w-76 z-40"
          style={{ width: '300px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', borderRadius: '12px' }}
        >
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'rgba(4,13,26,0.97)',
              border: '1px solid rgba(239,68,68,0.2)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 40px rgba(239,68,68,0.06)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}
            >
              <div className="flex items-center gap-2">
                <Trash2 size={13} style={{ color: '#EF4444' }} />
                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Space Debris</span>
              </div>
              <button
                onClick={() => toggleFeature('showDebris')}
                className="text-gray-600 hover:text-gray-400 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            {/* Stats grid */}
            <div className="p-4 grid grid-cols-2 gap-2">
              {STATS.map(s => (
                <div
                  key={s.label}
                  className="p-2.5 rounded-lg"
                  style={{ background: `${s.color}0a`, border: `1px solid ${s.color}20` }}
                >
                  <div className="font-mono font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-gray-600 font-mono mt-0.5 leading-tight" style={{ fontSize: '9px' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Debris bands */}
            <div className="px-4 pb-4 space-y-2">
              <div className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-3">Debris Populations</div>
              {DEBRIS_BANDS.map((band, i) => (
                <motion.div
                  key={band.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="p-3 rounded-lg"
                  style={{
                    background: `${band.color}08`,
                    border: `1px solid ${band.color}25`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Circle size={7} style={{ color: band.color, fill: band.color, flexShrink: 0 }} />
                      <span className="text-xs font-mono font-semibold" style={{ color: band.color }}>
                        {band.label}
                      </span>
                    </div>
                    <span
                      className="text-xs font-mono font-bold flex-shrink-0"
                      style={{ color: band.color }}
                    >
                      {band.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-600 font-mono mb-1" style={{ fontSize: '10px' }}>
                    {band.altRange}
                  </div>
                  <p className="text-gray-500 font-mono leading-relaxed" style={{ fontSize: '10px' }}>
                    {band.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Kessler warning */}
            <div
              className="mx-4 mb-4 p-3 rounded-lg"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#EF4444', boxShadow: '0 0 6px #EF4444' }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs font-mono font-bold text-red-400">Kessler Syndrome Risk</span>
              </div>
              <p className="text-gray-500 font-mono leading-relaxed" style={{ fontSize: '10px' }}>
                If debris density in LEO exceeds a critical threshold, collisions will generate
                more debris faster than decay can remove it — creating a runaway cascade. 
                Current estimates: 2040–2060 risk window without debris removal.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
