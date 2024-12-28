import { create } from 'zustand';
import type { Folder, FolderWithFiles, FileType } from '../types';

interface FolderStore {
  folders: Record<string, FolderWithFiles>;
  currentFolder: string | null;
  currentView: FileType | null;
  createFolder: (name: string, parentId: string | null, createdBy: string) => string;
  addFileToFolder: (folderId: string, fileId: string) => void;
  removeFileFromFolder: (folderId: string, fileId: string) => void;
  deleteFolder: (folderId: string) => void;
  setCurrentFolder: (folderId: string | null) => void;
  setCurrentView: (view: FileType | null) => void;
  getFolderContents: (folderId: string) => {
    files: string[];
    subFolders: string[];
  };
  getFolderPath: (folderId: string) => Folder[];
}

export const useFolderStore = create<FolderStore>((set, get) => ({
  folders: {},
  currentFolder: null,
  currentView: null,

  createFolder: (name, parentId, createdBy) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      parentId,
      createdAt: new Date(),
      createdBy,
    };

    const folderWithFiles: FolderWithFiles = {
      folder: newFolder,
      files: [],
      subFolders: [],
    };

    set(state => {
      const newFolders = {
        ...state.folders,
        [newFolder.id]: folderWithFiles,
      };

      if (parentId && state.folders[parentId]) {
        newFolders[parentId] = {
          ...state.folders[parentId],
          subFolders: [...state.folders[parentId].subFolders, newFolder.id],
        };
      }

      return { folders: newFolders };
    });

    return newFolder.id;
  },

  addFileToFolder: (folderId, fileId) => {
    set(state => {
      const folder = state.folders[folderId];
      if (!folder) return state;

      return {
        folders: {
          ...state.folders,
          [folderId]: {
            ...folder,
            files: [...folder.files, fileId],
          },
        },
      };
    });
  },

  removeFileFromFolder: (folderId, fileId) => {
    set(state => {
      const folder = state.folders[folderId];
      if (!folder) return state;

      return {
        folders: {
          ...state.folders,
          [folderId]: {
            ...folder,
            files: folder.files.filter(id => id !== fileId),
          },
        },
      };
    });
  },

  deleteFolder: (folderId) => {
    set(state => {
      const folder = state.folders[folderId];
      if (!folder) return state;

      const newFolders = { ...state.folders };
      delete newFolders[folderId];

      if (folder.folder.parentId && newFolders[folder.folder.parentId]) {
        newFolders[folder.folder.parentId] = {
          ...newFolders[folder.folder.parentId],
          subFolders: newFolders[folder.folder.parentId].subFolders.filter(id => id !== folderId),
        };
      }

      return { 
        folders: newFolders,
        currentFolder: state.currentFolder === folderId ? null : state.currentFolder,
      };
    });
  },

  setCurrentFolder: (folderId) => set({ currentFolder: folderId }),
  
  setCurrentView: (view) => set({ currentView: view }),

  getFolderContents: (folderId) => {
    const folder = get().folders[folderId];
    if (!folder) return { files: [], subFolders: [] };
    return {
      files: folder.files,
      subFolders: folder.subFolders,
    };
  },

  getFolderPath: (folderId) => {
    const path: Folder[] = [];
    let currentId = folderId;
    const folders = get().folders;

    while (currentId) {
      const folder = folders[currentId]?.folder;
      if (!folder) break;
      
      path.unshift(folder);
      currentId = folder.parentId;
    }

    return path;
  },
}));