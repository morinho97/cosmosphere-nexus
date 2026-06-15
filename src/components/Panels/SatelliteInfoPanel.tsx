import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Satellite, Globe, Zap, Navigation, Calendar, Flag, Info } from 'lucide-react';
import { useStore } from '../../store';

export default function SatelliteInfoPanel() {
  const { selectedSatellite, showInfoPanel, setSelectedSatellite, setShowInfoPanel } = useStore();

  const close = () => {
    setSelectedSatellite(null);
    setShowInfoPanel(false);
  };

  const sat = selectedSatellite;

  return (
    <AnimatePresence>
      {showInfoPanel && sat && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-4 right-4 w-80 z-50"
          style={{ filter: 'drop-shadow(0 0 30px rgba(0,212,255,0.15))' }}
        >
          {/* Header */}
          <div
            className="rounded-t-xl p-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(2,4,8,0.95) 60%)',
              border: '1px solid rgba(0,212,255,0.3)',
              borderBottom: 'none',
            }}
          >
            {/* Scan line */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute left-0 right-0 h-px opacity-30"
                style={{ background: 'linear-gradient(90deg, transparent, #00D4FF, transparent)' }}
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: `${sat.color}22`,
                    border: `1px solid ${sat.color}66`,
                    boxShadow: `0 0 15px ${sat.color}33`,
                  }}
                >
                  <Satellite size={20} style={{ color: sat.color }} />
                </div>
                <div>
                  <div className="text-white font-display font-bold text-sm leading-tight">{sat.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: sat.color, fontFamily: 'JetBrains Mono, monospace' }}>
                    NORAD #{sat.noradId}
                  </div>
                </div>
              </div>
              <button
                onClick={close}
                className="text-gray-400 hover:text-white transition-colors mt-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Category badge */}
            <div className="mt-3 flex gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-mono uppercase tracking-widest"
                style={{ background: `${sat.color}22`, color: sat.color, border: `1px solid ${sat.color}44` }}
              >
                {sat.category.replace('_', ' ')}
              </span>
              {sat.missionType && (
                <span className="text-xs px-2 py-0.5 rounded-full font-mono uppercase tracking-widest"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {sat.missionType.slice(0, 20)}
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div
            className="rounded-b-xl p-4 space-y-3"
            style={{
              background: 'rgba(2,4,8,0.96)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderTop: 'none',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Real-time orbital params */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-mono flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live Position
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatBox icon={<Globe size={12} />} label="Altitude" value={`${Math.round(sat.altitude).toLocaleString()} km`} color={sat.color} />
                <StatBox icon={<Zap size={12} />} label="Velocity" value={`${sat.velocity.speed.toFixed(2)} km/s`} color={sat.color} />
                <StatBox icon={<Navigation size={12} />} label="Latitude" value={`${sat.position.lat.toFixed(3)}°`} color="#888" />
                <StatBox icon={<Navigation size={12} />} label="Longitude" value={`${sat.position.lng.toFixed(3)}°`} color="#888" />
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Orbital parameters */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-mono">Orbital Parameters</div>
              <div className="space-y-1.5">
                <InfoRow label="Inclination" value={`${sat.inclination.toFixed(2)}°`} />
                <InfoRow label="Period" value={`${sat.period.toFixed(1)} min`} />
                <InfoRow label="Orbital Type" value={getOrbitalType(sat.altitude)} />
                <InfoRow label="Revolutions/day" value={(1440 / sat.period).toFixed(2)} />
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Mission info */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-mono">Mission</div>
              <div className="space-y-1.5">
                {sat.operator && <InfoRow label="Operator" value={sat.operator} />}
                {sat.country && <InfoRow label="Country" value={sat.country} />}
                {sat.launchDate && <InfoRow label="Launched" value={sat.launchDate} icon={<Calendar size={10} />} />}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <TrackOrbitButton sat={sat} />
              <button
                className="flex-1 text-xs py-2 rounded-lg font-mono transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#aaa',
                }}
                onClick={() => useStore.getState().toggleFeature('showBeams')}
              >
                Coverage
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TrackOrbitButton({ sat }: { sat: import('../../types').SatelliteData }) {
  const { showOrbits } = useStore();
  const tracking = showOrbits;
  return (
    <button
      className="flex-1 text-xs py-2 rounded-lg font-mono transition-all hover:opacity-90 active:scale-95"
      style={{
        background: tracking
          ? `linear-gradient(135deg, ${sat.color}55, ${sat.color}22)`
          : `linear-gradient(135deg, ${sat.color}33, ${sat.color}11)`,
        border: `1px solid ${tracking ? sat.color + 'aa' : sat.color + '55'}`,
        color: sat.color,
        boxShadow: tracking ? `0 0 12px ${sat.color}44` : 'none',
      }}
      onClick={() => {
        const store = useStore.getState();
        if (!tracking) {
          // Turn ON orbit for selected satellite
          store.toggleFeature('showOrbits');
        } else {
          store.toggleFeature('showOrbits');
        }
      }}
    >
      {tracking ? '✓ Tracking' : 'Track Orbit'}
    </button>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1 font-mono">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <div className="text-white font-mono text-sm font-semibold tracking-wide">{value}</div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-500 font-mono flex items-center gap-1">{icon}{label}</span>
      <span className="text-gray-200 font-mono text-right max-w-[160px] truncate">{value}</span>
    </div>
  );
}

function getOrbitalType(altitude: number): string {
  if (altitude < 2000) return 'LEO';
  if (altitude < 20000) return 'MEO';
  if (altitude >= 35000 && altitude <= 37000) return 'GEO';
  if (altitude > 37000) return 'HEO';
  return 'MEO';
}
