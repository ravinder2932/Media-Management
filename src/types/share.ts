import { FileType } from './index';

export interface ShareLink {
  id: string;
  fileId: string;
  password: string;
  expiresAt: Date;
  createdAt: Date;
  createdBy: string;
  downloadCount: number;
  maxDownloads?: number;
}

export interface SharedFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  url: string;
}