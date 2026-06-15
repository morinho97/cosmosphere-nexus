/**
 * CameraControls — Cinematic camera mode selector.
 * Provides follow mode, flythrough, ISS perspective, polar top-down,
 * and terminator (day/night line) tracking modes.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Eye, Rocket, Globe2, Sun, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store';
import type { CameraMode } from '../../types';

interface CameraModeOption {
  id: CameraMode;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  requiresSatellite?: boolean;
  description: string;
}

const MODES: CameraModeOption[] = [
  {
    id: 'free',
    label: 'Free Orbit',
    sublabel: 'Manual control',
    icon: <Globe2 size={14} />,
    color: '#00D4FF',
    description: 'Freely rotate, pan and zoom the Earth. Full mouse control.',
  },
  {
    id: 'follow',
    label: 'Satellite Follow',
    sublabel: 'Track selected object',
    icon: <Eye size={14} />,
    color: '#39FF14',
    requiresSatellite: true,
    description: 'Camera locks to the selected satellite and tracks its orbit.',
  },
  {
    id: 'flythrough',
    label: 'Cinematic Tour',
    sublabel: 'Automated camera path',
    icon: <Camera size={14} />,
    color: '#A855F7',
    description: 'Smooth cinematic flythrough of Earth\'s orbital environment.',
  },
  {
    id: 'topdown',
    label: 'Polar View',
    sublabel: 'North pole perspective',
    icon: <Sun size={14} />,
    color: '#F59E0B',
    description: 'Top-down polar view — ideal for visualizing orbital plane inclinations.',
  },
  {
    id: 'iss_cockpit',
    label: 'ISS Cockpit',
    sublabel: 'ISS perspective view',
    icon: <Rocket size={14} />,
    color: '#FFD700',
    description: 'Virtual ISS window view — see Earth from 420 km at 7.7 km/s.',
  },
  {
    id: 'terminator',
    label: 'Terminator Track',
    sublabel: 'Follow day/night line',
    icon: <Sun size={14} />,
    color: '#FF6B35',
    description: 'Camera follows the day/night terminator line as Earth rotates.',
  },
];

export default function CameraControls() {
  const { cameraMode, setCameraMode, selectedSatellite, setGlobeAutoRotate } = useStore();
  const [expanded, setExpanded] = useState(false);

  const current = MODES.find(m => m.id === cameraMode) ?? MODES[0];

  const handleSelect = (mode: CameraModeOption) => {
    if (mode.requiresSatellite && !selectedSatellite) return;
    setCameraMode(mode.id);
    if (mode.id === 'free') {
      setGlobeAutoRotate(false);
    } else if (mode.id === 'flythrough' || mode.id === 'terminator') {
      setGlobeAutoRotate(true);
    }
    setExpanded(false);
  };

  return (
    <div
      className="absolute bottom-14 right-4 z-50"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Current mode button */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:brightness-110"
        style={{
          background: `${current.color}15`,
          border: `1px solid ${current.color}35`,
          backdropFilter: 'blur(20px)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span style={{ color: current.color }}>{current.icon}</span>
        <div className="text-left">
          <div className="text-xs font-mono font-semibold leading-none" style={{ color: current.color }}>
            {current.label}
          </div>
          <div className="text-gray-600 font-mono leading-none mt-0.5" style={{ fontSize: '9px' }}>
            {current.sublabel}
          </div>
        </div>
        <span style={{ color: current.color, opacity: 0.6 }}>
          {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 w-64 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(4,13,26,0.98)',
              border: '1px solid rgba(0,212,255,0.15)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 -8px 40px rgba(0,212,255,0.08)',
            }}
          >
            <div className="px-3 py-2.5 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <Camera size={11} className="text-gray-500" />
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Camera Mode</span>
              </div>
            </div>

            <div className="p-2 space-y-1">
              {MODES.map(mode => {
                const active = mode.id === cameraMode;
                const disabled = mode.requiresSatellite && !selectedSatellite;

                return (
                  <motion.button
                    key={mode.id}
                    onClick={() => handleSelect(mode)}
                    disabled={disabled}
                    className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all"
                    style={{
                      background: active ? `${mode.color}15` : 'transparent',
                      border: `1px solid ${active ? mode.color + '40' : 'transparent'}`,
                      opacity: disabled ? 0.35 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                    whileHover={disabled ? {} : { backgroundColor: `${mode.color}08` }}
                  >
                    <span
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: active ? mode.color : '#555' }}
                    >
                      {mode.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-mono font-semibold"
                          style={{ color: active ? mode.color : '#aaa' }}
                        >
                          {mode.label}
                        </span>
                        {active && (
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: mode.color, boxShadow: `0 0 4px ${mode.color}` }}
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </div>
                      <div className="text-gray-600 font-mono" style={{ fontSize: '10px' }}>
                        {disabled ? 'Select a satellite first' : mode.description}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* ISS live position note */}
            {selectedSatellite && (
              <div
                className="px-3 py-2 border-t border-white/5"
                style={{ fontSize: '10px' }}
              >
                <span className="text-gray-700 font-mono">
                  Follow mode: tracking <span className="text-cosmos-plasma">{selectedSatellite.name.slice(0, 24)}</span>
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
