import React, { useRef, useState, useEffect } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useVirtualization } from '@/hooks/useVirtualization';
import { DataPoint, Category } from '@/lib/types';

const ITEM_HEIGHT = 36;

const categoryColors: Record<Category, string> = {
    A: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    B: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    C: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    D: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    E: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
};

const DataTable: React.FC = () => {
  const { filteredData } = useData();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      setContainerHeight(container.clientHeight);
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight);

    return () => resizeObserver.disconnect();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const { virtualItems, totalHeight } = useVirtualization({
    itemCount: filteredData.length,
    containerHeight,
    itemHeight: ITEM_HEIGHT,
    scrollTop,
  });

  return (
    <div ref={containerRef} onScroll={handleScroll} className="h-full w-full overflow-y-auto rounded text-sm">
        <Header />
        <div style={{ height: totalHeight, position: 'relative' }}>
            {virtualItems.map(({ index, style }) => {
                const item = filteredData[index];
                if (!item) return null;
                return <Row key={item.id} item={item} style={style} />;
            })}
        </div>
    </div>
  );
};

const Header: React.FC = () => (
    <div className="grid grid-cols-data-table gap-4 px-4 sticky top-0 z-10 bg-slate-800/80 backdrop-blur-lg text-xs text-cyan-400 uppercase font-semibold h-10 items-center border-b border-white/10">
        <div className="text-right">ID</div>
        <div className="text-left">Timestamp</div>
        <div className="text-right">Value</div>
        <div className="text-right">Latency (ms)</div>
        <div className="text-center">Category</div>
    </div>
);


interface RowProps {
    item: DataPoint;
    style: React.CSSProperties;
}

const Row = React.memo<RowProps>(({ item, style }) => (
    <div 
      className="grid grid-cols-data-table gap-4 px-4 items-center border-b border-white/5 hover:bg-white/10 transition-colors duration-150"
      style={style}
    >
        <div className="font-medium text-slate-300 whitespace-nowrap text-right">{item.id}</div>
        <div className="whitespace-nowrap text-slate-400">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}.{String(item.timestamp % 1000).padStart(3, '0')}</div>
        <div className="text-right text-slate-300">{item.value.toFixed(2)}</div>
        <div className="text-right text-slate-300">{item.latency.toFixed(2)}</div>
        <div className="text-center flex justify-center items-center">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${categoryColors[item.category]}`}>
                {item.category}
            </span>
        </div>
    </div>
));


export default DataTable;
