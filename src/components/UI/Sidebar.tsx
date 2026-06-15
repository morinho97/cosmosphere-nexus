/**
 * Sidebar — Cosmosphere Nexus navigation hub.
 * 8 views: Globe, Command, Traffic, Weather, Sustainability,
 * Constellations, Launches, Alerts.
 * + Layer toggles + live stats footer.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe2, Layers, Clock, Radio, AlertTriangle, Rocket,
  BarChart3, ChevronLeft, ChevronRight, Activity, Leaf,
  Network, Sun, Shield, Satellite, Wifi, Map, Trash2, Cpu,
} from 'lucide-react';
import { useStore } from '../../store';
import type { SatelliteCategory, ActiveView } from '../../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../types';

const CATEGORIES: SatelliteCategory[] = [
  'iss', 'starlink', 'gps', 'galileo', 'glonass', 'weather', 'scientific', 'communication',
];

interface NavItem {
  id: ActiveView;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  accent?: string;
}

export default function Sidebar() {
  const {
    showSidebar, toggleSidebar, activeView, setActiveView,
    activeSatelliteCategories, toggleCategory,
    totalSatellites, fps, conjunctions, satellites,
    showGroundStations, showOrbits, showBeams, showConstellation,
    showDebris, showHeatmap, showSpaceWeather, showTraffic,
    toggleFeature, spaceWeather,
  } = useStore();

  const criticalAlerts = conjunctions.filter(c => c.severity === 'critical' || c.severity === 'high').length;
  const stormAlert = spaceWeather.kpIndex >= 5 ? 1 : 0;

  const navItems: NavItem[] = [
    { id: 'globe',          icon: <Globe2 size={16} />,      label: 'Globe',          accent: '#00D4FF' },
    { id: 'command',        icon: <Cpu size={16} />,          label: 'Mission Ctrl',   accent: '#A855F7' },
    { id: 'traffic',        icon: <Activity size={16} />,     label: 'Traffic',        accent: '#39FF14' },
    { id: 'weather',        icon: <Sun size={16} />,          label: 'Space Weather',  accent: '#FF6B35', badge: stormAlert },
    { id: 'sustainability', icon: <Leaf size={16} />,         label: 'Sustainability', accent: '#39FF14' },
    { id: 'constellations', icon: <Network size={16} />,      label: 'Constellations', accent: '#00D4FF' },
    { id: 'launches',       icon: <Rocket size={16} />,       label: 'Launches',       accent: '#FF6B35' },
    { id: 'alerts',         icon: <AlertTriangle size={16} />,label: 'Alerts',         accent: '#ff3d3d', badge: criticalAlerts },
  ];

  const categoryCounts = CATEGORIES.map(cat => ({
    cat,
    count: satellites.filter(s => s.category === cat).length,
  }));

  return (
    <>
      {/* Toggle tab */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -translate-y-1/2 z-50 w-5 h-10 flex items-center justify-center transition-all hover:scale-110"
        style={{
          left: showSidebar ? '256px' : 0,
          background: 'rgba(0,212,255,0.1)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderLeft: 'none',
          borderRadius: '0 6px 6px 0',
          color: '#00D4FF',
          transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: 'auto',
        }}
      >
        {showSidebar ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute left-0 top-0 bottom-0 w-64 z-40 flex flex-col"
            style={{
              background: 'linear-gradient(180deg, rgba(4,13,26,0.98) 0%, rgba(2,4,8,0.99) 100%)',
              borderRight: '1px solid rgba(0,212,255,0.1)',
              backdropFilter: 'blur(24px)',
              pointerEvents: 'auto',
            }}
          >
            {/* ── Logo ── */}
            <div className="p-5 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #0a3060 0%, #001830 100%)',
                      border: '1px solid rgba(0,212,255,0.25)',
                      boxShadow: '0 0 20px rgba(0,212,255,0.08)',
                    }}
                  >
                    <Globe2 size={18} className="text-cosmos-plasma" />
                  </div>
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                    style={{ background: '#39FF14', boxShadow: '0 0 8px #39FF14' }}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <div className="text-white font-display font-black text-sm tracking-[0.2em]">
                    COSMO<span className="text-cosmos-plasma">SPHERE</span>
                  </div>
                  <div className="text-gray-600 font-mono tracking-widest" style={{ fontSize: '9px' }}>
                    NEXUS · ORBITAL INTELLIGENCE
                  </div>
                </div>
              </div>
            </div>

            {/* ── Navigation ── */}
            <div className="p-2 border-b border-white/5 flex-shrink-0">
              {navItems.map(item => {
                const active = activeView === item.id;
                const accent = item.accent ?? '#00D4FF';
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 relative group transition-all"
                    style={{
                      background: active ? `${accent}12` : 'transparent',
                      border: `1px solid ${active ? accent + '30' : 'transparent'}`,
                      color: active ? accent : '#555',
                    }}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                        style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
                      />
                    )}
                    <span className="pl-1">{item.icon}</span>
                    <span className="font-mono text-xs tracking-wider uppercase flex-1 text-left">
                      {item.label}
                    </span>
                    {item.badge && item.badge > 0 ? (
                      <motion.span
                        className="text-xs px-1.5 py-0.5 rounded-full font-mono"
                        style={{
                          background: `${item.accent}25`,
                          color: item.accent,
                          border: `1px solid ${item.accent}44`,
                        }}
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {item.badge}
                      </motion.span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* ── Satellite filters ── */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs text-gray-600 uppercase tracking-widest font-mono">Satellites</span>
                <span className="text-cosmos-plasma text-xs font-mono font-bold">{totalSatellites.toLocaleString()}</span>
              </div>

              {categoryCounts.map(({ cat, count }) => {
                const active = activeSatelliteCategories.has(cat);
                const color = CATEGORY_COLORS[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-xs transition-all hover:bg-white/5"
                    style={{ opacity: active ? 1 : 0.35 }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: color, boxShadow: active ? `0 0 5px ${color}` : 'none' }}
                    />
                    <span className="font-mono text-gray-300 flex-1 text-left">{CATEGORY_LABELS[cat]}</span>
                    <span className="font-mono text-gray-600">{count}</span>
                    <div
                      className="w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: active ? color + '88' : '#333',
                        background: active ? color + '22' : 'transparent',
                      }}
                    >
                      {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
                    </div>
                  </button>
                );
              })}

              {/* ── Layer toggles ── */}
              <div className="flex items-center justify-between px-1 mt-5 mb-2">
                <span className="text-xs text-gray-600 uppercase tracking-widest font-mono">Layers</span>
              </div>
              <LayerToggle icon={<Wifi size={11} />}    label="Starlink Mesh"    value={showConstellation}  onClick={() => toggleFeature('showConstellation')}  color="#00D4FF" />
              <LayerToggle icon={<Radio size={11} />}   label="Ground Stations"  value={showGroundStations} onClick={() => toggleFeature('showGroundStations')}  color="#8B5CF6" />
              <LayerToggle icon={<Activity size={11} />}label="Orbit Trails"     value={showOrbits}         onClick={() => toggleFeature('showOrbits')}          color="#39FF14" />
              <LayerToggle icon={<Map size={11} />}     label="Coverage Rings"   value={showBeams}          onClick={() => toggleFeature('showBeams')}           color="#F59E0B" />
              <LayerToggle icon={<Trash2 size={11} />}  label="Debris Field"     value={showDebris}         onClick={() => toggleFeature('showDebris')}          color="#6B7280" />
              <LayerToggle icon={<Layers size={11} />}  label="Density Heatmap"  value={showHeatmap}        onClick={() => toggleFeature('showHeatmap')}         color="#FF6B35" />
            </div>

            {/* ── Footer stats ── */}
            <div
              className="p-3 flex-shrink-0 border-t border-white/5"
              style={{ background: 'rgba(0,0,0,0.25)' }}
            >
              <div className="grid grid-cols-4 gap-1">
                <FooterStat label="FPS"    value={fps.toString()}         color={fps >= 50 ? '#39FF14' : '#F59E0B'} />
                <FooterStat label="SATs"   value={totalSatellites > 999 ? `${(totalSatellites/1000).toFixed(1)}k` : totalSatellites.toString()} color="#00D4FF" />
                <FooterStat label="ALRTS"  value={criticalAlerts.toString()} color={criticalAlerts > 0 ? '#ff3d3d' : '#555'} />
                <FooterStat label="Kp"     value={useStore.getState().spaceWeather.kpIndex.toFixed(1)} color={useStore.getState().spaceWeather.kpIndex >= 5 ? '#FF6B35' : '#39FF14'} />
              </div>
              <div className="text-gray-800 font-mono text-center mt-2" style={{ fontSize: '8px' }}>
                COSMOSPHERE NEXUS v2.0
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LayerToggle({
  icon, label, value, onClick, color,
}: {
  icon: React.ReactNode; label: string; value: boolean; onClick: () => void; color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-xs transition-all hover:bg-white/5"
      style={{ opacity: value ? 1 : 0.4 }}
    >
      <span style={{ color: value ? color : '#555' }}>{icon}</span>
      <span className="font-mono text-gray-400 flex-1 text-left">{label}</span>
      <div
        className="w-8 h-4 rounded-full relative flex-shrink-0 transition-all"
        style={{ background: value ? `${color}33` : 'rgba(255,255,255,0.05)', border: `1px solid ${value ? color + '55' : '#333'}` }}
      >
        <motion.div
          className="absolute top-0.5 w-3 h-3 rounded-full"
          animate={{ left: value ? 'calc(100% - 14px)' : '2px' }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{ background: value ? color : '#444', boxShadow: value ? `0 0 5px ${color}` : 'none' }}
        />
      </div>
    </button>
  );
}

function FooterStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="font-mono font-bold text-xs" style={{ color }}>{value}</div>
      <div className="text-gray-700 font-mono" style={{ fontSize: '8px' }}>{label}</div>
    </div>
  );
}
