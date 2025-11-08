import { useState, useEffect, useRef } from 'react';
import { DataPoint, Filters, TimeRange, MainThreadMessage } from '@/lib/types';

// The entire worker code is now a string to be run in a Blob.
const workerScript = `
  // Inlined from lib/dataGenerator.ts
  const CATEGORIES = ['A', 'B', 'C', 'D', 'E'];
  let lastId = 0;

  function generateDataPoint(timestamp, prevValue) {
    const value = prevValue !== null
      ? Math.max(0, Math.min(100, prevValue + (Math.random() - 0.5) * 5))
      : 50 + (Math.random() - 0.5) * 20;
      
    return {
      id: ++lastId,
      timestamp,
      value,
      latency: 50 + Math.random() * 450,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    };
  };

  function generateInitialData(count, timeWindowMs) {
    const data = [];
    const now = Date.now();
    const timeStep = timeWindowMs / count;
    let lastValue = null;
    
    for (let i = 0; i < count; i++) {
      const timestamp = now - timeWindowMs + i * timeStep;
      const point = generateDataPoint(timestamp, lastValue);
      data.push(point);
      lastValue = point.value;
    }
    return data;
  };

  function generateNewDataPoint(lastPoint) {
      const lastValue = lastPoint ? lastPoint.value : 50;
      return generateDataPoint(Date.now(), lastValue);
  }

  // Original data.worker.ts logic
  const DATA_GENERATION_INTERVAL = 50; // ms

  const timeRangeToMs = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '1h': 60 * 60 * 1000,
  };

  let data = [];
  let timeRange = '1m';
  let filters = null;
  let intervalId = null;

  // Re-create the Set for selectedCategories since it doesn't transfer well
  function processData() {
    if (!filters) return;
    const selectedCategories = new Set(filters.selectedCategories);
    const filteredData = data.filter(d =>
      d.value >= filters.valueMin &&
      d.value <= filters.valueMax &&
      selectedCategories.has(d.category)
    );

    const aggregateData = filteredData.reduce((acc, point) => {
      acc[point.category] = (acc[point.category] || 0) + 1;
      return acc;
    }, {});

    const message = {
      type: 'data-update',
      payload: { data, filteredData, aggregateData }
    };
    postMessage(message);
  }

  function initializeAndStream() {
    if (intervalId) clearInterval(intervalId);

    postMessage({ type: 'loading', payload: true });

    setTimeout(() => {
      const windowSize = timeRangeToMs[timeRange];
      const maxDataPoints = windowSize / DATA_GENERATION_INTERVAL;
      data = generateInitialData(maxDataPoints, windowSize);

      postMessage({ type: 'loading', payload: false });
      processData();

      intervalId = self.setInterval(() => {
        const newDataPoint = generateNewDataPoint(data[data.length - 1]);
        const now = newDataPoint.timestamp;
        const windowSize = timeRangeToMs[timeRange];

        let startIndex = 0;
        for (let i = 0; i < data.length; i++) {
          if (now - data[i].timestamp < windowSize) {
            startIndex = i;
            break;
          }
        }
        
        const newWindow = startIndex > 0 ? data.slice(startIndex) : data;
        data = [...newWindow, newDataPoint];
        processData();
      }, DATA_GENERATION_INTERVAL);
    }, 100);
  }

  self.onmessage = (e) => {
    const { type, payload } = e.data;

    switch (type) {
      case 'init':
        timeRange = payload.timeRange;
        filters = payload.filters;
        // The Set object does not transfer via postMessage, so we receive an empty object.
        // We convert it back to a plain array on the main thread and rebuild it here.
        filters.selectedCategories = new Set(filters.selectedCategories);
        initializeAndStream();
        break;
      case 'set-timerange':
        timeRange = payload;
        initializeAndStream();
        break;
      case 'set-filters':
        filters = payload;
        filters.selectedCategories = new Set(filters.selectedCategories);
        processData();
        break;
    }
  };
`;


export const useDataWorker = (timeRange: TimeRange, filters: Filters) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  const [aggregateData, setAggregateData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    try {
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      workerRef.current = new Worker(workerUrl);

      workerRef.current.onmessage = (e: MessageEvent<MainThreadMessage>) => {
        const { type, payload } = e.data;
        if (type === 'data-update') {
          setData(payload.data);
          setFilteredData(payload.filteredData);
          setAggregateData(payload.aggregateData);
        } else if (type === 'loading') {
          setLoading(payload);
        }
      };
      
      // Convert Set to Array before posting, as Set is not structured-clonable in all worker contexts.
      const initialFilters = {...filters, selectedCategories: Array.from(filters.selectedCategories)};
      workerRef.current.postMessage({ type: 'init', payload: { timeRange, filters: initialFilters } });
      
      URL.revokeObjectURL(workerUrl);

    } catch (error) {
      console.error('Failed to initialize data worker:', error);
      setLoading(false);
    }


    return () => {
      workerRef.current?.terminate();
    };
  }, []); // Only run on mount and unmount

  useEffect(() => {
    workerRef.current?.postMessage({ type: 'set-timerange', payload: timeRange });
  }, [timeRange]);

  useEffect(() => {
    // Convert Set to Array before posting
    const filtersToSend = {...filters, selectedCategories: Array.from(filters.selectedCategories)};
    workerRef.current?.postMessage({ type: 'set-filters', payload: filtersToSend });
  }, [filters]);

  return { data, filteredData, aggregateData, loading };
};
