import React from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-slate-400 w-5 h-5">{children}</div>
);

const SpeedIcon = () => (
  <IconWrapper>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M3 7.5l3 1.5M3 7.5l-1.5-1.5m1.5 1.5l-1.5 1.5m16.5-3l1.5 1.5m-1.5-1.5l1.5-1.5M12 9.75l-1.5-1.5M15 12l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  </IconWrapper>
);

const MemoryIcon = () => (
  <IconWrapper>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
    </svg>
  </IconWrapper>
);

const PerformanceMonitor: React.FC = () => {
  const { fps, memoryUsage } = usePerformanceMonitor();

  return (
    <div className="glass-card flex items-center gap-4 px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <SpeedIcon />
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-green-400 w-[2ch] text-right">{fps.toFixed(0)}</span>
          <span className="text-xs text-slate-400">FPS</span>
        </div>
      </div>
      <div className="border-l border-white/10 h-5"></div>
      <div className="flex items-center gap-2">
        <MemoryIcon />
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-sky-400 w-[4ch] text-right">{memoryUsage.toFixed(1)}</span>
          <span className="text-xs text-slate-400">MB</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PerformanceMonitor);
