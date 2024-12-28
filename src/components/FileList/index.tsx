import React from 'react';
import { FolderNavigation } from '../Folders/FolderNavigation';
import { FileList as FileListComponent } from './FileList';

export function FileList() {
  return (
    <div className="space-y-6">
      <FolderNavigation />
      <FileListComponent />
    </div>
  );
}