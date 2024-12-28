import React from 'react';
import { Search, Calendar } from 'lucide-react';
import type { DateRange } from '../../types';

interface FileFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function FileFilters({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
}: FileFiltersProps) {
  const dateRangeOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Last 30 Days', value: 'month' },
    { label: 'Custom Range', value: 'custom' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Date Range */}
        <div className="relative">
          <select
            value={dateRange.preset}
            onChange={(e) => {
              const preset = e.target.value as DateRange['preset'];
              let start = new Date();
              let end = new Date();

              switch (preset) {
                case 'today':
                  start.setHours(0, 0, 0, 0);
                  break;
                case 'week':
                  start.setDate(start.getDate() - 7);
                  break;
                case 'month':
                  start.setDate(start.getDate() - 30);
                  break;
                case 'custom':
                  // Keep existing custom dates if switching to custom
                  start = dateRange.start;
                  end = dateRange.end;
                  break;
                default:
                  start = new Date(0);
                  break;
              }

              onDateRangeChange({ preset, start, end });
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Custom Date Range */}
      {dateRange.preset === 'custom' && (
        <div className="flex gap-4">
          <input
            type="date"
            value={dateRange.start.toISOString().split('T')[0]}
            onChange={(e) => onDateRangeChange({
              ...dateRange,
              start: new Date(e.target.value)
            })}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="date"
            value={dateRange.end.toISOString().split('T')[0]}
            onChange={(e) => onDateRangeChange({
              ...dateRange,
              end: new Date(e.target.value)
            })}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
}