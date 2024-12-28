import React, { useState } from 'react';
import { X, Copy, Link } from 'lucide-react';
import { useShareStore } from '../../store/useShareStore';
import { useToastStore } from '../../store/useToastStore';
import { generatePassword } from '../../lib/security';

interface ShareDialogProps {
  fileId: string;
  fileName: string;
  onClose: () => void;
}

export function ShareDialog({ fileId, fileName, onClose }: ShareDialogProps) {
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [maxDownloads, setMaxDownloads] = useState<number | undefined>();
  const [shareLink, setShareLink] = useState('');
  const [password, setPassword] = useState('');
  const createShareLink = useShareStore(state => state.createShareLink);

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 168) {
      setExpiryHours(value);
    }
  };

  const handleMaxDownloadsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    if (!value || (value > 0 && value <= 100)) {
      setMaxDownloads(value);
    }
  };

  const handleShare = () => {
    try {
      const generatedPassword = generatePassword();
      const linkId = createShareLink(fileId, generatedPassword, expiryHours, maxDownloads);
      const link = `${window.location.origin}/share/${linkId}`;
      setShareLink(link);
      setPassword(generatedPassword);
    } catch (error) {
      useToastStore.getState().addToast('Failed to create share link', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    useToastStore.getState().addToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Share File</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">File name:</p>
            <p className="font-medium">{fileName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires after (hours)
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={expiryHours}
              onChange={handleExpiryChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="24"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum 168 hours (7 days)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum downloads (optional)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={maxDownloads || ''}
              onChange={handleMaxDownloadsChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Unlimited"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum 100 downloads</p>
          </div>

          {!shareLink && (
            <button
              onClick={handleShare}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Generate Share Link
            </button>
          )}

          {shareLink && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Share Link:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(shareLink)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                    title="Copy link"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Password:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={password}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(password)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                    title="Copy password"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Share both the link and password with the recipient. The link will expire in {expiryHours} hours
                {maxDownloads ? ` or after ${maxDownloads} downloads` : ''}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}