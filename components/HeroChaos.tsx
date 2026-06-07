"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  tx: number; ty: number;
  vx: number; vy: number;
  r: number; alpha: number; hue: number;
}

export default function HeroChaos() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    const N = 90;
    let W = 0, H = 0;
    let particles: Particle[] = [];
    let t = 0;

    function rand(a: number, b: number) { return a + (b - a) * Math.random(); }

    function resize() {
      if (!canvas || !ctx) return;  // ← ctxも追加
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    function assignTargets() {
      const cols = 9, rows = Math.ceil(N / cols);
      const padX = 60, padY = 60;
      const gw = W - padX * 2, gh = H - padY * 2;
      particles.forEach((p, i) => {
        p.tx = padX + (i % cols) / (cols - 1) * gw;
        p.ty = padY + Math.floor(i / cols) / (rows - 1) * gh;
      });
    }

    function initParticles() {
      particles = Array.from({ length: N }, () => ({
        x: rand(0, W), y: rand(0, H),
        tx: 0, ty: 0,
        vx: rand(-2.5, 2.5), vy: rand(-2.5, 2.5),
        r: rand(1.2, 3.5), alpha: rand(0.3, 0.85), hue: rand(150, 200),
      }));
      assignTargets();
    }

    function isDark() {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    function easeInOut(x: number) {
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const dark = isDark();
      const progress = Math.min(1, Math.max(0, (t - 60) / 220));
      const eased = easeInOut(progress);

      particles.forEach((p) => {
        if (eased < 0.99) {
          p.vx += (Math.random() - 0.5) * 0.18 * (1 - eased) * 2;
          p.vy += (Math.random() - 0.5) * 0.18 * (1 - eased) * 2;
          const speed = Math.hypot(p.vx, p.vy);
          if (speed > 3.5) { p.vx *= 3.5 / speed; p.vy *= 3.5 / speed; }
          p.x += p.vx * (1 - eased * 0.98);
          p.y += p.vy * (1 - eased * 0.98);
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        p.x += (p.tx - p.x) * eased * 0.04;
        p.y += (p.ty - p.y) * eased * 0.04;
      });

      if (eased > 0.15) {
        ctx.save();
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const pi = particles[i], pj = particles[j];
            const d = Math.hypot(pi.x - pj.x, pi.y - pj.y);
            if (d < 80) {
              ctx.globalAlpha = eased * 0.1 * (1 - d / 80);
              ctx.strokeStyle = dark ? "rgba(90,200,150,0.8)" : "rgba(15,110,86,0.6)";
              ctx.beginPath(); ctx.moveTo(pi.x, pi.y); ctx.lineTo(pj.x, pj.y); ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      particles.forEach((p) => {
        const orderAlpha = p.alpha * (0.4 + 0.6 * eased);
        const saturation = 60 + 30 * (1 - eased);
        const lightness = dark ? 55 + 20 * eased : 35 + 15 * (1 - eased);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + 0.5 * (1 - eased)), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue + 20 * (1 - eased)},${saturation}%,${lightness}%,${orderAlpha})`;
        ctx.fill();
      });

      t++;
      if (t < 380) rafRef.current = requestAnimationFrame(draw);
    }

    function start() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      t = 0; resize(); initParticles(); draw();
    }

    start();
    const ro = new ResizeObserver(() => start());
    ro.observe(canvas);
    canvas.addEventListener("click", start);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener("click", start);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "pointer" }}
      aria-hidden="true"
    />
  );
}
