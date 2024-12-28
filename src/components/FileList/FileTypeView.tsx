import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { FileList } from './FileList';
import { ImageGalleryView } from './ImageGalleryView';
import { FolderNavigation } from '../Folders/FolderNavigation';
import { useFolderStore } from '../../store/useFolderStore';
import type { FileType } from '../../types';

interface FileTypeViewProps {
  type: FileType;
  onBack: () => void;
}

export function FileTypeView({ type, onBack }: FileTypeViewProps) {
  const { currentFolder, folders } = useFolderStore();
  const folderName = currentFolder ? folders[currentFolder]?.folder.name : 'Root';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>
        <FolderNavigation />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          {type === 'image' && 'Images'}
          {type === 'video' && 'Videos'}
          {type === 'audio' && 'Audio'}
          {type === 'document' && 'Documents'}
          <span className="text-gray-500 text-sm ml-2">
            in {folderName}
          </span>
        </h2>
        
        {type === 'image' ? (
          <ImageGalleryView />
        ) : (
          <FileList defaultType={type} />
        )}
      </div>
    </div>
  );
}