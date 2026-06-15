/**
 * AuroraEffect — Canvas-based aurora borealis shimmer painted behind the globe.
 * Purely cosmetic — uses requestAnimationFrame to animate wavy colour bands.
 */

import { useEffect, useRef } from 'react';
import { useStore } from '../../store';

export default function AuroraEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      t += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Two aurora bands — top (~north pole region on globe)
      for (let band = 0; band < 2; band++) {
        const yBase = canvas.height * (band === 0 ? 0.1 : 0.88);
        const amplitude = 30 + Math.sin(t * 0.7 + band) * 15;
        const hueShift  = Math.sin(t + band * 2) * 30;

        // Build path
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = yBase
            + amplitude * Math.sin((x / canvas.width) * Math.PI * 6 + t + band)
            + amplitude * 0.4 * Math.sin((x / canvas.width) * Math.PI * 3 - t * 1.3 + band);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }

        const grad = ctx.createLinearGradient(0, yBase - 60, 0, yBase + 60);
        const h1 = Math.round(140 + hueShift);
        const h2 = Math.round(180 + hueShift);
        grad.addColorStop(0, `hsla(${h1}, 100%, 60%, 0)`);
        grad.addColorStop(0.5, `hsla(${h2}, 100%, 55%, 0.06)`);
        grad.addColorStop(1, `hsla(${h1}, 100%, 60%, 0)`);

        ctx.strokeStyle = `hsla(${h2}, 100%, 65%, 0.15)`;
        ctx.lineWidth   = 2;
        ctx.stroke();

        // Soft glow fill
        ctx.shadowColor = `hsla(${h2}, 100%, 60%, 0.3)`;
        ctx.shadowBlur  = 18;
        ctx.fillStyle   = grad;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
