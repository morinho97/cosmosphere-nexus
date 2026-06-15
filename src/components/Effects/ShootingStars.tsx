/**
 * ShootingStars — Canvas overlay that occasionally fires a shooting star
 * across the background to add life to the deep-space scene.
 */

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  opacity: number;
  fade: number;
  alive: boolean;
}

const SPAWN_INTERVAL_MS = 3500; // time between new shooting stars

export default function ShootingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const starsRef  = useRef<Star[]>([]);
  const spawnRef  = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = () => {
      if (starsRef.current.filter(s => s.alive).length > 3) return;
      const angle = Math.random() * 0.3 + 0.1; // mostly downward-right
      const speed = 8 + Math.random() * 12;
      starsRef.current.push({
        x:  Math.random() * canvas.width * 0.8,
        y:  Math.random() * canvas.height * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 80 + Math.random() * 120,
        opacity: 1,
        fade: 0.018 + Math.random() * 0.01,
        alive: true,
      });
    };

    spawnRef.current = setInterval(spawn, SPAWN_INTERVAL_MS);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current = starsRef.current.filter(s => s.alive);

      for (const s of starsRef.current) {
        s.x += s.vx;
        s.y += s.vy;
        s.opacity -= s.fade;
        if (s.opacity <= 0 || s.x > canvas.width * 1.1 || s.y > canvas.height * 1.1) {
          s.alive = false;
          continue;
        }

        const tailX = s.x - s.vx * (s.len / 14);
        const tailY = s.y - s.vy * (s.len / 14);

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(1, `rgba(220,240,255,${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.5;
        ctx.shadowColor = `rgba(180,220,255,${s.opacity * 0.6})`;
        ctx.shadowBlur  = 6;
        ctx.stroke();
        ctx.shadowBlur  = 0;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(spawnRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
