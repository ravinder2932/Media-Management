import React, { useState } from 'react';
import { Folder, ChevronRight, Plus, AlertCircle } from 'lucide-react';
import { useFolderStore } from '../../store/useFolderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditStore } from '../../store/useAuditStore';
import { FolderDropdown } from './FolderDropdown';

export function FolderSelect() {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState('');
  
  const { folders, currentFolder, createFolder, setCurrentFolder, getFolderPath } = useFolderStore();
  const currentUser = useAuthStore(state => state.currentUser);
  const addLog = useAuditStore(state => state.addLog);

  const handleCreateFolder = () => {
    try {
      setError('');
      
      if (!newFolderName.trim()) {
        setError('Folder name cannot be empty');
        return;
      }
      
      if (!currentUser) {
        setError('You must be logged in to create folders');
        return;
      }

      // Check if folder already exists at current level
      const existingFolder = Object.values(folders).find(f => 
        f.folder.name.toLowerCase() === newFolderName.trim().toLowerCase() &&
        f.folder.parentId === currentFolder
      );

      if (existingFolder) {
        const path = getFolderPath(existingFolder.folder.id)
          .map(f => f.name)
          .join(' > ');
        setError(`Folder already exists at: ${path}`);
        return;
      }

      // Create the folder
      const folderId = createFolder(
        newFolderName.trim(),
        currentFolder,
        currentUser.name
      );

      // Log the action
      addLog({
        action: 'create_user',
        userId: currentUser.id,
        targetId: folderId,
        details: `Created folder: ${newFolderName}`,
      });

      // Reset state
      setNewFolderName('');
      setIsCreating(false);
      
      // Set as current folder
      setCurrentFolder(folderId);
    } catch (err) {
      setError('Failed to create folder. Please try again.');
      console.error('Folder creation error:', err);
    }
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <FolderDropdown />
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Folder</span>
        </button>
      </div>

      {isCreating && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="flex-1 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setError('');
                }
              }}
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setError('');
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}