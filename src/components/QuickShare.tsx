import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { FileList } from './FileList/FileList';
import { ShareDialog } from './ShareFile/ShareDialog';
import { ShareLinksList } from './QuickShare/ShareLinksList';

export function QuickShare() {
  const [selectedFile, setSelectedFile] = useState<{ id: string; name: string } | null>(null);
  const { files } = useStore();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Quick Share Files</h2>
        <p className="text-gray-600 mb-6">
          Select a file to generate a secure, time-limited sharing link. Recipients can download the file using the link and password.
        </p>
        
        <FileList onFileSelect={setSelectedFile} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Active Share Links</h2>
        <ShareLinksList />
      </div>

      {selectedFile && (
        <ShareDialog
          fileId={selectedFile.id}
          fileName={selectedFile.name}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}