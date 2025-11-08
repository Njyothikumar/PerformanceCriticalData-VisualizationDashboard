import React, { useCallback } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Category } from '@/lib/types';

const ALL_CATEGORIES: Category[] = ['A', 'B', 'C', 'D', 'E'];

const FilterPanel: React.FC = () => {
  const { filters, setFilters } = useData();

  const handleCategoryChange = useCallback((category: Category) => {
    setFilters(prevFilters => {
      const newCategories = new Set(prevFilters.selectedCategories);
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }
      return { ...prevFilters, selectedCategories: newCategories };
    });
  }, [setFilters]);
  
  const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value: rawValue } = e.target;
      const value = Number(rawValue);
      setFilters(prev => {
        const newFilters = { ...prev, [name]: value };
        if (name === 'valueMin' && value > newFilters.valueMax) {
          newFilters.valueMax = value;
        }
        if (name === 'valueMax' && value < newFilters.valueMin) {
          newFilters.valueMin = value;
        }
        return newFilters;
      });
  }, [setFilters]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-300">Filters</h3>
      <div>
        <label htmlFor="valueMin" className="block text-sm font-medium text-slate-400">
          Value Range: {filters.valueMin} - {filters.valueMax}
        </label>
        <div className="mt-2 flex flex-col gap-4 pt-2">
            <input
                type="range"
                id="valueMin"
                name="valueMin"
                min="0"
                max="100"
                value={filters.valueMin}
                onChange={handleValueChange}
                className="w-full"
                aria-label="Minimum Value"
            />
             <input
                type="range"
                id="valueMax"
                name="valueMax"
                min="0"
                max="100"
                value={filters.valueMax}
                onChange={handleValueChange}
                className="w-full"
                aria-label="Maximum Value"
            />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400">Categories</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {ALL_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1 text-sm rounded-md transition-all duration-200 font-medium focus:outline-none ring-2 ring-transparent focus:ring-cyan-500 ${
                filters.selectedCategories.has(category)
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(FilterPanel);
