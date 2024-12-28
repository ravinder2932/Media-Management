import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, Download, FileText } from 'lucide-react';
import { useShareStore } from '../../store/useShareStore';
import { formatFileSize } from '../../lib/fileUtils';
import type { SharedFile } from '../../types/share';

export function ShareDownload() {
  const { id } = useParams<{ id: string }>();
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<SharedFile | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { validateShareLink, incrementDownloadCount } = useShareStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await validateShareLink(id!, password);
      if (result) {
        setFile(result);
      }
    } catch (err) {
      setError('Failed to validate share link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;

    try {
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
      incrementDownloadCount(id!);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <FileText className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <h1 className="text-xl font-semibold">Secure File Download</h1>
        </div>

        {!file ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                  placeholder="Enter the file password"
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Validating...' : 'Access File'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">File name:</p>
              <p className="font-medium">{file.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Size:</p>
              <p className="font-medium">{formatFileSize(file.size)}</p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Download File</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}