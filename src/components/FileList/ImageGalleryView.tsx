import React, { useState } from 'react';
import { Download, Trash2, Search, Calendar } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useFolderStore } from '../../store/useFolderStore';
import { formatFileSize, formatDate } from '../../lib/fileUtils';
import type { DateRange } from '../../types';

export function ImageGalleryView() {
  const { files, removeFile } = useStore();
  const { currentFolder } = useFolderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    preset: 'all',
    start: new Date(0),
    end: new Date(),
  });
  const [downloading, setDownloading] = useState<string[]>([]);

  // Get images for current folder
  const folderImages = files.filter(file => 
    file.folderId === currentFolder && 
    file.type === 'image'
  );

  // Filter images based on search and date range
  const filteredImages = folderImages.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const fileDate = new Date(file.uploadedAt);
    const matchesDate = fileDate >= dateRange.start && fileDate <= dateRange.end;
    
    return matchesSearch && matchesDate;
  });

  const handleDownload = async (file: { id: string, url: string, name: string }) => {
    try {
      setDownloading(prev => [...prev, file.id]);
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(prev => prev.filter(id => id !== file.id));
    }
  };

  const handleBulkDownload = async () => {
    const filesToDownload = filteredImages.filter(file => selectedFiles.includes(file.id));
    for (const file of filesToDownload) {
      await handleDownload(file);
    }
  };

  const handleBulkDelete = () => {
    selectedFiles.forEach(fileId => removeFile(fileId));
    setSelectedFiles([]);
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const toggleAllFiles = () => {
    setSelectedFiles(prev => 
      prev.length === filteredImages.length
        ? []
        : filteredImages.map(f => f.id)
    );
  };

  const dateRangeOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Last 30 Days', value: 'month' },
    { label: 'Custom Range', value: 'custom' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

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
                  start = dateRange.start;
                  end = dateRange.end;
                  break;
                default:
                  start = new Date(0);
                  break;
              }

              setDateRange({ preset, start, end });
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
            onChange={(e) => setDateRange({
              ...dateRange,
              start: new Date(e.target.value)
            })}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="date"
            value={dateRange.end.toISOString().split('T')[0]}
            onChange={(e) => setDateRange({
              ...dateRange,
              end: new Date(e.target.value)
            })}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Bulk Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedFiles.length === filteredImages.length && filteredImages.length > 0}
            onChange={toggleAllFiles}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-600">
            {selectedFiles.length > 0 ? `Selected ${selectedFiles.length} images` : 'Select all'}
          </span>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="flex space-x-4">
            <button
              onClick={handleBulkDownload}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Download Selected ({selectedFiles.length})
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredImages.map((file) => {
          const isDownloading = downloading.includes(file.id);
          const isSelected = selectedFiles.includes(file.id);
          
          return (
            <div 
              key={file.id}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                isSelected ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-48 object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => !isDownloading && handleDownload(file)}
                      disabled={isDownloading}
                      className="p-2 text-white hover:text-blue-400 transition-colors"
                    >
                      <Download className={`h-5 w-5 ${isDownloading ? 'animate-pulse' : ''}`} />
                    </button>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-white hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFileSelection(file.id)}
                  className="rounded border-gray-300 text-blue-600"
                />
              </div>

              {/* File Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                <div className="truncate">{file.name}</div>
                <div className="flex justify-between text-xs">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.uploadedAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No images found</p>
        </div>
      )}
    </div>
  );
}