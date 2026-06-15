/**
 * ConstellationExplorer — Interactive constellation intelligence panel.
 * Visualizes each major constellation with coverage maps, deployment status,
 * animated network topology, and technical specifications.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Satellite, Globe2, ChevronDown, ChevronUp, Signal } from 'lucide-react';
import { useStore } from '../../store';
import { CONSTELLATIONS } from '../../data/constellations';
import type { ConstellationInfo } from '../../types';

export default function ConstellationExplorer() {
  const { activeView, toggleCategory, activeSatelliteCategories } = useStore();
  const [selected, setSelected] = useState<string | null>('starlink');

  if (activeView !== 'constellations') return null;

  const selectedConstellation = CONSTELLATIONS.find(c => c.id === selected) ?? CONSTELLATIONS[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', damping: 24, stiffness: 200 }}
      className="absolute top-16 right-4 z-40 space-y-3"
      style={{ width: '300px', pointerEvents: 'auto', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', paddingBottom: '12px' }}
    >
      {/* Header */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(4,13,26,0.97)',
          border: '1px solid rgba(0,212,255,0.15)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Network size={13} className="text-cosmos-plasma" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
            Constellation Intelligence
          </span>
        </div>

        {/* Constellation selector grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {CONSTELLATIONS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono transition-all hover:scale-105 active:scale-95"
              style={{
                background: selected === c.id ? `${c.color}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selected === c.id ? c.color + '55' : 'rgba(255,255,255,0.07)'}`,
                color: selected === c.id ? c.color : '#666',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: c.color,
                  boxShadow: selected === c.id ? `0 0 5px ${c.color}` : 'none',
                }}
              />
              <span className="truncate">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected constellation detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedConstellation.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {/* Identity card */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'rgba(4,13,26,0.97)',
              border: `1px solid ${selectedConstellation.color}25`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background: `linear-gradient(135deg, ${selectedConstellation.color}12, transparent)`,
                borderBottom: `1px solid ${selectedConstellation.color}15`,
              }}
            >
              <div>
                <div className="text-white font-display font-bold text-sm tracking-wider">
                  {selectedConstellation.name}
                </div>
                <div className="text-gray-500 font-mono text-xs mt-0.5">
                  {selectedConstellation.operator}
                </div>
              </div>
              <OrbitAnimIcon color={selectedConstellation.color} />
            </div>

            <div className="p-4 space-y-3">
              {/* Deployment progress */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-gray-500">Deployment Progress</span>
                  <span style={{ color: selectedConstellation.color }}>
                    {selectedConstellation.deployed.toLocaleString()} / {selectedConstellation.totalPlanned.toLocaleString()}
                  </span>
                </div>
                <div className="relative h-2.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {/* Operational */}
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ background: selectedConstellation.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(selectedConstellation.operational / selectedConstellation.totalPlanned) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                  {/* Deployed but not operational */}
                  <motion.div
                    className="absolute top-0 h-full"
                    style={{
                      background: `${selectedConstellation.color}44`,
                      left: `${(selectedConstellation.operational / selectedConstellation.totalPlanned) * 100}%`,
                    }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((selectedConstellation.deployed - selectedConstellation.operational) / selectedConstellation.totalPlanned) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex gap-3 mt-1.5 text-xs font-mono">
                  <span style={{ color: selectedConstellation.color }}>
                    ● {selectedConstellation.operational.toLocaleString()} operational
                  </span>
                  <span style={{ color: `${selectedConstellation.color}88` }}>
                    ○ {(selectedConstellation.deployed - selectedConstellation.operational).toLocaleString()} commissioning
                  </span>
                </div>
              </div>

              {/* Orbital parameters */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Altitude', value: `${selectedConstellation.altitude.toLocaleString()} km` },
                  { label: 'Inclination', value: `${selectedConstellation.inclination}°` },
                  { label: 'Coverage', value: selectedConstellation.coverage, wide: true },
                  { label: 'First Launch', value: selectedConstellation.firstLaunch },
                ].map(item => (
                  <div
                    key={item.label}
                    className={`p-2 rounded-lg ${item.wide ? 'col-span-2' : ''}`}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="text-gray-600 font-mono" style={{ fontSize: '9px' }}>{item.label}</div>
                    <div className="text-white font-mono text-xs font-semibold mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Purpose badge */}
              <div className="flex items-center gap-2">
                <Signal size={10} style={{ color: selectedConstellation.color }} />
                <span
                  className="text-xs font-mono"
                  style={{ color: selectedConstellation.color }}
                >
                  {selectedConstellation.purpose}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-500 font-mono leading-relaxed" style={{ fontSize: '11px' }}>
                {selectedConstellation.description}
              </p>

              {/* Globe visibility toggle */}
              <button
                onClick={() => toggleCategory(selectedConstellation.category)}
                className="w-full py-2 rounded-lg text-xs font-mono transition-all hover:brightness-110 active:scale-98"
                style={{
                  background: activeSatelliteCategories.has(selectedConstellation.category)
                    ? `${selectedConstellation.color}20`
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeSatelliteCategories.has(selectedConstellation.category)
                    ? selectedConstellation.color + '55'
                    : 'rgba(255,255,255,0.08)'}`,
                  color: activeSatelliteCategories.has(selectedConstellation.category)
                    ? selectedConstellation.color
                    : '#666',
                }}
              >
                {activeSatelliteCategories.has(selectedConstellation.category)
                  ? '● Visible on Globe — Click to Hide'
                  : '○ Hidden — Click to Show on Globe'}
              </button>
            </div>
          </div>

          {/* Network topology visualization */}
          <NetworkTopologyCard constellation={selectedConstellation} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function NetworkTopologyCard({ constellation: c }: { constellation: ConstellationInfo }) {
  const nodes = Math.min(c.operational > 0 ? 12 : 6, 12);
  const nodePositions = Array.from({ length: nodes }, (_, i) => {
    const angle = (i / nodes) * Math.PI * 2;
    const r = 52 + (i % 3) * 14;
    return { x: 90 + Math.cos(angle) * r, y: 90 + Math.sin(angle) * r };
  });

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(4,13,26,0.97)',
        border: `1px solid ${c.color}18`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Globe2 size={12} style={{ color: c.color }} />
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
          Network Topology
        </span>
      </div>

      <div className="relative" style={{ height: '180px' }}>
        <svg viewBox="0 0 180 180" className="w-full h-full">
          {/* Earth */}
          <circle cx="90" cy="90" r="28" fill="url(#earthG)" />
          <circle cx="90" cy="90" r="28" fill="none" stroke={`${c.color}33`} strokeWidth="1" />
          {/* Atmosphere */}
          <circle cx="90" cy="90" r="32" fill="none" stroke={`${c.color}18`} strokeWidth="6" />

          {/* Orbit ring */}
          <ellipse
            cx="90" cy="90"
            rx={52 + 14}
            ry={(52 + 14) * Math.cos(c.inclination * Math.PI / 180) * 0.4 + 20}
            fill="none"
            stroke={`${c.color}20`}
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />

          {/* ISL links between nearby nodes */}
          {nodePositions.map((pos, i) => {
            const next = nodePositions[(i + 1) % nodes];
            const skip = nodePositions[(i + 2) % nodes];
            return (
              <g key={i}>
                <motion.line
                  x1={pos.x} y1={pos.y} x2={next.x} y2={next.y}
                  stroke={c.color}
                  strokeWidth="0.5"
                  strokeOpacity="0.25"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: i * 0.06 }}
                />
                {i % 3 === 0 && (
                  <motion.line
                    x1={pos.x} y1={pos.y} x2={skip.x} y2={skip.y}
                    stroke={c.color}
                    strokeWidth="0.4"
                    strokeOpacity="0.12"
                  />
                )}
              </g>
            );
          })}

          {/* Satellite nodes */}
          {nodePositions.map((pos, i) => (
            <motion.g key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.06 }}
            >
              <circle
                cx={pos.x} cy={pos.y} r="3.5"
                fill={c.color}
                style={{ filter: `drop-shadow(0 0 3px ${c.color})` }}
              />
              {/* Animated ping for first few nodes */}
              {i < 3 && (
                <motion.circle
                  cx={pos.x} cy={pos.y} r="3.5"
                  fill="none"
                  stroke={c.color}
                  strokeWidth="1"
                  animate={{ r: [3.5, 9, 3.5], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
                />
              )}
            </motion.g>
          ))}

          <defs>
            <radialGradient id="earthG" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#1a4070" />
              <stop offset="100%" stopColor="#020a18" />
            </radialGradient>
          </defs>
        </svg>

        {/* Animated signal sweep */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 70%, ${c.color}08 100%)`,
            borderRadius: '50%',
            width: '140px',
            height: '140px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="flex justify-between text-xs font-mono text-gray-600 mt-2">
        <span>{nodes} planes shown</span>
        <span style={{ color: c.color }}>{c.operational} active nodes</span>
      </div>
    </div>
  );
}

function OrbitAnimIcon({ color }: { color: string }) {
  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <circle cx="20" cy="20" r="6" fill={`${color}22`} stroke={color} strokeWidth="1" />
        <ellipse cx="20" cy="20" rx="16" ry="6"
          fill="none" stroke={`${color}44`} strokeWidth="1" strokeDasharray="2 2" />
        <motion.circle
          cx="36" cy="20" r="2.5"
          fill={color}
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          animate={{
            cx: [36, 20, 4, 20, 36],
            cy: [20, 14, 20, 26, 20],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}
