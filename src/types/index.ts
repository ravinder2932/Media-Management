export type FileType = 'image' | 'video' | 'audio' | 'document';

export interface File {
  id: string;
  name: string;
  type: FileType;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  uploadedById: string; // Add this field
  tags: string[];
  folderId: string | null;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface Stats {
  totalFiles: number;
  uploads: number;
  downloads: number;
  users: number;
}

export interface DateRange {
  preset: 'all' | 'today' | 'week' | 'month' | 'custom';
  start: Date;
  end: Date;
}

export * from './folder';