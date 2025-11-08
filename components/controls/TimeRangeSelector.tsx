import React, { useCallback } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { TimeRange } from '@/lib/types';

const RANGES: { value: TimeRange; label: string }[] = [
  { value: '1m', label: 'Last 1 Minute' },
  { value: '5m', label: 'Last 5 Minutes' },
  { value: '1h', label: 'Last 1 Hour' },
];

const TimeRangeSelector: React.FC = () => {
  const { timeRange, setTimeRange, loading } = useData();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value as TimeRange);
  }, [setTimeRange]);

  return (
    <div className="w-full">
      <label htmlFor="time-range-selector" className="sr-only">Time Range</label>
      <div className="relative">
        <select
          id="time-range-selector"
          value={timeRange}
          onChange={handleChange}
          disabled={loading}
          className="w-full bg-slate-700/50 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
        >
          {RANGES.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      {loading && <p className="text-sm text-yellow-500 mt-1 absolute">Loading...</p>}
    </div>
  );
};

export default React.memo(TimeRangeSelector);
