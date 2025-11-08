"use client";

import React, { useEffect } from 'react';
import { DataProvider } from '@/components/providers/DataProvider';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import Heatmap from '@/components/charts/Heatmap';
import FilterPanel from '@/components/controls/FilterPanel';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector';
import DataTable from '@/components/ui/DataTable';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';

// --- SVG Icon Components ---

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-cyan-400 w-6 h-6 flex-shrink-0">{children}</div>
);

const DashboardIcon = () => (
  <IconWrapper>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  </IconWrapper>
);

const LineChartIcon = () => (
  <IconWrapper>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  </IconWrapper>
);

const TableIcon = () => (
  <IconWrapper>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5v-1.5M3.375 19.5h1.5v-1.5M3.375 19.5v-1.5m1.5 1.5v-1.5m14.25-15v1.5m1.5-1.5v1.5m-1.5-1.5h-1.5v1.5M19.5 4.5v1.5m-1.5-1.5v1.5m-14.25 0v15m17.25-15v15M4.875 4.5h14.25M4.875 4.5a1.125 1.125 0 01-1.125-1.125M4.875 4.5v-1.5m-1.5 1.5v-1.5m1.5 1.5h-1.5v-1.5M4.875 19.5v-15m14.25 15v-15" />
    </svg>
  </IconWrapper>
);

const FilterIcon = () => (
    <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg></IconWrapper>
);

const ScatterIcon = () => (
    <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg></IconWrapper>
);

const BarChartIcon = () => (
    <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg></IconWrapper>
);

const HeatmapIcon = () => (
    <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" /></svg></IconWrapper>
);


const DashboardPage: React.FC = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = `/sw.js`;
        navigator.serviceWorker.register(swUrl, { scope: '/' }).then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
          console.error('Service Worker registration failed: ', error);
        });
      });
    }
  }, []);

  return (
    <DataProvider>
      <div className="min-h-screen bg-slate-900 text-slate-300 p-4 lg:p-6 font-sans flex flex-col">
        <Header />
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ChartCard 
              title="Value over Time" 
              icon={<LineChartIcon />}
              className="h-[40vh] min-h-[300px]"
            >
              <LineChart />
            </ChartCard>
            <ChartCard 
              title="Real-Time Data Table (Virtualized)" 
              icon={<TableIcon />}
              className="h-[45vh] min-h-[300px]"
            >
              <DataTable />
            </ChartCard>
          </div>

          {/* Right Analysis Column */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <ChartCard title="Controls" icon={<FilterIcon />}>
              <FilterPanel />
            </ChartCard>
            <ChartCard 
              title="Value vs. Latency" 
              icon={<ScatterIcon />}
              className="h-[300px]"
            >
              <ScatterPlot />
            </ChartCard>
            <ChartCard 
              title="Category Distribution" 
              icon={<BarChartIcon />}
              className="h-[300px]"
            >
              <BarChart />
            </ChartCard>
            <ChartCard 
              title="Event Frequency" 
              icon={<HeatmapIcon />}
              className="h-[300px]"
            >
              <Heatmap />
            </ChartCard>
          </div>
        </main>
      </div>
    </DataProvider>
  );
};

const Header: React.FC = () => (
  <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div className="flex items-center gap-3">
      <DashboardIcon />
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-sky-500 bg-clip-text text-transparent">
          Real-Time Dashboard
        </h1>
        <p className="text-slate-400 mt-1">Visualizing 10,000+ data points at 60fps.</p>
      </div>
    </div>
    <div className="flex items-center gap-4 w-full md:w-auto">
      <div className="flex-1">
        <TimeRangeSelector />
      </div>
      <PerformanceMonitor />
    </div>
  </header>
);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '', icon }) => (
  <div className={`glass-card p-4 flex flex-col ${className}`}>
    <div className="flex items-center gap-2 mb-2 flex-shrink-0">
      {icon}
      <h3 className="text-lg font-semibold text-cyan-400">{title}</h3>
    </div>
    <div className="flex-1 relative min-h-0">
      {children}
    </div>
  </div>
);

export default DashboardPage;
