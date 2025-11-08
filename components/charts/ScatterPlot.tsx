import React, { useRef } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useOffscreenCanvas } from '@/hooks/useOffscreenCanvas';

const ScatterPlot: React.FC = () => {
  const { filteredData } = useData();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { resetZoom } = useOffscreenCanvas(canvasRef, 'scatter', filteredData);

  return (
    <div className="relative w-full h-full group">
      <canvas ref={canvasRef} className="w-full h-full" />
      <button 
        onClick={resetZoom}
        className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-600/70 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none ring-2 ring-transparent focus:ring-cyan-500"
        aria-label="Reset Zoom"
      >
        Reset
      </button>
    </div>
  );
};

export default React.memo(ScatterPlot);
