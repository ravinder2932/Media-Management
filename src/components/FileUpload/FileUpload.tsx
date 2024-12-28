import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { UploadProgress } from './UploadProgress';
import { FolderSelect } from './FolderSelect';
import { getFileType } from '../../lib/fileUtils';
import { useFolderStore } from '../../store/useFolderStore';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditStore } from '../../store/useAuditStore';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  loaded: number;
  total: number;
}

export function FileUpload() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const { currentFolder, addFileToFolder } = useFolderStore();
  const { addFile } = useStore();
  const currentUser = useAuthStore(state => state.currentUser);
  const addLog = useAuditStore(state => state.addLog);

  const simulateUpload = async (file: File): Promise<void> => {
    if (!currentUser) return;

    const chunkSize = 1024 * 1024; // 1MB chunks
    let loaded = 0;
    const total = file.size;
    const uploadId = Math.random().toString(36).substr(2, 9);

    const updateProgress = (newLoaded: number) => {
      setUploadingFiles(files => 
        files.map(f => 
          f.id === uploadId 
            ? { ...f, progress: (newLoaded / total) * 100, loaded: newLoaded }
            : f
        )
      );
    };

    setUploadingFiles(files => [
      ...files,
      { id: uploadId, file, progress: 0, loaded: 0, total }
    ]);

    try {
      while (loaded < total) {
        loaded += chunkSize;
        if (loaded > total) loaded = total;
        await new Promise(resolve => setTimeout(resolve, 100));
        updateProgress(loaded);
      }

      // Create file object with folder ID and user ID
      const fileData = {
        name: file.name,
        type: getFileType(file),
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        uploadedBy: currentUser.name,
        uploadedById: currentUser.id,
        tags: [],
        folderId: currentFolder
      };

      // Add file to store
      const fileId = addFile(fileData);

      // Add file to folder if one is selected
      if (currentFolder) {
        addFileToFolder(currentFolder, fileId);
      }

      // Add audit log
      addLog({
        action: 'upload',
        userId: currentUser.id,
        targetId: fileId,
        details: `Uploaded file: ${file.name} ${currentFolder ? `to folder: ${currentFolder}` : 'to root'}`,
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingFiles(files => files.filter(f => f.id !== uploadId));
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await simulateUpload(file);
    }
  }, [currentFolder, addFile, addFileToFolder, currentUser, addLog]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'video/*': ['.mp4', '.webm'],
      'audio/*': ['.mp3', '.wav'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  if (!currentUser?.permissions.upload) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">You don't have permission to upload files</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FolderSelect />
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : `Drop files here or click to select files ${currentFolder ? 'for this folder' : ''}`}
          </p>
          <p className="text-xs text-gray-500">
            Supports images, videos, audio, and documents
          </p>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Uploading Files</h3>
          {uploadingFiles.map((file) => (
            <UploadProgress
              key={file.id}
              fileName={file.file.name}
              progress={file.progress}
              loaded={file.loaded}
              total={file.total}
            />
          ))}
        </div>
      )}
    </div>
  );
}