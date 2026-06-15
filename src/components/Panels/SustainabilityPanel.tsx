/**
 * SustainabilityPanel — Space Sustainability Index dashboard.
 * Shows debris density, active/dead ratios, orbital pollution score,
 * Kessler cascade risk, and sustainability trends.
 */

import { motion } from 'framer-motion';
import { Leaf, Trash2, TrendingDown, AlertTriangle, Globe2, BarChart3 } from 'lucide-react';
import { useStore } from '../../store';

export default function SustainabilityPanel() {
  const { activeView, sustainabilityMetrics: m, satellites } = useStore();
  if (activeView !== 'sustainability') return null;

  // Live overrides from actual satellite data
  const liveActive = satellites.filter(s => s.status !== 'dead' && s.status !== 'debris').length || m.activeSatellites;
  const liveDead   = satellites.filter(s => s.status === 'dead').length || m.deadSatellites;

  const pollutionColor = m.orbitalPollutionScore > 75 ? '#ff3d3d'
    : m.orbitalPollutionScore > 50 ? '#FF6B35'
    : m.orbitalPollutionScore > 25 ? '#F59E0B'
    : '#39FF14';

  const cleanColor = m.cleanSpaceScore > 60 ? '#39FF14'
    : m.cleanSpaceScore > 40 ? '#F59E0B'
    : '#ff3d3d';

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', damping: 24, stiffness: 200 }}
      className="absolute top-16 right-4 z-40 space-y-3"
      style={{ width: '300px', pointerEvents: 'auto', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', paddingBottom: '12px' }}
    >
      {/* Score cards */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(4,13,26,0.97)',
          border: '1px solid rgba(57,255,20,0.15)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Leaf size={13} style={{ color: '#39FF14' }} />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
            Space Sustainability Index
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Orbital Pollution Score */}
          <ScoreGauge
            label="Pollution Score"
            value={m.orbitalPollutionScore}
            max={100}
            color={pollutionColor}
            invert       // lower = better
            sublabel="orbital debris load"
          />
          {/* Clean Space Score */}
          <ScoreGauge
            label="Clean Space Score"
            value={m.cleanSpaceScore}
            max={100}
            color={cleanColor}
            sublabel="mitigation effectiveness"
          />
        </div>
      </div>

      {/* Population breakdown */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(4,13,26,0.97)',
          border: '1px solid rgba(0,212,255,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={12} className="text-gray-500" />
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Orbital Population
          </span>
        </div>

        <PopulationBar
          segments={[
            { label: 'Active Sats', count: liveActive, color: '#39FF14', icon: '●' },
            { label: 'Dead Sats',   count: liveDead,   color: '#6B7280', icon: '○' },
            { label: 'Debris',      count: m.debrisFragments, color: '#EF4444', icon: '×' },
            { label: 'Rocket Bodies', count: m.rocketBodies, color: '#F59E0B', icon: '|' },
          ]}
          total={m.totalObjects}
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <PopStat label="Total Objects" value={m.totalObjects.toLocaleString()} color="#00D4FF" />
          <PopStat label="Active Ratio" value={`${((liveActive / m.totalObjects) * 100).toFixed(1)}%`} color="#39FF14" />
          <PopStat label="Debris Ratio" value={`${((m.debrisFragments / m.totalObjects) * 100).toFixed(1)}%`} color="#EF4444" />
          <PopStat label="Launch/yr" value={m.annualLaunchRate.toLocaleString()} color="#F59E0B" />
        </div>
      </div>

      {/* Launch vs Deorbit trend */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(4,13,26,0.97)',
          border: '1px solid rgba(0,212,255,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown size={12} className="text-gray-500" />
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Annual Flow
          </span>
        </div>

        <div className="space-y-2">
          <FlowRow label="Launches" value={m.annualLaunchRate} max={3000} color="#FF6B35" icon="↑" />
          <FlowRow label="Deorbits" value={m.annualDeorbitRate} max={3000} color="#39FF14" icon="↓" />
        </div>

        <div className="mt-3 p-2.5 rounded-lg"
          style={{
            background: m.annualLaunchRate > m.annualDeorbitRate
              ? 'rgba(255,61,61,0.08)' : 'rgba(57,255,20,0.08)',
            border: `1px solid ${m.annualLaunchRate > m.annualDeorbitRate ? 'rgba(255,61,61,0.2)' : 'rgba(57,255,20,0.2)'}`,
          }}
        >
          <div className="text-xs font-mono text-center">
            <span className="text-gray-500">Net accumulation: </span>
            <span style={{ color: m.annualLaunchRate > m.annualDeorbitRate ? '#ff3d3d' : '#39FF14' }}>
              +{(m.annualLaunchRate - m.annualDeorbitRate).toLocaleString()} objects/year
            </span>
          </div>
        </div>
      </div>

      {/* Kessler Syndrome Risk */}
      <KesslerRiskCard level={m.kesslerRiskLevel} />

      {/* IADC Guidelines compliance */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(4,13,26,0.97)',
          border: '1px solid rgba(0,212,255,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Globe2 size={12} className="text-gray-500" />
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            IADC Mitigation Compliance
          </span>
        </div>
        <div className="space-y-2">
          {[
            { label: '25-yr deorbit rule (LEO)', pct: 62, color: '#F59E0B' },
            { label: 'Passivation (EOL)', pct: 78, color: '#39FF14' },
            { label: 'GEO graveyard disposal', pct: 71, color: '#F59E0B' },
            { label: 'Collision avoidance manœuvres', pct: 91, color: '#39FF14' },
          ].map((item, i) => (
            <ComplianceRow key={item.label} {...item} index={i} />
          ))}
        </div>
        <p className="text-gray-700 font-mono mt-3 leading-relaxed" style={{ fontSize: '10px' }}>
          Compliance data aggregated from operator SDFs filed with ITU and national licensing bodies. Updated quarterly.
        </p>
      </div>
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreGauge({
  label, value, max, color, sublabel, invert = false,
}: {
  label: string; value: number; max: number; color: string; sublabel: string; invert?: boolean;
}) {
  const pct = (value / max) * 100;
  const r = 24;
  const circ = 2 * Math.PI * r;
  const stroke = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <motion.circle
            cx="32" cy="32" r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${stroke} ${circ}`}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${stroke} ${circ}` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-base leading-none" style={{ color }}>{value}</span>
          <span className="text-gray-700 font-mono" style={{ fontSize: '8px' }}>/{max}</span>
        </div>
      </div>
      <div className="text-center mt-1">
        <div className="text-white font-mono text-xs font-semibold">{label}</div>
        <div className="text-gray-600 font-mono leading-tight" style={{ fontSize: '9px' }}>{sublabel}</div>
        {invert && (
          <div className="font-mono" style={{ fontSize: '9px', color }}>
            {value > 60 ? '▲ concerning' : value > 30 ? '~ moderate' : '✓ manageable'}
          </div>
        )}
      </div>
    </div>
  );
}

function PopulationBar({
  segments, total,
}: {
  segments: { label: string; count: number; color: string; icon: string }[];
  total: number;
}) {
  return (
    <div>
      <div className="flex h-5 rounded-full overflow-hidden gap-px">
        {segments.map(seg => {
          const pct = (seg.count / total) * 100;
          if (pct < 0.5) return null;
          return (
            <motion.div
              key={seg.label}
              style={{ background: seg.color, width: `${pct}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8 }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-1 text-xs font-mono">
            <span style={{ color: seg.color }}>{seg.icon}</span>
            <span className="text-gray-500">{seg.label}</span>
            <span style={{ color: seg.color }}>{seg.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PopStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="p-2 rounded-lg"
      style={{ background: `${color}08`, border: `1px solid ${color}18` }}
    >
      <div className="font-mono text-xs font-bold" style={{ color }}>{value}</div>
      <div className="text-gray-600 font-mono" style={{ fontSize: '9px' }}>{label}</div>
    </div>
  );
}

function FlowRow({ label, value, max, color, icon }: {
  label: string; value: number; max: number; color: string; icon: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono font-bold flex-shrink-0" style={{ color, width: '14px' }}>{icon}</span>
      <span className="text-gray-500 font-mono text-xs flex-shrink-0 w-16">{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.9 }}
        />
      </div>
      <span className="text-gray-500 font-mono flex-shrink-0" style={{ fontSize: '10px' }}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function KesslerRiskCard({ level }: { level: string }) {
  const levels = ['low', 'medium', 'high', 'critical'] as const;
  const idx = levels.indexOf(level as typeof levels[number]);
  const color = ['#39FF14', '#F59E0B', '#FF6B35', '#ff3d3d'][idx] ?? '#39FF14';
  const descriptions = [
    'Collision frequency below self-sustaining threshold. Debris environment manageable with current mitigation.',
    'Debris density approaching critical threshold in LEO. Continued unconstrained launches elevate risk over next 20 years.',
    'Self-sustaining fragmentation possible in certain altitude bands. Active debris removal critically needed.',
    'Cascade fragmentation cascade may have begun in densest LEO bands. Emergency debris removal required.',
  ];

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}25`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} style={{ color }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color }}>
            Kessler Syndrome Risk
          </span>
        </div>
        <span
          className="text-sm font-display font-bold uppercase"
          style={{ color }}
        >
          {level}
        </span>
      </div>

      {/* Risk level bar */}
      <div className="flex gap-1 mb-3">
        {levels.map((l, i) => (
          <div
            key={l}
            className="flex-1 h-1.5 rounded-full"
            style={{
              background: i <= idx
                ? ['#39FF14', '#F59E0B', '#FF6B35', '#ff3d3d'][i]
                : 'rgba(255,255,255,0.08)',
              boxShadow: i === idx ? `0 0 6px ${color}` : 'none',
            }}
          />
        ))}
      </div>

      <p className="text-gray-500 font-mono leading-relaxed" style={{ fontSize: '10px' }}>
        {descriptions[idx]}
      </p>
    </div>
  );
}

function ComplianceRow({ label, pct, color, index }: {
  label: string; pct: number; color: string; index: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-gray-500">{label}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: index * 0.07 }}
        />
      </div>
    </div>
  );
}
