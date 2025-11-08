import { useMemo } from 'react';
import { UseVirtualizationOptions, VirtualItems } from '@/lib/types';

export const useVirtualization = ({
  itemHeight,
  containerHeight,
  itemCount,
  scrollTop,
  overscan = 5,
}: UseVirtualizationOptions): VirtualItems => {
  const { startIndex, endIndex, virtualItems, totalHeight } = useMemo(() => {
    const totalHeight = itemCount * itemHeight;

    let startIndex = Math.floor(scrollTop / itemHeight);
    let endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

    startIndex = Math.max(0, startIndex - overscan);
    endIndex = Math.min(itemCount - 1, endIndex + overscan);

    const virtualItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          left: 0, // fine as a number
          width: '100%',
          height: itemHeight,
        },
      });
    }

    return { startIndex, endIndex, virtualItems, totalHeight };
  }, [itemHeight, containerHeight, itemCount, scrollTop, overscan]);

  return { startIndex, endIndex, virtualItems, totalHeight };
};
