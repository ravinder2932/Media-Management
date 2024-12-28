import React from 'react';
import { Folder, ChevronRight } from 'lucide-react';
import { useFolderStore } from '../../store/useFolderStore';

export function FolderNavigation() {
  const { folders, currentFolder, setCurrentFolder, getFolderPath } = useFolderStore();
  const folderPath = currentFolder ? getFolderPath(currentFolder) : [];

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow">
      <div className="flex items-center space-x-2">
        <Folder className="h-5 w-5 text-gray-500" />
        <div className="flex items-center text-sm">
          <button 
            onClick={() => setCurrentFolder(null)}
            className={`hover:text-blue-600 ${!currentFolder ? 'font-semibold text-blue-600' : 'text-gray-600'}`}
          >
            Root
          </button>
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
              <button
                onClick={() => setCurrentFolder(folder.id)}
                className={`hover:text-blue-600 ${
                  currentFolder === folder.id ? 'font-semibold text-blue-600' : 'text-gray-600'
                }`}
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}