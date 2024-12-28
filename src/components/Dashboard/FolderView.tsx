import React from 'react';
import { Folder, Plus } from 'lucide-react';
import { useFolderStore } from '../../store/useFolderStore';
import { useStore } from '../../store/useStore';
import { FileUpload } from '../FileUpload/FileUpload';
import type { FileType } from '../../types';

export function FolderView() {
  const { currentFolder, folders } = useFolderStore();
  const { files } = useStore();
  
  // Get current folder info
  const folderInfo = currentFolder ? folders[currentFolder] : null;
  
  // Get files for current folder
  const folderFiles = files.filter(file => file.folderId === currentFolder);
  
  // Count files by type
  const filesByType = folderFiles.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  }, {} as Record<FileType, number>);

  return (
    <div className="space-y-6">
      {/* Folder Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Folder className="h-6 w-6 text-gray-500" />
          <h2 className="text-xl font-semibold">
            {folderInfo ? folderInfo.folder.name : 'Root Directory'}
          </h2>
        </div>
        <FileUpload />
      </div>

      {/* File Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium mb-2">Images</h3>
          <p className="text-3xl font-bold text-blue-600">{filesByType.image || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium mb-2">Videos</h3>
          <p className="text-3xl font-bold text-green-600">{filesByType.video || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium mb-2">Audio</h3>
          <p className="text-3xl font-bold text-yellow-600">{filesByType.audio || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium mb-2">Documents</h3>
          <p className="text-3xl font-bold text-purple-600">{filesByType.document || 0}</p>
        </div>
      </div>

      {/* Empty State */}
      {folderFiles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by uploading some files to this folder
          </p>
          <div className="mt-6">
            <FileUpload />
          </div>
        </div>
      )}
    </div>
  );
}