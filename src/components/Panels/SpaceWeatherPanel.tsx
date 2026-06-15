/**
 * SpaceWeatherPanel — Real-time space weather dashboard.
 * Shows solar activity, geomagnetic storm levels, radiation belts,
 * and how current conditions affect satellite operations.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Zap, Wind, Shield, AlertTriangle, TrendingUp, Radio } from 'lucide-react';
import { useStore } from '../../store';
import type { SpaceWeatherData } from '../../types';

export default function SpaceWeatherPanel() {
  const { activeView, spaceWeather, toggleFeature } = useStore();
  if (activeView !== 'weather') return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', damping: 24, stiffness: 200 }}
      className="absolute top-16 right-4 z-40 space-y-3"
      style={{ width: '300px', pointerEvents: 'auto', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', paddingBottom: '12px' }}
    >
      {/* Solar Activity Card */}
      <WeatherCard
        title="Solar Activity"
        icon={<Sun size={13} />}
        accentColor="#FF6B35"
      >
        <div className="grid grid-cols-2 gap-2 mb-3">
          <SolarMetric
            label="X-Ray Class"
            value={spaceWeather.xrayClass}
            color={getXrayColor(spaceWeather.xrayClass)}
            sublabel="Solar flare intensity"
          />
          <SolarMetric
            label="Solar Flux"
            value={`${spaceWeather.solarFlux}`}
            color="#FF6B35"
            sublabel="F10.7 sfu"
          />
        </div>
        <FluxBar label="Solar Flux Index" value={spaceWeather.solarFlux} max={300} color="#FF6B35" />
      </WeatherCard>

      {/* Geomagnetic Storm Card */}
      <WeatherCard
        title="Geomagnetic Activity"
        icon={<Zap size={13} />}
        accentColor={getKpColor(spaceWeather.kpIndex)}
      >
        <div className="flex items-center gap-4 mb-3">
          {/* KP index dial */}
          <KpDial kp={spaceWeather.kpIndex} />
          <div className="flex-1 space-y-1.5">
            <div>
              <div className="text-xs text-gray-500 font-mono">Storm Level</div>
              <div
                className="text-sm font-mono font-bold mt-0.5"
                style={{ color: getStormColor(spaceWeather.stormLevel) }}
              >
                {spaceWeather.stormLevel === 'none' ? 'Quiet' : `${spaceWeather.stormLevel} Storm`}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-mono">Aurora</div>
              <div
                className="text-sm font-mono font-bold mt-0.5"
                style={{ color: getAuroraColor(spaceWeather.auroraStrength) }}
              >
                {spaceWeather.auroraStrength.charAt(0).toUpperCase() + spaceWeather.auroraStrength.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* KP scale */}
        <div>
          <div className="flex justify-between text-xs font-mono text-gray-700 mb-1">
            <span>Quiet</span><span>Unsettled</span><span>Storm</span><span>Severe</span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(90deg, #39FF14, #F59E0B, #FF6B35, #ff3d3d)' }}>
            <motion.div
              className="absolute top-0 w-3 h-full"
              style={{
                left: `${(spaceWeather.kpIndex / 9) * 100}%`,
                background: 'white',
                borderRadius: '2px',
                transform: 'translateX(-50%)',
                boxShadow: '0 0 6px rgba(255,255,255,0.8)',
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-gray-700 mt-0.5">
            {[0,1,2,3,4,5,6,7,8,9].map(n => <span key={n}>{n}</span>)}
          </div>
        </div>
      </WeatherCard>

      {/* Solar Wind Card */}
      <WeatherCard
        title="Solar Wind"
        icon={<Wind size={13} />}
        accentColor="#8B5CF6"
      >
        <div className="grid grid-cols-2 gap-2">
          <SolarMetric
            label="Wind Speed"
            value={`${spaceWeather.solarWindSpeed}`}
            color="#8B5CF6"
            sublabel="km/s"
          />
          <SolarMetric
            label="Proton Flux"
            value={spaceWeather.protonFlux.toFixed(1)}
            color={spaceWeather.protonFlux > 10 ? '#ff3d3d' : '#39FF14'}
            sublabel="p/cm²/s"
          />
        </div>
        <FluxBar label="Solar Wind Speed" value={spaceWeather.solarWindSpeed} max={900} color="#8B5CF6" />
      </WeatherCard>

      {/* Radiation Belts Card */}
      <WeatherCard
        title="Radiation Environment"
        icon={<Shield size={13} />}
        accentColor="#F59E0B"
      >
        <RadiationBelts active={spaceWeather.radBeltActive} />
        <div className="mt-3 space-y-1.5">
          <ImpactRow label="LEO Satellites" impact="minimal" color="#39FF14" />
          <ImpactRow label="MEO (GPS/Nav)" impact={spaceWeather.radBeltActive ? 'elevated' : 'low'} color={spaceWeather.radBeltActive ? '#F59E0B' : '#39FF14'} />
          <ImpactRow label="GEO Satellites" impact={spaceWeather.kpIndex > 5 ? 'high' : 'low'} color={spaceWeather.kpIndex > 5 ? '#ff3d3d' : '#39FF14'} />
          <ImpactRow label="HF Radio" impact={spaceWeather.xrayClass[0] === 'X' ? 'severe' : 'low'} color={spaceWeather.xrayClass[0] === 'X' ? '#ff3d3d' : '#39FF14'} />
        </div>
      </WeatherCard>

      {/* Operational Impacts */}
      <WeatherCard
        title="Operational Impacts"
        icon={<Radio size={13} />}
        accentColor="#00D4FF"
      >
        <div className="space-y-2 text-xs font-mono">
          {getOperationalImpacts(spaceWeather).map((impact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-2 p-2 rounded-lg"
              style={{ background: `${impact.color}0a`, border: `1px solid ${impact.color}22` }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
                style={{ background: impact.color, boxShadow: `0 0 4px ${impact.color}` }}
              />
              <span className="text-gray-400 leading-relaxed">{impact.text}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-2 text-gray-700 font-mono" style={{ fontSize: '10px' }}>
          Updated: {spaceWeather.updated.toLocaleTimeString()} UTC
        </div>
      </WeatherCard>
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function WeatherCard({
  title, icon, accentColor, children,
}: {
  title: string; icon: React.ReactNode; accentColor: string; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(4,13,26,0.97)',
        border: `1px solid ${accentColor}22`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: `1px solid ${accentColor}15` }}
      >
        <span style={{ color: accentColor }}>{icon}</span>
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SolarMetric({ label, value, color, sublabel }: {
  label: string; value: string; color: string; sublabel: string;
}) {
  return (
    <div
      className="p-2.5 rounded-lg"
      style={{ background: `${color}0a`, border: `1px solid ${color}20` }}
    >
      <div className="text-gray-600 font-mono mb-1" style={{ fontSize: '10px' }}>{label}</div>
      <div className="font-display font-bold text-lg leading-none" style={{ color }}>{value}</div>
      <div className="text-gray-700 font-mono mt-0.5" style={{ fontSize: '9px' }}>{sublabel}</div>
    </div>
  );
}

function FluxBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs font-mono text-gray-600 mb-1">
        <span>{label}</span><span>{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function KpDial({ kp }: { kp: number }) {
  const color = getKpColor(kp);
  const pct = (kp / 9) * 100;
  const r = 26;
  const circ = 2 * Math.PI * r;
  const strokeDash = (pct / 100) * circ;

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
        <motion.circle
          cx="32" cy="32" r={r || 26}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circ}`}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${strokeDash} ${circ}` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display font-bold text-lg leading-none" style={{ color }}>{kp.toFixed(1)}</div>
        <div className="text-gray-600 font-mono" style={{ fontSize: '9px' }}>Kp</div>
      </div>
    </div>
  );
}

function RadiationBelts({ active }: { active: boolean }) {
  return (
    <div className="relative h-16 flex items-center justify-center">
      {/* Earth */}
      <div
        className="w-8 h-8 rounded-full z-10 flex-shrink-0"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #1a4070, #020a18)',
          border: '1px solid rgba(0,212,255,0.3)',
          boxShadow: '0 0 10px rgba(0,212,255,0.15)',
        }}
      />
      {/* Van Allen belts */}
      {[
        { rx: 52, ry: 14, color: '#F59E0B', label: 'Inner' },
        { rx: 80, ry: 22, color: '#EF4444', label: 'Outer' },
      ].map((belt, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: belt.rx * 2,
            height: belt.ry * 2,
            borderColor: `${belt.color}${active ? '55' : '25'}`,
            background: `radial-gradient(ellipse, transparent 40%, ${belt.color}${active ? '12' : '06'} 100%)`,
            boxShadow: active ? `0 0 12px ${belt.color}22` : 'none',
          }}
          animate={active ? { opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      ))}
      <div
        className="absolute top-1 right-2 text-xs font-mono"
        style={{ color: active ? '#F59E0B' : '#555', fontSize: '9px' }}
      >
        {active ? '⚡ ENHANCED' : 'nominal'}
      </div>
    </div>
  );
}

function ImpactRow({ label, impact, color }: { label: string; impact: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 font-mono text-xs">{label}</span>
      <span
        className="text-xs font-mono px-2 py-0.5 rounded-full uppercase tracking-wider"
        style={{ background: `${color}15`, color, border: `1px solid ${color}33` }}
      >
        {impact}
      </span>
    </div>
  );
}

// ── Helper functions ──────────────────────────────────────────────────────────

function getKpColor(kp: number): string {
  if (kp >= 7) return '#ff3d3d';
  if (kp >= 5) return '#FF6B35';
  if (kp >= 4) return '#F59E0B';
  if (kp >= 2) return '#39FF14';
  return '#00D4FF';
}

function getXrayColor(cls: string): string {
  const c = cls[0];
  return c === 'X' ? '#ff3d3d' : c === 'M' ? '#FF6B35' : c === 'C' ? '#F59E0B' : '#39FF14';
}

function getStormColor(level: string): string {
  if (level === 'none') return '#39FF14';
  const n = parseInt(level[1] || '0');
  if (n >= 4) return '#ff3d3d';
  if (n >= 3) return '#FF6B35';
  if (n >= 2) return '#F59E0B';
  return '#00D4FF';
}

function getAuroraColor(strength: string): string {
  return strength === 'severe' ? '#ff3d3d'
    : strength === 'strong' ? '#FF6B35'
    : strength === 'moderate' ? '#A855F7'
    : strength === 'low' ? '#00D4FF'
    : '#555';
}

function getOperationalImpacts(w: SpaceWeatherData): { text: string; color: string }[] {
  const impacts: { text: string; color: string }[] = [];

  if (w.kpIndex >= 5) {
    impacts.push({ color: '#ff3d3d', text: `Geomagnetic storm Kp=${w.kpIndex.toFixed(1)}: increased satellite drag at LEO altitudes. Orbit predictions degraded.` });
  }
  if (w.solarFlux > 150) {
    impacts.push({ color: '#FF6B35', text: `Elevated solar flux (${w.solarFlux} sfu): increased atmospheric heating, higher LEO decay rates.` });
  }
  if (w.xrayClass[0] === 'X' || w.xrayClass[0] === 'M') {
    impacts.push({ color: '#F59E0B', text: `${w.xrayClass} solar flare: possible HF radio blackout on Sun-facing hemisphere. GPS accuracy reduced.` });
  }
  if (w.auroraStrength === 'strong' || w.auroraStrength === 'severe') {
    impacts.push({ color: '#A855F7', text: `Strong aurora activity: polar satellite passes may experience attitude control disturbances.` });
  }
  if (w.radBeltActive) {
    impacts.push({ color: '#F59E0B', text: `Enhanced radiation belt activity: elevated charging risk on MEO/GEO satellites. Monitor power systems.` });
  }
  if (impacts.length === 0) {
    impacts.push({ color: '#39FF14', text: `Space weather nominal. No significant impacts on satellite operations expected in the next 24 hours.` });
  }
  return impacts;
}
