import React, { useState } from 'react';
import { Download, Trash2, Share2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useFolderStore } from '../../store/useFolderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ShareDialog } from '../ShareFile/ShareDialog';
import { formatFileSize, formatDate } from '../../lib/fileUtils';
import type { FileType } from '../../types';

interface FileListProps {
  defaultType?: FileType;
  onFileSelect?: (file: { id: string; name: string }) => void;
}

export function FileList({ defaultType, onFileSelect }: FileListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [shareFile, setShareFile] = useState<{ id: string; name: string } | null>(null);
  const [downloading, setDownloading] = useState<string[]>([]);
  
  const { files, removeFile } = useStore();
  const { currentFolder } = useFolderStore();
  const currentUser = useAuthStore(state => state.currentUser);

  // Get files for current folder and type
  const folderFiles = files.filter(file => 
    file.folderId === currentFolder && 
    (defaultType ? file.type === defaultType : true)
  );

  // Filter files based on search
  const filteredFiles = folderFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDownload = async (file: { id: string; url: string; name: string }) => {
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

  const handleShare = (file: { id: string; name: string }) => {
    if (onFileSelect) {
      onFileSelect(file);
    } else {
      setShareFile(file);
    }
  };

  const canShareFile = (file: { uploadedById: string }) => {
    if (!currentUser) return false;
    return currentUser.role === 'super_admin' || 
           currentUser.role === 'admin' ||
           file.uploadedById === currentUser.id;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file) => {
                const isDownloading = downloading.includes(file.id);
                const canShare = canShareFile(file);
                
                return (
                  <tr key={file.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {file.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(file.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          className={`text-blue-600 hover:text-blue-900 ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => !isDownloading && handleDownload(file)}
                          disabled={isDownloading}
                          title="Download file"
                        >
                          <Download className={`h-5 w-5 ${isDownloading ? 'animate-pulse' : ''}`} />
                        </button>
                        {canShare && (
                          <button
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleShare(file)}
                            title="Share file"
                          >
                            <Share2 className="h-5 w-5" />
                          </button>
                        )}
                        {currentUser?.permissions.delete && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => removeFile(file.id)}
                            title="Delete file"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {shareFile && !onFileSelect && (
        <ShareDialog
          fileId={shareFile.id}
          fileName={shareFile.name}
          onClose={() => setShareFile(null)}
        />
      )}
    </div>
  );
}