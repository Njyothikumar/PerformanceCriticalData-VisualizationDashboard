export type Category = 'A' | 'B' | 'C' | 'D' | 'E';

export interface DataPoint {
  id: number;
  timestamp: number;
  value: number;
  latency: number;
  category: Category;
}

export type TimeRange = '1m' | '5m' | '1h';

export interface Filters {
  valueMin: number;
  valueMax: number;
  selectedCategories: Set<Category>;
}

export interface DataContextState {
  data: DataPoint[];
  aggregateData: Record<string, number>;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filteredData: DataPoint[];
  loading: boolean;
}

export interface ChartProps {
  data: DataPoint[];
}

export interface UseVirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  itemCount: number;
  scrollTop: number;
  overscan?: number;
}

export interface VirtualItems {
  startIndex: number;
  endIndex: number;
  virtualItems: Array<{
    index: number;
    style: {
      position: 'absolute';
      top: number;
      left: number; // ✅ FIXED: was 0 before
      width: string;
      height: number;
    };
  }>;
  totalHeight: number;
}

// For Data Worker
export type DataWorkerMessage =
  | { type: 'init'; payload: { timeRange: TimeRange; filters: Filters } }
  | { type: 'set-timerange'; payload: TimeRange }
  | { type: 'set-filters'; payload: Filters };

export type MainThreadMessage =
  | { type: 'data-update'; payload: { data: DataPoint[]; filteredData: DataPoint[]; aggregateData: Record<string, number> } }
  | { type: 'loading'; payload: boolean };

// For Render Worker
export type ChartType = 'line' | 'bar' | 'scatter' | 'heatmap';

export type RenderWorkerMessage =
  | { type: 'init'; payload: { canvas: OffscreenCanvas, width: number, height: number, dpr: number } }
  | { type: 'resize'; payload: { width: number, height: number, dpr: number } }
  | { type: 'render'; payload: { chartType: ChartType, data: any } }
  | { type: 'pan-start'; payload: { x: number, y: number } }
  | { type: 'pan-move'; payload: { x: number, y: number } }
  | { type: 'pan-end' }
  | { type: 'zoom'; payload: { x: number, y: number, delta: number } }
  | { type: 'reset-zoom'; payload: { chartType: ChartType } };
