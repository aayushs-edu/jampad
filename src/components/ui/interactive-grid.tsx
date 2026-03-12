import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InteractiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  resolution?: number;
  coolingFactor?: number;
}

const InteractiveGrid = ({
  className,
  resolution = 28,
  coolingFactor = 0.94,
  style,
  ...props
}: InteractiveGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let grid: Float32Array;
    let cols = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let animId: number;
    let lastMoveTs = 0;

    const mouse = { x: -1000, y: -1000, prevX: -1000, prevY: -1000, active: false };

    const getColor = (t: number): string => {
      const r = Math.round(110 + t * 90);
      const g = Math.round(100 + t * 40);
      const b = Math.round(180 + t * 75);
      const a = 0.14 + t * 0.5;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / resolution);
      rows = Math.ceil(height / resolution);
      grid = new Float32Array(cols * rows).fill(0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      lastMoveTs = performance.now();
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const injectHeatAt = (x: number, y: number) => {
      const col = Math.floor(x / resolution);
      const row = Math.floor(y / resolution);

      // 2x2 brush footprint
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const c = col + i - 1;
          const r = row + j - 1;
          if (c >= 0 && c < cols && r >= 0 && r < rows) {
            const idx = c + r * cols;
            grid[idx] = Math.min(1.0, grid[idx] + 0.28);
          }
        }
      }
    };

    const update = () => {
      const now = performance.now();
      const dx = mouse.x - mouse.prevX;
      const dy = mouse.y - mouse.prevY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Only inject while moving, so it fades out naturally when cursor stops
      const shouldInject = mouse.active && dist > 0.4 && now - lastMoveTs < 120;

      if (shouldInject) {
        const steps = Math.ceil(dist / (resolution / 2));
        for (let s = 0; s <= steps; s++) {
          const t = steps > 0 ? s / steps : 0;
          const x = mouse.prevX + dx * t;
          const y = mouse.prevY + dy * t;
          injectHeatAt(x, y);
        }
      }

      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      ctx.clearRect(0, 0, width, height);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = c + r * cols;
          const temp = grid[idx];
          grid[idx] *= coolingFactor;

          const x = c * resolution;
          const y = r * resolution;

          if (temp > 0.03) {
            const size = resolution * (0.62 + temp * 0.55);
            const offset = (resolution - size) / 2;
            ctx.fillStyle = getColor(temp);
            ctx.beginPath();
            ctx.roundRect(x + offset, y + offset, size, size, 3);
            ctx.fill();
          } else {
            ctx.fillStyle = "rgba(140, 120, 200, 0.12)";
            ctx.beginPath();
            ctx.arc(x + resolution / 2, y + resolution / 2, 1.15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(update);
    };

    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    resize();
    update();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [resolution, coolingFactor]);

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 pointer-events-none z-0", className)}
      style={style}
      {...props}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};

export default InteractiveGrid;
