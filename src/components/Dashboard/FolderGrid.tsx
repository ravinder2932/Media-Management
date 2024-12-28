import React from 'react';
import { Folder } from 'lucide-react';
import { useFolderStore } from '../../store/useFolderStore';
import { useStore } from '../../store/useStore';
import type { Folder as FolderType } from '../../types';

interface FolderGridProps {
  folders: FolderType[];
}

export function FolderGrid({ folders }: FolderGridProps) {
  const { setCurrentFolder } = useFolderStore();
  const { files } = useStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {folders.map(folder => {
        // Count files in this folder
        const folderFiles = files.filter(file => file.folderId === folder.id);
        
        return (
          <div
            key={folder.id}
            onClick={() => setCurrentFolder(folder.id)}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <Folder className="h-6 w-6 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-900 block">{folder.name}</span>
                <span className="text-xs text-gray-500">
                  {folderFiles.length} {folderFiles.length === 1 ? 'file' : 'files'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}