import { create } from 'zustand';
import type { ShareLink, SharedFile } from '../types/share';
import { useToastStore } from './useToastStore';
import { useAuthStore } from './useAuthStore';
import { useStore } from './useStore';

interface ShareStore {
  shareLinks: ShareLink[];
  createShareLink: (fileId: string, password: string, expiryHours: number, maxDownloads?: number) => string;
  validateShareLink: (id: string, password: string) => Promise<SharedFile | null>;
  getShareLink: (id: string) => ShareLink | null;
  deleteShareLink: (id: string) => void;
  incrementDownloadCount: (id: string) => void;
}

export const useShareStore = create<ShareStore>((set, get) => ({
  shareLinks: [],

  createShareLink: (fileId, password, expiryHours, maxDownloads) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) {
      useToastStore.getState().addToast('You must be logged in to share files', 'error');
      throw new Error('Not authenticated');
    }

    const id = Math.random().toString(36).substr(2, 9);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const newLink: ShareLink = {
      id,
      fileId,
      password,
      expiresAt,
      createdAt: new Date(),
      createdBy: currentUser.id,
      downloadCount: 0,
      maxDownloads,
    };

    set(state => ({
      shareLinks: [...state.shareLinks, newLink]
    }));

    return id;
  },

  validateShareLink: async (id, password) => {
    const link = get().shareLinks.find(l => l.id === id);
    
    if (!link) {
      useToastStore.getState().addToast('Share link not found', 'error');
      return null;
    }

    if (new Date() > link.expiresAt) {
      useToastStore.getState().addToast('Share link has expired', 'error');
      return null;
    }

    if (link.password !== password) {
      useToastStore.getState().addToast('Invalid password', 'error');
      return null;
    }

    if (link.maxDownloads && link.downloadCount >= link.maxDownloads) {
      useToastStore.getState().addToast('Maximum downloads reached', 'error');
      return null;
    }

    const file = useStore.getState().files.find(f => f.id === link.fileId);
    if (!file) {
      useToastStore.getState().addToast('File not found', 'error');
      return null;
    }

    return {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
    };
  },

  getShareLink: (id) => {
    return get().shareLinks.find(l => l.id === id) || null;
  },

  deleteShareLink: (id) => {
    set(state => ({
      shareLinks: state.shareLinks.filter(l => l.id !== id)
    }));
  },

  incrementDownloadCount: (id) => {
    set(state => ({
      shareLinks: state.shareLinks.map(link =>
        link.id === id
          ? { ...link, downloadCount: link.downloadCount + 1 }
          : link
      )
    }));
  },
}));