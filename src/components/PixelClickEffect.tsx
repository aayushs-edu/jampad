import { useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  color: string;
}

const COLORS = [
  "hsl(258, 60%, 55%)",
  "hsl(258, 80%, 62%)",
  "hsl(230, 70%, 55%)",
  "hsl(258, 80%, 75%)",
  "hsl(220, 80%, 58%)",
];

const PixelClickEffect = () => {
  const handleClick = useCallback((e: MouseEvent) => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    const particles: Particle[] = [];

    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        life: 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.03;

        if (p.life <= 0) continue;
        alive = true;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        // Pixel-style square particles
        const s = Math.floor(p.size * p.life);
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), s, s);
      }

      if (alive) {
        frame = requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    frame = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  return null;
};

export default PixelClickEffect;
