import { useEffect, useRef } from "react";
import type { GlassCategory } from "@/lib/sfx";

/**
 * Lightweight Canvas 2D particle engine for glass-tap interactions.
 * Imperative API via ref: `ref.current.spawn(x, y)`.
 *
 * Particle behaviour varies by category:
 *   - slice: long horizontal shards flying outward L/R
 *   - smash: radial shards exploding in all directions + gravity
 *   - asmr:  small soft circles rising and fading (bubbles)
 */

export type ParticleHandle = {
  spawn: (x: number, y: number) => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rot: number;
  vr: number;
  hue: number;
  shape: "shard" | "bubble";
};

interface Props {
  /** Drives visual style. */
  category: GlassCategory;
  /** Hue accent for the particles (0–360). */
  hue: number;
  /** Imperative handle. */
  handleRef: React.MutableRefObject<ParticleHandle | null>;
  className?: string;
}

export const ParticleCanvas = ({ category, hue, handleRef, className }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>();
  const dprRef = useRef(1);

  // Resize canvas to fill parent.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      const { clientWidth, clientHeight } = c;
      c.width = clientWidth * dpr;
      c.height = clientHeight * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  // Imperative spawn API.
  useEffect(() => {
    handleRef.current = {
      spawn: (x: number, y: number) => {
        const dpr = dprRef.current;
        const cx = x * dpr;
        const cy = y * dpr;
        const list = particlesRef.current;
        const count = category === "smash" ? 22 : category === "slice" ? 14 : 10;

        for (let i = 0; i < count; i++) {
          if (category === "slice") {
            // Horizontal-biased shards
            const dir = Math.random() < 0.5 ? -1 : 1;
            const angle = (Math.random() - 0.5) * 0.6; // small vertical tilt
            const speed = (8 + Math.random() * 14) * dpr;
            list.push({
              x: cx, y: cy,
              vx: Math.cos(angle) * speed * dir,
              vy: Math.sin(angle) * speed,
              life: 0,
              maxLife: 35 + Math.random() * 15,
              size: (10 + Math.random() * 22) * dpr,
              rot: Math.random() * Math.PI,
              vr: (Math.random() - 0.5) * 0.4,
              hue: hue + (Math.random() - 0.5) * 30,
              shape: "shard",
            });
          } else if (category === "smash") {
            // Radial blast w/ gravity
            const angle = Math.random() * Math.PI * 2;
            const speed = (5 + Math.random() * 16) * dpr;
            list.push({
              x: cx, y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 0,
              maxLife: 50 + Math.random() * 25,
              size: (6 + Math.random() * 14) * dpr,
              rot: Math.random() * Math.PI,
              vr: (Math.random() - 0.5) * 0.6,
              hue: hue + (Math.random() - 0.5) * 40,
              shape: "shard",
            });
          } else {
            // ASMR bubbles
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
            const speed = (1.5 + Math.random() * 3) * dpr;
            list.push({
              x: cx + (Math.random() - 0.5) * 20 * dpr,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 0,
              maxLife: 50 + Math.random() * 30,
              size: (8 + Math.random() * 16) * dpr,
              rot: 0, vr: 0,
              hue: hue + (Math.random() - 0.5) * 20,
              shape: "bubble",
            });
          }
        }
      },
    };
    return () => { handleRef.current = null; };
  }, [category, hue, handleRef]);

  // Animation loop.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      const list = particlesRef.current;
      const gravity = category === "smash" ? 0.55 : category === "slice" ? 0.18 : 0;

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.life++;
        if (p.life > p.maxLife) { list.splice(i, 1); continue; }
        p.vy += gravity;
        if (category === "asmr") p.vy -= 0.05; // gentle buoyancy upward
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        const t = p.life / p.maxLife;
        const alpha = Math.max(0, 1 - t);

        if (p.shape === "shard") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          const w = p.size;
          const h = p.size * (category === "slice" ? 0.18 : 0.45);
          // Glassy gradient shard
          const grd = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
          grd.addColorStop(0, `hsla(${p.hue}, 95%, 70%, ${alpha * 0.95})`);
          grd.addColorStop(0.5, `hsla(${p.hue}, 100%, 90%, ${alpha})`);
          grd.addColorStop(1, `hsla(${p.hue}, 80%, 55%, ${alpha * 0.7})`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          // Asymmetric shard polygon
          ctx.moveTo(-w / 2, 0);
          ctx.lineTo(-w / 4, -h / 2);
          ctx.lineTo(w / 2, -h / 4);
          ctx.lineTo(w / 3, h / 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = `hsla(0, 0%, 100%, ${alpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        } else {
          // Bubble
          ctx.save();
          const r = p.size * (1 + t * 0.6);
          const grd = ctx.createRadialGradient(p.x - r * 0.3, p.y - r * 0.3, r * 0.1, p.x, p.y, r);
          grd.addColorStop(0, `hsla(0, 0%, 100%, ${alpha * 0.85})`);
          grd.addColorStop(0.6, `hsla(${p.hue}, 90%, 70%, ${alpha * 0.4})`);
          grd.addColorStop(1, `hsla(${p.hue}, 100%, 80%, 0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `hsla(0, 0%, 100%, ${alpha * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [category]);

  return <canvas ref={canvasRef} className={className} />;
};
