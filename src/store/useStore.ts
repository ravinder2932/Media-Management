import { create } from 'zustand';
import type { File, Stats, User } from '../types';
import { useAuthStore } from './useAuthStore';
import { useToastStore } from './useToastStore';

interface Store {
  files: File[];
  currentUser: User | null;
  stats: Stats;
  setFiles: (files: File[]) => void;
  addFile: (file: Omit<File, 'id'>) => string;
  removeFile: (id: string) => void;
  setCurrentUser: (user: User | null) => void;
  updateStats: (stats: Partial<Stats>) => void;
  downloadFile: (fileId: string) => void;
  getFilesInFolder: (folderId: string | null) => File[];
}

export const useStore = create<Store>((set, get) => ({
  files: [],
  currentUser: null,
  stats: {
    totalFiles: 0,
    uploads: 0,
    downloads: 0,
    users: 0,
  },
  
  setFiles: (files) => set({ files }),
  
  addFile: (fileData) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newFile = { ...fileData, id };
    
    set((state) => ({ 
      files: [...state.files, newFile],
      stats: {
        ...state.stats,
        totalFiles: state.stats.totalFiles + 1,
        uploads: state.stats.uploads + 1,
      }
    }));
    
    return id;
  },
  
  removeFile: (id) => {
    const currentUser = useAuthStore.getState().currentUser;
    const file = get().files.find(f => f.id === id);
    
    if (!file || !currentUser) {
      useToastStore.getState().addToast('Permission denied: Cannot delete file', 'error');
      return;
    }

    // Check permissions
    const canDelete = 
      currentUser.role === 'super_admin' || 
      currentUser.role === 'admin' ||
      (currentUser.permissions.delete && file.uploadedById === currentUser.id);

    if (!canDelete) {
      useToastStore.getState().addToast('Permission denied: Cannot delete file', 'error');
      return;
    }

    set((state) => ({ 
      files: state.files.filter((f) => f.id !== id),
      stats: {
        ...state.stats,
        totalFiles: state.stats.totalFiles - 1,
      }
    }));

    useToastStore.getState().addToast('File deleted successfully', 'success');
  },
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  updateStats: (newStats) => set((state) => ({ 
    stats: { ...state.stats, ...newStats }
  })),
  
  downloadFile: (fileId) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser?.permissions.download) {
      useToastStore.getState().addToast('Permission denied: Cannot download file', 'error');
      return;
    }

    set(state => ({
      stats: {
        ...state.stats,
        downloads: state.stats.downloads + 1,
      }
    }));
  },

  getFilesInFolder: (folderId) => {
    const files = get().files;
    return files.filter(file => file.folderId === folderId);
  },
}));