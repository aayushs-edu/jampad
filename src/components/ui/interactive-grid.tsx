import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InteractiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  resolution?: number;
  coolingFactor?: number;
}

const InteractiveGrid = ({
  className,
  resolution = 28,
  coolingFactor = 0.96,
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

    const mouse = { x: -1000, y: -1000, prevX: -1000, prevY: -1000, active: false };

    // Light-mode blue-purple palette
    const getColor = (t: number): string => {
      // Low temp: subtle grid dot color
      // High temp: blue-purple glow
      const r = Math.round(110 + t * 90);   // 110 → 200
      const g = Math.round(100 + t * 40);   // 100 → 140
      const b = Math.round(180 + t * 75);   // 180 → 255
      const a = 0.15 + t * 0.55;            // subtle → visible
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    const resize = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / resolution);
      rows = Math.ceil(height / resolution);
      grid = new Float32Array(cols * rows).fill(0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const update = () => {
      if (mouse.active) {
        const dx = mouse.x - mouse.prevX;
        const dy = mouse.y - mouse.prevY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.ceil(dist / (resolution / 2));

        for (let s = 0; s <= steps; s++) {
          const t = steps > 0 ? s / steps : 0;
          const x = mouse.prevX + dx * t;
          const y = mouse.prevY + dy * t;
          const col = Math.floor(x / resolution);
          const row = Math.floor(y / resolution);
          const radius = 3;
          for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
              const c = col + i;
              const r = row + j;
              if (c >= 0 && c < cols && r >= 0 && r < rows) {
                const idx = c + r * cols;
                const d = Math.sqrt(i * i + j * j);
                if (d <= radius) {
                  grid[idx] = Math.min(1.0, grid[idx] + 0.25 * (1 - d / radius));
                }
              }
            }
          }
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
            // Active heated cell
            const size = resolution * (0.6 + temp * 0.6);
            const offset = (resolution - size) / 2;
            ctx.fillStyle = getColor(temp);
            ctx.beginPath();
            ctx.roundRect(x + offset, y + offset, size, size, 3);
            ctx.fill();
          } else {
            // Subtle always-visible grid dot
            ctx.fillStyle = "rgba(140, 120, 200, 0.08)";
            ctx.beginPath();
            ctx.arc(x + resolution / 2, y + resolution / 2, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(update);
    };

    window.addEventListener("resize", resize);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    resize();
    update();

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [resolution, coolingFactor]);

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 pointer-events-auto z-0", className)}
      style={style}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

export default InteractiveGrid;
