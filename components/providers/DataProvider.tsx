import React, { createContext, useContext, useState, useMemo } from 'react';
import { DataPoint, DataContextState, TimeRange, Filters, Category } from '@/lib/types';
import { useDataWorker } from '@/hooks/useDataWorker';

const DataContext = createContext<DataContextState | undefined>(undefined);

const ALL_CATEGORIES: Category[] = ['A', 'B', 'C', 'D', 'E'];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [filters, setFilters] = useState<Filters>({
    valueMin: 0,
    valueMax: 100,
    selectedCategories: new Set(ALL_CATEGORIES),
  });

  const { data, filteredData, aggregateData, loading } = useDataWorker(timeRange, filters);

  const contextValue = useMemo<DataContextState>(() => ({
    data,
    filteredData,
    aggregateData,
    timeRange,
    setTimeRange,
    filters,
    setFilters,
    loading
  }), [data, filteredData, aggregateData, timeRange, filters]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextState => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
