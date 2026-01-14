'use client';

import { useState, useCallback, useEffect } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  placeholder?: string;
  filters?: {
    name: string;
    label: string;
    options: FilterOption[];
  }[];
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  debounceMs?: number;
}

export function SearchFilter({
  placeholder = 'Search...',
  filters = [],
  onSearch,
  onFilterChange,
  debounceMs = 300,
}: SearchFilterProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  const handleFilterChange = useCallback(
    (name: string, value: string) => {
      const newFilters = { ...activeFilters };
      if (value === '') {
        delete newFilters[name];
      } else {
        newFilters[name] = value;
      }
      setActiveFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [activeFilters, onFilterChange]
  );

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setQuery('');
    onFilterChange?.({});
    onSearch?.('');
  }, [onFilterChange, onSearch]);

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                onSearch?.('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {filters.length > 0 && (
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors
              ${
                activeFilterCount > 0
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-blue-600 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {isFiltersOpen && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {filters.map((filter) => (
            <div key={filter.name} className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {filter.label}:
              </label>
              <select
                value={activeFilters[filter.name] || ''}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {(activeFilterCount > 0 || query) && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
