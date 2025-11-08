import React, { useRef } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useOffscreenCanvas } from '@/hooks/useOffscreenCanvas';

const BarChart: React.FC = () => {
  const { aggregateData } = useData();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useOffscreenCanvas(canvasRef, 'bar', aggregateData);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default React.memo(BarChart);
