import React, { useRef } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useOffscreenCanvas } from '@/hooks/useOffscreenCanvas';

const Heatmap: React.FC = () => {
  const { filteredData } = useData();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useOffscreenCanvas(canvasRef, 'heatmap', filteredData);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default React.memo(Heatmap);
