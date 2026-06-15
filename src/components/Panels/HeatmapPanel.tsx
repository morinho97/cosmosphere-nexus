/**
 * HeatmapPanel — Legend and controls for the satellite density heatmap overlay.
 * The heatmap itself is rendered inside globe.gl via hexPolygonsData / heatmapsData.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Info } from 'lucide-react';
import { useStore } from '../../store';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../types';
import type { SatelliteCategory } from '../../types';

const HEATMAP_CATEGORIES: SatelliteCategory[] = ['starlink', 'gps', 'weather', 'scientific', 'communication'];

export default function HeatmapPanel() {
  const { showHeatmap, toggleFeature, satellites, activeSatelliteCategories } = useStore();

  // Compute density buckets per latitude band (10° steps)
  const latBuckets: number[] = Array(18).fill(0);
  satellites
    .filter(s => activeSatelliteCategories.has(s.category))
    .forEach(s => {
      const bucket = Math.floor((s.position.lat + 90) / 10);
      const idx = Math.max(0, Math.min(17, bucket));
      latBuckets[idx]++;
    });
  const maxBucket = Math.max(...latBuckets, 1);

  return (
    <AnimatePresence>
      {showHeatmap && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: 'spring', damping: 24, stiffness: 200 }}
          className="absolute bottom-20 right-4 z-40"
          style={{ width: '260px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', borderRadius: '12px' }}
        >
          <div
            className="rounded-xl"
            style={{
              background: 'rgba(4,13,26,0.97)',
              border: '1px solid rgba(255,107,53,0.2)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,107,53,0.1)' }}
            >
              <div className="flex items-center gap-2">
                <Layers size={13} style={{ color: '#FF6B35' }} />
                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Density Map</span>
              </div>
              <button
                onClick={() => toggleFeature('showHeatmap')}
                className="text-gray-600 hover:text-gray-400 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Latitude density histogram */}
              <div>
                <div className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-3">
                  Satellite Density by Latitude
                </div>
                <div className="space-y-1">
                  {latBuckets.map((count, i) => {
                    const latMin = i * 10 - 90;
                    const latMax = latMin + 10;
                    const pct = count / maxBucket;
                    const color = pct > 0.7 ? '#EF4444' : pct > 0.4 ? '#F59E0B' : '#00D4FF';
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span
                          className="text-gray-700 font-mono flex-shrink-0 text-right"
                          style={{ fontSize: '9px', width: '52px' }}
                        >
                          {latMin}° – {latMax}°
                        </span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${color}88, ${color})`,
                              boxShadow: pct > 0.5 ? `0 0 6px ${color}66` : 'none',
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.02 }}
                          />
                        </div>
                        <span
                          className="text-gray-600 font-mono flex-shrink-0"
                          style={{ fontSize: '9px', width: '30px', textAlign: 'right' }}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Colour scale legend */}
              <div>
                <div className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-2">
                  Colour Scale
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-mono" style={{ fontSize: '10px' }}>Low</span>
                  <div
                    className="flex-1 h-3 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #00D4FF, #39FF14, #F59E0B, #EF4444)',
                    }}
                  />
                  <span className="text-gray-700 font-mono" style={{ fontSize: '10px' }}>High</span>
                </div>
              </div>

              {/* Category breakdown */}
              <div>
                <div className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-2">
                  By Category
                </div>
                <div className="space-y-1.5">
                  {HEATMAP_CATEGORIES.map(cat => {
                    const count = satellites.filter(s => s.category === cat).length;
                    if (count === 0) return null;
                    const total = satellites.length || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: CATEGORY_COLORS[cat] }}
                        />
                        <span className="text-gray-400 font-mono text-xs flex-1">
                          {CATEGORY_LABELS[cat]}
                        </span>
                        <span className="text-gray-600 font-mono" style={{ fontSize: '10px' }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info note */}
              <div
                className="flex gap-2 p-2.5 rounded-lg"
                style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.15)' }}
              >
                <Info size={11} style={{ color: '#FF6B35', flexShrink: 0, marginTop: 1 }} />
                <p className="text-gray-600 font-mono leading-relaxed" style={{ fontSize: '10px' }}>
                  Density peaks near 53° and 97° latitude correspond to the Starlink and
                  sun-synchronous polar shell inclinations respectively.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
