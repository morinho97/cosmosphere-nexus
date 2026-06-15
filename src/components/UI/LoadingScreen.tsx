import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { useEffect, useState } from 'react';

const STEPS = [
  'Initializing orbital mechanics engine...',
  'Fetching live TLE data from CelesTrak...',
  'Propagating satellite positions...',
  'Building space environment...',
  'Compiling atmosphere shaders...',
  'Loading ground station network...',
  'Running conjunction detection...',
  'Calibrating space weather feed...',
  'Nexus systems online.',
];

export default function LoadingScreen() {
  const { isLoading, loadingProgress } = useStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const t = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 700);
    return () => clearInterval(t);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #040d1a 0%, #020408 100%)' }}
        >
          {/* Star field */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 120 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: Math.random() > 0.95 ? '2px' : '1px',
                  height: Math.random() > 0.95 ? '2px' : '1px',
                  opacity: Math.random() * 0.5 + 0.05,
                }}
                animate={{ opacity: [null, Math.random() * 0.7 + 0.1] }}
                transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, repeatType: 'reverse' }}
              />
            ))}
          </div>

          {/* Nebula glow */}
          {[
            { x: '20%', y: '30%', color: '#0040ff', size: 400 },
            { x: '75%', y: '65%', color: '#8800ff', size: 300 },
            { x: '55%', y: '20%', color: '#00aaff', size: 250 },
          ].map((n, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: n.x, top: n.y,
                width: n.size, height: n.size,
                background: `radial-gradient(circle, ${n.color}08, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          {/* Globe ring system */}
          <div className="relative w-52 h-52 mb-10">
            {/* Outer rings */}
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{
                  transform: `scale(${1 + i * 0.18})`,
                  border: `1px solid rgba(0,212,255,${0.15 - i * 0.03})`,
                }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 12 + i * 6, repeat: Infinity, ease: 'linear' }}
              />
            ))}

            {/* Globe */}
            <motion.div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 38% 35%, #0d3060, #040f20)',
                border: '1px solid rgba(0,212,255,0.35)',
                boxShadow: '0 0 60px rgba(0,212,255,0.12), inset 0 0 40px rgba(0,212,255,0.06)',
              }}
            >
              <motion.span
                className="text-6xl select-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              >
                🌍
              </motion.span>
            </motion.div>

            {/* Orbiting satellites */}
            {[
              { color: '#00D4FF', r: 60, duration: 3.2, delay: 0 },
              { color: '#39FF14', r: 75, duration: 5.1, delay: 1.2 },
              { color: '#FFD700', r: 88, duration: 7.0, delay: 0.6 },
            ].map((sat, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: '50%', left: '50%',
                  width: sat.r * 2, height: sat.r * 2,
                  marginLeft: -sat.r, marginTop: -sat.r,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: sat.duration, repeat: Infinity, ease: 'linear', delay: sat.delay }}
              >
                <div
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{
                    top: 0, left: '50%',
                    transform: 'translateX(-50%) translateY(-50%)',
                    background: sat.color,
                    boxShadow: `0 0 10px ${sat.color}, 0 0 20px ${sat.color}55`,
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1
              className="font-display font-black tracking-[0.25em] mb-2"
              style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: '#fff' }}
            >
              COSMO<span style={{ color: '#00D4FF', textShadow: '0 0 30px #00D4FF88' }}>SPHERE</span>
            </h1>
            <div
              className="font-display font-bold tracking-[0.6em] uppercase"
              style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', color: '#00D4FF', opacity: 0.7 }}
            >
              NEXUS
            </div>
            <p className="text-gray-600 font-mono text-xs tracking-widest mt-2 uppercase">
              Interactive Orbital Intelligence Platform
            </p>
          </motion.div>

          {/* Progress */}
          <div className="w-72">
            <div className="h-px rounded-full overflow-hidden mb-2"
              style={{ background: 'rgba(0,212,255,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #0a3060, #00D4FF)',
                  boxShadow: '0 0 12px #00D4FF88',
                }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex justify-between items-center">
              <motion.span
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-700 font-mono"
                style={{ fontSize: '10px' }}
              >
                {STEPS[step]}
              </motion.span>
              <span className="text-cosmos-plasma font-mono font-bold text-xs">
                {Math.round(loadingProgress)}%
              </span>
            </div>
          </div>

          {/* Version tag */}
          <div className="absolute bottom-6 font-mono text-gray-800" style={{ fontSize: '10px' }}>
            v2.0.0 · Three.js · satellite.js · globe.gl · CelesTrak TLE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
