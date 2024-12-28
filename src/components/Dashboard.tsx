import React from 'react';
import { FileText, Image, Music, Video, Upload, Download, Users, Folder } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useFolderStore } from '../store/useFolderStore';
import { FolderNavigation } from './Folders/FolderNavigation';
import { FileTypeView } from './FileList/FileTypeView';
import { StatCard } from './Dashboard/StatCard';
import { FolderGrid } from './Dashboard/FolderGrid';
import type { FileType } from '../types';

export function Dashboard() {
  const { files, stats } = useStore();
  const { currentFolder, folders, setCurrentView } = useFolderStore();
  const [selectedView, setSelectedView] = React.useState<FileType | null>(null);
  
  if (selectedView) {
    return <FileTypeView type={selectedView} onBack={() => setSelectedView(null)} />;
  }

  const currentFolderInfo = currentFolder ? folders[currentFolder] : null;
  const folderFiles = files.filter(file => file.folderId === currentFolder);
  const subFolders = Object.values(folders)
    .filter(f => f.folder.parentId === currentFolder)
    .map(f => f.folder);
  
  const folderStats = {
    uploads: folderFiles.length,
    downloads: stats.downloads,
    totalFiles: folderFiles.length,
    users: stats.users
  };
  
  const filesByType = folderFiles.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  }, {} as Record<FileType, number>);

  const handleFileTypeClick = (type: FileType) => {
    setSelectedView(type);
    setCurrentView(type);
  };

  return (
    <div className="space-y-6">
      <FolderNavigation />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Upload} 
          title={`${currentFolder ? 'Folder' : 'Total'} Uploads`}
          value={currentFolder ? folderStats.uploads : stats.uploads}
          className="border-l-4 border-blue-500"
        />
        <StatCard 
          icon={Download} 
          title="Downloads" 
          value={stats.downloads}
          className="border-l-4 border-green-500"
        />
        <StatCard 
          icon={FileText} 
          title={`${currentFolder ? 'Folder' : 'Total'} Files`}
          value={currentFolder ? folderStats.totalFiles : stats.totalFiles}
          className="border-l-4 border-yellow-500"
        />
        <StatCard 
          icon={Users} 
          title="Total Users" 
          value={stats.users}
          className="border-l-4 border-purple-500"
        />
      </div>

      {/* Current Folder View */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Folder className="h-6 w-6 text-gray-500" />
            <h2 className="text-lg md:text-xl font-semibold">
              {currentFolderInfo ? currentFolderInfo.folder.name : 'Root Directory'}
            </h2>
          </div>
        </div>

        {/* Subfolders */}
        {subFolders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Folders</h3>
            <FolderGrid folders={subFolders} />
          </div>
        )}

        {/* File Types Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Files</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'image' as FileType, icon: Image, label: 'Images' },
              { type: 'video' as FileType, icon: Video, label: 'Videos' },
              { type: 'audio' as FileType, icon: Music, label: 'Audio' },
              { type: 'document' as FileType, icon: FileText, label: 'Documents' }
            ].map(({ type, icon: Icon, label }) => (
              <div 
                key={type}
                onClick={() => handleFileTypeClick(type)}
                className="bg-white p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{label}</p>
                    <p className="text-xl md:text-2xl font-bold mt-2">{filesByType[type] || 0}</p>
                  </div>
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {subFolders.length === 0 && Object.values(filesByType).every(count => count === 0) && (
          <div className="text-center py-8 md:py-12">
            <Folder className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No files or folders</h3>
            <p className="mt-1 text-sm text-gray-500">
              {currentFolder ? 'This folder is empty' : 'Start by creating a folder or uploading files'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}