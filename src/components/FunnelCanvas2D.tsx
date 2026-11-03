import React, { useEffect, useRef } from 'react';

interface FunnelCanvas2DProps {
  scrollProgress: number;
  particlesVisible?: boolean;
}

export const FunnelCanvas2D: React.FC<FunnelCanvas2DProps> = ({
  scrollProgress,
  particlesVisible = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // 2D user particles flowing gently along outer funnel boundaries
    const particleCount = 42;
    const particles = Array.from({ length: particleCount }, () => {
      const side = Math.random() > 0.5 ? 1 : -1;
      return {
        x: 0,
        y: Math.random() * height,
        // Keep center column clear of particles (0.5 to 0.95 from center)
        normalizedX: side * (0.5 + Math.random() * 0.45),
        speed: 0.4 + Math.random() * 0.8,
        size: 1.0 + Math.random() * 1.2,
        opacity: 0.15 + Math.random() * 0.25,
        colorRatio: Math.random(),
      };
    });

    // 4 Chamber gate positions in 2D matching the reference screenshot colors
    const chambers = [
      { name: '01 CHANCES I TOOK', color: '#f59e0b', yRatio: 0.25 },
      { name: '02 MISTAKE MUSEUM', color: '#14b8a6', yRatio: 0.5 },
      { name: '03 WHAT I BUILT', color: '#f87171', yRatio: 0.75 },
      { name: '04 HIRE', color: '#f59e0b', yRatio: 0.95 },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const topWidth = Math.min(width * 0.92, 540);
      const bottomWidth = Math.min(width * 0.28, 140);

      // Funnel Boundary Geometry
      const getFunnelWidthAtY = (y: number) => {
        const t = Math.max(0, Math.min(1, y / height));
        return topWidth - (topWidth - bottomWidth) * Math.pow(t, 0.85);
      };

      // Draw subtle funnel silhouette
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX - topWidth / 2, 0);
      ctx.lineTo(centerX + topWidth / 2, 0);
      ctx.lineTo(centerX + bottomWidth / 2, height);
      ctx.lineTo(centerX - bottomWidth / 2, height);
      ctx.closePath();

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, 'rgba(6, 182, 212, 0.03)');
      bgGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.02)');
      bgGrad.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
      ctx.fillStyle = bgGrad;
      ctx.fill();

      // Border glow lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Chamber Divider Gates
      chambers.forEach((chamber, i) => {
        const chamberY = height * chamber.yRatio;
        const chamberW = getFunnelWidthAtY(chamberY);
        const isActive =
          scrollProgress >= i * 0.25 - 0.1 && scrollProgress <= (i + 1) * 0.25 + 0.1;

        ctx.beginPath();
        ctx.moveTo(centerX - chamberW / 2, chamberY);
        ctx.lineTo(centerX + chamberW / 2, chamberY);
        ctx.strokeStyle = isActive ? chamber.color : 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.stroke();

        // Pulsing active marker
        if (isActive) {
          ctx.beginPath();
          ctx.arc(centerX - chamberW / 2, chamberY, 4, 0, Math.PI * 2);
          ctx.arc(centerX + chamberW / 2, chamberY, 4, 0, Math.PI * 2);
          ctx.fillStyle = chamber.color;
          ctx.fill();
        }
      });

      // Update & Draw flowing user particles (if particlesVisible enabled)
      if (particlesVisible) {
        particles.forEach((p) => {
          p.y += p.speed;
          if (p.y > height) {
            p.y = 0;
            const side = Math.random() > 0.5 ? 1 : -1;
            p.normalizedX = side * (0.5 + Math.random() * 0.45);
          }

          const currentW = getFunnelWidthAtY(p.y);
          const currentX = centerX + (p.normalizedX * currentW) / 2;
          const t = p.y / height;

          // Color transition: cyan at top, warm amber at bottom
          ctx.beginPath();
          ctx.arc(currentX, p.y, p.size, 0, Math.PI * 2);
          if (t < 0.45) {
            ctx.fillStyle = `rgba(6, 182, 212, ${p.opacity})`;
          } else if (t < 0.75) {
            ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`;
          } else {
            ctx.fillStyle = `rgba(255, 170, 29, ${p.opacity * 1.2})`;
          }
          ctx.fill();
        });
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
    };
  }, [scrollProgress, particlesVisible]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#08090c]/80 via-transparent to-[#08090c]" />
    </div>
  );
};

