import React from 'react';
import { Progress } from '../ui/Progress';
import { formatFileSize } from '../../lib/fileUtils';

interface UploadProgressProps {
  fileName: string;
  progress: number;
  loaded: number;
  total: number;
}

export function UploadProgress({ fileName, progress, loaded, total }: UploadProgressProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-2">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{fileName}</span>
        <span className="text-sm text-gray-500">
          {formatFileSize(loaded)} / {formatFileSize(total)}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}