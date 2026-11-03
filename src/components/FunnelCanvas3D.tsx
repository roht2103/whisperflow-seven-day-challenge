import React, { useEffect, useRef } from 'react';
import { FunnelScene } from '../three/FunnelScene';

interface FunnelCanvas3DProps {
  scrollProgress: number;
  particlesVisible?: boolean;
}

export const FunnelCanvas3D: React.FC<FunnelCanvas3DProps> = ({
  scrollProgress,
  particlesVisible = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneInstanceRef = useRef<FunnelScene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new FunnelScene({
      container: containerRef.current,
    });
    sceneInstanceRef.current = scene;

    return () => {
      scene.destroy();
      sceneInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.setScrollProgress(scrollProgress);
    }
  }, [scrollProgress]);

  useEffect(() => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.setParticleVisibility(particlesVisible);
    }
  }, [particlesVisible]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};

