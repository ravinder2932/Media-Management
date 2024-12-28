export type Permission = 'view' | 'upload' | 'download' | 'delete' | 'manage_users';

export type Role = 'viewer' | 'editor' | 'admin' | 'super_admin';

export interface UserPermissions {
  view: boolean;
  upload: boolean;
  download: boolean;
  delete: boolean;
  manage_users: boolean;
}

// Default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, UserPermissions> = {
  viewer: {
    view: true,
    upload: false,
    download: false,
    delete: false,
    manage_users: false,
  },
  editor: {
    view: true,
    upload: true,
    download: true,
    delete: false, // Editors cannot delete by default
    manage_users: false,
  },
  admin: {
    view: true,
    upload: true,
    download: true,
    delete: true,
    manage_users: true,
  },
  super_admin: {
    view: true,
    upload: true,
    download: true,
    delete: true,
    manage_users: true,
  },
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: UserPermissions;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuditLog {
  id: string;
  action: 'upload' | 'download' | 'delete' | 'create_user' | 'update_user' | 'delete_user';
  userId: string;
  targetId?: string;
  details: string;
  timestamp: Date;
}