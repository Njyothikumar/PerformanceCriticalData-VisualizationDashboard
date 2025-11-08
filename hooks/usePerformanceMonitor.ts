
import { useState, useEffect, useRef } from 'react';

// Extend the Window interface to include performance.memory, which is non-standard but available in Chrome.
declare global {
    interface Performance {
      memory?: {
        totalJSHeapSize: number;
        usedJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    }
}

export const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  // FIX: Initialize useRef with null. The uninitialized useRef() is not allowed in all environments (e.g., Preact) and can cause this error.
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const loop = (time: number) => {
      frameCountRef.current++;
      const deltaTime = time - lastTimeRef.current;

      if (deltaTime >= 1000) {
        const currentFps = (frameCountRef.current * 1000) / deltaTime;
        setFps(currentFps);

        // Update memory usage if available
        if (performance.memory) {
            setMemoryUsage(performance.memory.usedJSHeapSize / (1024 * 1024));
        }

        lastTimeRef.current = time;
        frameCountRef.current = 0;
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return { fps, memoryUsage };
};
