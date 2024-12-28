import React from 'react';
import { Trash2, Copy, Link, Clock, Download } from 'lucide-react';
import { useShareStore } from '../../store/useShareStore';
import { useToastStore } from '../../store/useToastStore';
import { formatDate } from '../../lib/fileUtils';

export function ShareLinksList() {
  const { shareLinks, deleteShareLink } = useShareStore();
  const addToast = useToastStore(state => state.addToast);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'success');
  };

  const isExpired = (expiresAt: Date) => {
    return new Date() > new Date(expiresAt);
  };

  const getTimeLeft = (expiresAt: Date) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m left`;
  };

  if (shareLinks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No active share links</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shareLinks.map((link) => {
        const expired = isExpired(link.expiresAt);
        const timeLeft = getTimeLeft(link.expiresAt);
        const shareUrl = `${window.location.origin}/share/${link.id}`;

        return (
          <div 
            key={link.id}
            className={`bg-white p-4 rounded-lg border ${
              expired ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Link className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Share Link #{link.id.slice(0, 6)}</span>
              </div>
              <button
                onClick={() => deleteShareLink(link.id)}
                className="text-red-600 hover:text-red-800"
                title="Delete link"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{timeLeft}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Download className="h-4 w-4" />
                  <span>
                    {link.downloadCount} {link.maxDownloads ? `/ ${link.maxDownloads}` : ''} downloads
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-1 text-sm border rounded bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="p-1 text-gray-600 hover:text-gray-900"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}