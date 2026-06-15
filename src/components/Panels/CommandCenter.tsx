/**
 * CommandCenter — Mission Control Dashboard.
 * Full-width command center view showing system status, live telemetry,
 * orbital statistics, alerts, and space environment at a glance.
 */

import { motion } from 'framer-motion';
import { useStore } from '../../store';
import {
  Activity, Satellite, AlertTriangle, Globe2, Zap, Shield,
  TrendingUp, Radio, Clock, BarChart3, Cpu, Wifi,
} from 'lucide-react';
import { classifyOrbit, orbitalVelocity, formatUtc } from '../../utils';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../types';
import type { SatelliteCategory } from '../../types';

const ALL_CATEGORIES: SatelliteCategory[] = [
  'iss', 'starlink', 'gps', 'galileo', 'glonass', 'weather', 'scientific', 'communication',
];

export default function CommandCenter() {
  const { activeView, setActiveView } = useStore();
  if (activeView !== 'command') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', damping: 24, stiffness: 200 }}
      className="absolute inset-x-4 top-16 bottom-12 z-40 overflow-y-auto"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Back to Globe */}
      <div className="mb-3">
        <motion.button
          onClick={() => setActiveView('globe')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-semibold"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF', cursor: 'pointer' }}
        >
          <Globe2 size={13} />
          ← BACK TO GLOBE
        </motion.button>
      </div>
      <div className="grid grid-cols-12 gap-3 pb-4">
        {/* ── Row 1: System Status ─────────────────────────────── */}
        <SystemStatusBar />

        {/* ── Row 2: Main widgets ──────────────────────────────── */}
        <SatelliteFleetCard />
        <OrbitalEcosystemCard />
        <SpaceWeatherWidget />

        {/* ── Row 3: Alerts + Launch timeline ─────────────────── */}
        <AlertsFeed />
        <LaunchTimeline />
        <SustainabilityWidget />
      </div>
    </motion.div>
  );
}

// ── System Status Bar (full width) ───────────────────────────────────────────

function SystemStatusBar() {
  const { satellites, fps, simTime, conjunctions, spaceWeather } = useStore();
  const criticals = conjunctions.filter(c => c.severity === 'critical').length;

  const systems = [
    { label: 'TLE Feed', status: 'NOMINAL', color: '#39FF14' },
    { label: 'Propagation Engine', status: 'ACTIVE', color: '#39FF14' },
    { label: 'Collision Monitor', status: criticals > 0 ? 'ALERT' : 'NOMINAL', color: criticals > 0 ? '#ff3d3d' : '#39FF14' },
    { label: 'Space Weather', status: spaceWeather.stormLevel !== 'none' ? 'WARNING' : 'QUIET', color: spaceWeather.stormLevel !== 'none' ? '#F59E0B' : '#39FF14' },
    { label: 'Render Engine', status: `${fps} FPS`, color: fps >= 50 ? '#39FF14' : fps >= 30 ? '#F59E0B' : '#ff3d3d' },
    { label: 'Objects Tracked', status: satellites.length.toLocaleString(), color: '#00D4FF' },
  ];

  return (
    <div
      className="col-span-12 rounded-xl px-5 py-3 flex items-center justify-between gap-4"
      style={{
        background: 'rgba(4,13,26,0.97)',
        border: '1px solid rgba(0,212,255,0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo mark */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0a3060, #001830)', border: '1px solid #00D4FF33' }}
        >
          <Globe2 size={14} className="text-cosmos-plasma" />
        </div>
        <div>
          <div className="text-white font-display font-bold text-xs tracking-widest">NEXUS</div>
          <div className="text-cosmos-plasma font-mono" style={{ fontSize: '9px' }}>MISSION CTRL</div>
        </div>
      </div>

      <div className="h-5 border-l border-white/10 flex-shrink-0" />

      {/* Status indicators */}
      <div className="flex items-center gap-5 flex-1">
        {systems.map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }}
              animate={s.status === 'ALERT' ? { opacity: [1, 0.2, 1] } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <div>
              <div className="text-gray-600 font-mono" style={{ fontSize: '9px' }}>{s.label}</div>
              <div className="font-mono font-bold" style={{ fontSize: '10px', color: s.color }}>{s.status}</div>
            </div>
          </div>
        ))}
      </div>

      {/* UTC clock */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Clock size={11} className="text-gray-600" />
        <span className="text-white font-mono text-xs">{formatUtc(simTime)}</span>
      </div>
    </div>
  );
}

// ── Satellite Fleet Card ──────────────────────────────────────────────────────

function SatelliteFleetCard() {
  const { satellites, activeSatelliteCategories } = useStore();

  const breakdown = ALL_CATEGORIES.map(cat => ({
    cat,
    count: satellites.filter(s => s.category === cat).length,
    color: CATEGORY_COLORS[cat],
    label: CATEGORY_LABELS[cat],
    active: activeSatelliteCategories.has(cat),
  })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...breakdown.map(x => x.count), 1);

  return (
    <DashCard
      title="Satellite Fleet"
      icon={<Satellite size={13} />}
      color="#00D4FF"
      className="col-span-4"
    >
      <div className="space-y-2">
        {breakdown.slice(0, 7).map((item, i) => (
          <motion.div
            key={item.cat}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: item.color, opacity: item.active ? 1 : 0.3 }}
            />
            <span
              className="text-xs font-mono flex-shrink-0"
              style={{ color: item.active ? item.color : '#444', width: '60px' }}
            >
              {item.label}
            </span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${item.color}55, ${item.color})`,
                  opacity: item.active ? 1 : 0.25,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.count / maxCount) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.04 }}
              />
            </div>
            <span
              className="text-xs font-mono flex-shrink-0"
              style={{ color: item.active ? '#888' : '#333', width: '40px', textAlign: 'right' }}
            >
              {item.count.toLocaleString()}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs font-mono">
        <span className="text-gray-600">Total tracked</span>
        <span className="text-cosmos-plasma font-bold">{satellites.length.toLocaleString()}</span>
      </div>
    </DashCard>
  );
}

// ── Orbital Ecosystem ─────────────────────────────────────────────────────────

function OrbitalEcosystemCard() {
  const { satellites } = useStore();

  const leoCount = satellites.filter(s => s.altitude < 2000).length;
  const meoCount = satellites.filter(s => s.altitude >= 2000 && s.altitude < 20000).length;
  const geoCount = satellites.filter(s => s.altitude >= 20000).length;
  const total = satellites.length || 1;

  const avgAlt = satellites.length > 0
    ? satellites.reduce((s, sat) => s + sat.altitude, 0) / satellites.length : 550;
  const avgVel = orbitalVelocity(avgAlt);

  const regimes = [
    { label: 'LEO', subtitle: '< 2,000 km', count: leoCount, pct: leoCount / total, color: '#00D4FF' },
    { label: 'MEO', subtitle: '2k–20k km', count: meoCount, pct: meoCount / total, color: '#F59E0B' },
    { label: 'GEO+', subtitle: '> 20,000 km', count: geoCount, pct: geoCount / total, color: '#8B5CF6' },
  ];

  return (
    <DashCard
      title="Orbital Ecosystem"
      icon={<Globe2 size={13} />}
      color="#A855F7"
      className="col-span-4"
    >
      {/* Donut chart */}
      <div className="flex items-center gap-4">
        <DonutChart segments={regimes} size={80} />
        <div className="space-y-2 flex-1">
          {regimes.map(r => (
            <div key={r.label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                <div>
                  <div className="text-xs font-mono text-white font-semibold">{r.label}</div>
                  <div className="text-gray-600 font-mono" style={{ fontSize: '9px' }}>{r.subtitle}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold" style={{ color: r.color }}>
                  {r.count.toLocaleString()}
                </div>
                <div className="text-gray-600 font-mono" style={{ fontSize: '9px' }}>
                  {(r.pct * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
        <MiniMetric label="Avg Altitude" value={`${Math.round(avgAlt).toLocaleString()} km`} color="#A855F7" />
        <MiniMetric label="Avg Velocity" value={`${avgVel.toFixed(2)} km/s`} color="#A855F7" />
      </div>
    </DashCard>
  );
}

// ── Space Weather Widget ──────────────────────────────────────────────────────

function SpaceWeatherWidget() {
  const { spaceWeather: w } = useStore();
  const kpColor = w.kpIndex >= 5 ? '#ff3d3d' : w.kpIndex >= 3 ? '#F59E0B' : '#39FF14';

  return (
    <DashCard
      title="Space Environment"
      icon={<Zap size={13} />}
      color="#FF6B35"
      className="col-span-4"
    >
      <div className="grid grid-cols-2 gap-2 mb-3">
        <MetricBox label="Kp Index" value={w.kpIndex.toFixed(1)} color={kpColor} sub="geomagnetic" />
        <MetricBox label="X-Ray" value={w.xrayClass} color={w.xrayClass[0] === 'X' ? '#ff3d3d' : w.xrayClass[0] === 'M' ? '#FF6B35' : '#F59E0B'} sub="solar flare" />
        <MetricBox label="Solar Wind" value={`${w.solarWindSpeed} km/s`} color="#8B5CF6" sub="speed" />
        <MetricBox label="Storm" value={w.stormLevel === 'none' ? 'Quiet' : w.stormLevel} color={w.stormLevel !== 'none' ? '#FF6B35' : '#39FF14'} sub="G-scale" />
      </div>
      <div
        className="p-2 rounded-lg text-xs font-mono text-center"
        style={{
          background: w.kpIndex >= 5 ? 'rgba(255,61,61,0.08)' : 'rgba(57,255,20,0.06)',
          border: `1px solid ${w.kpIndex >= 5 ? 'rgba(255,61,61,0.2)' : 'rgba(57,255,20,0.15)'}`,
          color: kpColor,
        }}
      >
        {w.kpIndex >= 5 ? '⚡ Elevated geomagnetic activity — monitor satellite drag' : '✓ Space environment nominal'}
      </div>
    </DashCard>
  );
}

// ── Alerts Feed ───────────────────────────────────────────────────────────────

function AlertsFeed() {
  const { conjunctions } = useStore();
  const sorted = [...conjunctions].sort((a, b) => {
    const o = { critical: 0, high: 1, medium: 2, low: 3 };
    return o[a.severity] - o[b.severity];
  });

  return (
    <DashCard
      title="Conjunction Alerts"
      icon={<AlertTriangle size={13} />}
      color="#ff3d3d"
      className="col-span-4"
    >
      <div className="space-y-2">
        {sorted.map((c, i) => {
          const color = c.severity === 'critical' ? '#ff3d3d' : c.severity === 'high' ? '#FF6B35' : c.severity === 'medium' ? '#F59E0B' : '#39FF14';
          const diff = c.time.getTime() - Date.now();
          const h = Math.floor(diff / 3_600_000);
          const m = Math.floor((diff % 3_600_000) / 60_000);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.07 }}
              className="p-2.5 rounded-lg"
              style={{ background: `${color}08`, border: `1px solid ${color}20` }}
            >
              <div className="flex justify-between mb-1">
                <span className="text-xs font-mono uppercase font-bold" style={{ color }}>{c.severity}</span>
                <span className="text-gray-600 font-mono" style={{ fontSize: '10px' }}>
                  T-{h > 0 ? `${h}h${m}m` : `${m}m`}
                </span>
              </div>
              <div className="text-white font-mono text-xs truncate">{c.sat1}</div>
              <div className="text-gray-500 font-mono text-xs truncate">⟷ {c.sat2}</div>
              <div className="flex gap-3 mt-1 text-gray-600 font-mono" style={{ fontSize: '10px' }}>
                <span>P: {(c.probability * 100).toExponential(2)}%</span>
                <span>D: {c.distance.toFixed(1)} km</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashCard>
  );
}

// ── Launch Timeline ───────────────────────────────────────────────────────────

function LaunchTimeline() {
  const { launches } = useStore();
  const upcoming = launches.filter(l => l.status === 'upcoming').slice(0, 4);

  return (
    <DashCard
      title="Launch Schedule"
      icon={<TrendingUp size={13} />}
      color="#FF6B35"
      className="col-span-4"
    >
      <div className="space-y-2.5">
        {upcoming.map((launch, i) => {
          const diff = new Date(launch.date).getTime() - Date.now();
          const days = Math.floor(diff / 86_400_000);
          const hours = Math.floor((diff % 86_400_000) / 3_600_000);
          return (
            <motion.div
              key={launch.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.25)' }}
              >
                <span className="text-xs font-mono font-bold text-orange-400">
                  {days > 0 ? `${days}d` : `${hours}h`}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-mono text-xs font-semibold truncate">{launch.name}</div>
                <div className="text-orange-400 font-mono text-xs opacity-80">{launch.vehicle}</div>
                <div className="text-gray-600 font-mono truncate" style={{ fontSize: '10px' }}>{launch.site}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashCard>
  );
}

// ── Sustainability Widget ─────────────────────────────────────────────────────

function SustainabilityWidget() {
  const { sustainabilityMetrics: m } = useStore();
  const pollColor = m.orbitalPollutionScore > 60 ? '#ff3d3d' : m.orbitalPollutionScore > 40 ? '#F59E0B' : '#39FF14';

  return (
    <DashCard
      title="Sustainability Index"
      icon={<Shield size={13} />}
      color="#39FF14"
      className="col-span-4"
    >
      <div className="grid grid-cols-2 gap-2 mb-3">
        <MetricBox label="Pollution Score" value={`${m.orbitalPollutionScore}/100`} color={pollColor} sub="orbital debris" />
        <MetricBox label="Clean Space" value={`${m.cleanSpaceScore}/100`} color="#39FF14" sub="mitigation" />
        <MetricBox label="Active/Total" value={`${((m.activeSatellites / m.totalObjects) * 100).toFixed(0)}%`} color="#00D4FF" sub="operational" />
        <MetricBox label="Kessler Risk" value={m.kesslerRiskLevel.toUpperCase()} color={m.kesslerRiskLevel === 'critical' ? '#ff3d3d' : m.kesslerRiskLevel === 'high' ? '#FF6B35' : '#F59E0B'} sub="cascade risk" />
      </div>
      <div className="text-xs font-mono text-gray-600 text-center">
        {m.debrisFragments.toLocaleString()} tracked debris · {m.rocketBodies.toLocaleString()} rocket bodies
      </div>
    </DashCard>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function DashCard({
  title, icon, color, className, children,
}: {
  title: string; icon: React.ReactNode; color: string;
  className: string; children: React.ReactNode;
}) {
  return (
    <div
      className={`${className} rounded-xl overflow-hidden`}
      style={{
        background: 'rgba(4,13,26,0.97)',
        border: `1px solid ${color}18`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: `1px solid ${color}10` }}
      >
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function MetricBox({ label, value, color, sub }: { label: string; value: string; color: string; sub: string }) {
  return (
    <div
      className="p-2.5 rounded-lg"
      style={{ background: `${color}08`, border: `1px solid ${color}18` }}
    >
      <div className="text-gray-600 font-mono" style={{ fontSize: '9px' }}>{label}</div>
      <div className="font-mono font-bold text-sm leading-tight mt-0.5" style={{ color }}>{value}</div>
      <div className="text-gray-700 font-mono" style={{ fontSize: '9px' }}>{sub}</div>
    </div>
  );
}

function MiniMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="text-gray-600 font-mono" style={{ fontSize: '9px' }}>{label}</div>
      <div className="font-mono text-xs font-semibold" style={{ color }}>{value}</div>
    </div>
  );
}

function DonutChart({
  segments, size,
}: {
  segments: { label: string; pct: number; color: string }[];
  size: number;
}) {
  const r = Math.max(1, (size / 2) * 0.68); // guard against 0/NaN
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.04)" strokeWidth={size * 0.12} />
        {segments.map(seg => {
          const dash = seg.pct * circ;
          const el = (
            <motion.circle
              key={seg.label}
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={size * 0.12}
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${dash} ${circ}` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 2px ${seg.color}66)` }}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
    </div>
  );
}
