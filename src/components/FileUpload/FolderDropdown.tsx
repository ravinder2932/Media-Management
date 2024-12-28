import React, { useState } from 'react';
import { Folder, ChevronRight } from 'lucide-react';
import { useFolderStore } from '../../store/useFolderStore';

export function FolderDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { folders, currentFolder, setCurrentFolder, getFolderPath } = useFolderStore();

  // Get the current folder path
  const folderPath = currentFolder ? getFolderPath(currentFolder) : [];

  // Get all folders organized by hierarchy
  const getFolderHierarchy = (parentId: string | null, level = 0): JSX.Element[] => {
    return Object.values(folders)
      .filter(f => f.folder.parentId === parentId)
      .map(f => (
        <React.Fragment key={f.folder.id}>
          <button
            onClick={() => {
              setCurrentFolder(f.folder.id);
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2
              ${currentFolder === f.folder.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
            style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
          >
            <Folder className="h-4 w-4" />
            <span>{f.folder.name}</span>
          </button>
          {getFolderHierarchy(f.folder.id, level + 1)}
        </React.Fragment>
      ));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm border rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Folder className="h-4 w-4 text-gray-500" />
        <div className="flex items-center text-gray-700">
          {folderPath.length > 0 ? (
            <>
              {folderPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />}
                  <span>{folder.name}</span>
                </React.Fragment>
              ))}
            </>
          ) : (
            <span>Select Folder</span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-64 mt-1 bg-white rounded-md shadow-lg border">
          <button
            onClick={() => {
              setCurrentFolder(null);
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2
              ${!currentFolder ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
          >
            <Folder className="h-4 w-4" />
            <span>Root Directory</span>
          </button>
          {getFolderHierarchy(null)}
        </div>
      )}
    </div>
  );
}