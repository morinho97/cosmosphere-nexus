/**
 * OrbitalTrafficPanel — Orbital Traffic Control System.
 * Visualizes congested orbital highways, density hotspots,
 * and real-time traffic analytics across altitude regimes.
 */

import { motion } from 'framer-motion';
import { Activity, AlertTriangle, TrendingUp, Layers } from 'lucide-react';
import { useStore } from '../../store';
import { orbitalPeriod } from '../../utils';

interface Highway {
  name: string;
  altKm: number;
  color: string;
  density: number;   // 0–1
  count: number;
  risk: 'low' | 'moderate' | 'high' | 'critical';
  operator: string;
  note: string;
}

export default function OrbitalTrafficPanel() {
  const { activeView, satellites } = useStore();
  if (activeView !== 'traffic') return null;

  // Compute density per 50km altitude band from live data
  const bands = computeAltitudeBands(satellites);

  const HIGHWAYS: Highway[] = [
    {
      name: 'Starlink Shell 1',
      altKm: 340,
      color: '#00D4FF',
      density: Math.min(1, (bands[340] || 0) / 400),
      count: bands[340] || 0,
      risk: densityRisk(bands[340] || 0, 400),
      operator: 'SpaceX',
      note: 'Primary deployment shell, deorbit via drag',
    },
    {
      name: 'Starlink Shell 2',
      altKm: 550,
      color: '#00AAFF',
      density: Math.min(1, (bands[550] || 0) / 600),
      count: bands[550] || 0,
      risk: densityRisk(bands[550] || 0, 600),
      operator: 'SpaceX',
      note: 'High-density operational constellation',
    },
    {
      name: 'LEO Highway',
      altKm: 700,
      color: '#39FF14',
      density: Math.min(1, (bands[700] || 0) / 200),
      count: bands[700] || 0,
      risk: densityRisk(bands[700] || 0, 200),
      operator: 'Multi-operator',
      note: 'Weather & Earth observation primary band',
    },
    {
      name: 'Polar Highway',
      altKm: 800,
      color: '#A855F7',
      density: Math.min(1, (bands[800] || 0) / 300),
      count: bands[800] || 0,
      risk: densityRisk(bands[800] || 0, 300),
      operator: 'Multi-operator',
      note: 'Sun-synchronous Earth imaging corridor',
    },
    {
      name: 'ISS Corridor',
      altKm: 420,
      color: '#FFD700',
      density: 0.08,
      count: bands[420] || 1,
      risk: 'low',
      operator: 'ISS Partners',
      note: 'Keep-out zone: 2km above, 25km below/sides',
    },
    {
      name: 'MEO Nav Band',
      altKm: 20200,
      color: '#FF6B35',
      density: Math.min(1, (bands[20200] || 0) / 80),
      count: bands[20200] || 0,
      risk: 'low',
      operator: 'US DoD / ESA / Roscosmos',
      note: 'GPS/Galileo/GLONASS — sparse but critical',
    },
    {
      name: 'GEO Arc',
      altKm: 35786,
      color: '#F59E0B',
      density: Math.min(1, (bands[35786] || 0) / 200),
      count: bands[35786] || 0,
      risk: densityRisk(bands[35786] || 0, 200),
      operator: 'International',
      note: 'Geostationary belt — finite resource',
    },
  ];

  const totalTracked = satellites.length;
  const congested = HIGHWAYS.filter(h => h.risk === 'high' || h.risk === 'critical').length;
  const avgDensity = HIGHWAYS.reduce((s, h) => s + h.density, 0) / HIGHWAYS.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', damping: 24, stiffness: 200 }}
      className="absolute top-16 right-4 z-40 space-y-3"
      style={{ width: '300px', pointerEvents: 'auto' }}
    >
      {/* Header stats */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(4,13,26,0.97)',
          border: '1px solid rgba(0,212,255,0.18)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity size={13} className="text-cosmos-plasma" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
            Orbital Traffic Control
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <TrafficStat label="Tracked" value={totalTracked.toLocaleString()} color="#00D4FF" />
          <TrafficStat label="Congested Lanes" value={congested.toString()} color={congested > 2 ? '#ff3d3d' : '#F59E0B'} />
          <TrafficStat label="Avg Density" value={`${(avgDensity * 100).toFixed(0)}%`} color="#A855F7" />
        </div>
      </div>

      {/* Altitude density spectrum */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(4,13,26,0.97)',
          border: '1px solid rgba(0,212,255,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Layers size={12} className="text-gray-500" />
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Density Spectrum</span>
        </div>
        <AltitudeDensitySpectrum satellites={satellites} />
      </div>

      {/* Highway list */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'rgba(4,13,26,0.97)',
          border: '1px solid rgba(0,212,255,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <TrendingUp size={12} className="text-gray-500" />
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Orbital Highways
          </span>
        </div>
        <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
          {HIGHWAYS.map((hw, i) => (
            <HighwayRow key={hw.name} highway={hw} index={i} />
          ))}
        </div>
      </div>

      {/* Traffic advisories */}
      <TrafficAdvisories highways={HIGHWAYS} />
    </motion.div>
  );
}

function HighwayRow({ highway: hw, index }: { highway: Highway; index: number }) {
  const riskColor = {
    low: '#39FF14', moderate: '#F59E0B', high: '#FF6B35', critical: '#ff3d3d',
  }[hw.risk];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-3 rounded-lg space-y-2"
      style={{
        background: `${hw.color}07`,
        border: `1px solid ${hw.color}20`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: hw.color, boxShadow: `0 0 6px ${hw.color}` }}
          />
          <span className="text-xs font-mono font-semibold text-white">{hw.name}</span>
        </div>
        <span
          className="text-xs font-mono px-1.5 py-0.5 rounded uppercase"
          style={{ background: `${riskColor}18`, color: riskColor, border: `1px solid ${riskColor}33` }}
        >
          {hw.risk}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex-1 h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${hw.color}66, ${riskColor})`,
              boxShadow: hw.density > 0.7 ? `0 0 6px ${riskColor}88` : 'none',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${hw.density * 100}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 }}
          />
        </div>
        <span className="text-gray-500 font-mono flex-shrink-0" style={{ fontSize: '10px' }}>
          {(hw.density * 100).toFixed(0)}%
        </span>
      </div>

      <div className="flex justify-between text-gray-600 font-mono" style={{ fontSize: '10px' }}>
        <span>{hw.altKm.toLocaleString()} km · {hw.count} objects</span>
        <span className="text-gray-700">{(orbitalPeriod(hw.altKm)).toFixed(0)} min/rev</span>
      </div>
    </motion.div>
  );
}

function AltitudeDensitySpectrum({ satellites }: { satellites: { altitude: number }[] }) {
  // Logarithmic altitude bins: 200→500, 500→800, 800→2000, 2000→20000, 20000+
  const bins = [
    { label: '200–500', min: 200,   max: 500,   color: '#00D4FF' },
    { label: '500–800', min: 500,   max: 800,   color: '#39FF14' },
    { label: '800–2k',  min: 800,   max: 2000,  color: '#A855F7' },
    { label: '2k–20k',  min: 2000,  max: 20000, color: '#F59E0B' },
    { label: '20k+',    min: 20000, max: 1e9,   color: '#FF6B35' },
  ];

  const counts = bins.map(b => ({
    ...b,
    count: satellites.filter(s => s.altitude >= b.min && s.altitude < b.max).length,
  }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="space-y-2">
      {counts.map((bin, i) => (
        <div key={bin.label} className="flex items-center gap-2">
          <span className="text-gray-600 font-mono flex-shrink-0" style={{ fontSize: '10px', width: '50px' }}>
            {bin.label}
          </span>
          <div className="flex-1 h-3 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div
              className="h-full rounded"
              style={{ background: `linear-gradient(90deg, ${bin.color}55, ${bin.color})` }}
              initial={{ width: 0 }}
              animate={{ width: `${(bin.count / maxCount) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.06 }}
            />
          </div>
          <span className="text-gray-500 font-mono flex-shrink-0" style={{ fontSize: '10px', width: '36px', textAlign: 'right' }}>
            {bin.count.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function TrafficAdvisories({ highways }: { highways: Highway[] }) {
  const critical = highways.filter(h => h.risk === 'critical' || h.risk === 'high');
  if (critical.length === 0) return null;

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(255,61,61,0.06)',
        border: '1px solid rgba(255,61,61,0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={12} className="text-red-400" />
        <span className="text-xs font-mono text-red-400 uppercase tracking-widest">
          Traffic Advisories
        </span>
      </div>
      <div className="space-y-2">
        {critical.map(hw => (
          <div key={hw.name} className="text-xs font-mono text-gray-400 leading-relaxed">
            <span style={{ color: hw.color }}>■ {hw.name}</span>
            {' '}at {hw.altKm.toLocaleString()} km — {hw.note}. Density: {(hw.density * 100).toFixed(0)}%.
          </div>
        ))}
      </div>
    </div>
  );
}

function TrafficStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="p-2 rounded-lg text-center"
      style={{ background: `${color}0a`, border: `1px solid ${color}20` }}
    >
      <div className="font-display font-bold text-base leading-none" style={{ color }}>{value}</div>
      <div className="text-gray-600 font-mono mt-0.5" style={{ fontSize: '9px' }}>{label}</div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeAltitudeBands(satellites: { altitude: number }[]): Record<number, number> {
  const bands: Record<number, number> = {};
  const BAND_KEYS = [340, 420, 550, 700, 800, 1200, 20200, 35786];
  for (const sat of satellites) {
    const closest = BAND_KEYS.reduce((a, b) =>
      Math.abs(b - sat.altitude) < Math.abs(a - sat.altitude) ? b : a
    );
    if (Math.abs(closest - sat.altitude) < 150) {
      bands[closest] = (bands[closest] || 0) + 1;
    }
  }
  return bands;
}

function densityRisk(count: number, max: number): 'low' | 'moderate' | 'high' | 'critical' {
  const pct = count / max;
  if (pct > 0.8) return 'critical';
  if (pct > 0.6) return 'high';
  if (pct > 0.3) return 'moderate';
  return 'low';
}
