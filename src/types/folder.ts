export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  createdBy: string;
}

export interface FolderWithFiles {
  folder: Folder;
  files: string[]; // File IDs in this folder
  subFolders: string[]; // Subfolder IDs
}