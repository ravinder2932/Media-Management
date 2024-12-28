import { create } from 'zustand';
import { DEFAULT_ROLE_PERMISSIONS } from '../types/auth';
import type { User, Role, UserPermissions } from '../types/auth';
import { useToastStore } from './useToastStore';

interface AuthStore {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  createUser: (userData: {
    email: string;
    password: string;
    name: string;
    role: Role;
  }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserPermissions: (userId: string, permissions: Partial<UserPermissions>) => Promise<void>;
  updateUserRole: (userId: string, role: Role) => Promise<void>;
  updateUserPassword: (userId: string, newPassword: string, currentUser: User) => Promise<void>;
}

const SUPER_ADMIN = {
  id: 'super-admin',
  email: 'admin@example.com',
  password: 'admin123',
  name: 'Super Admin',
  role: 'super_admin' as Role,
  permissions: DEFAULT_ROLE_PERMISSIONS.super_admin,
  createdAt: new Date(),
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: null,
  users: [],
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  login: async (email: string, password: string) => {
    if (email === SUPER_ADMIN.email && password === SUPER_ADMIN.password) {
      set({ currentUser: SUPER_ADMIN });
      useToastStore.getState().addToast('Welcome Super Admin!', 'success');
      return;
    }
    
    const users = get().users;
    const user = users.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      useToastStore.getState().addToast('Invalid email or password', 'error');
      throw new Error('Invalid credentials');
    }

    set({ currentUser: user });
    useToastStore.getState().addToast(`Welcome back, ${user.name}!`, 'success');
  },
  
  logout: () => {
    set({ currentUser: null });
    useToastStore.getState().addToast('Logged out successfully', 'success');
  },
  
  createUser: async (userData) => {
    const users = get().users;
    
    // Check if email already exists
    if (users.some(u => u.email === userData.email)) {
      useToastStore.getState().addToast('Email already exists', 'error');
      throw new Error('Email already exists');
    }

    // Validate password
    if (userData.password.length < 6) {
      useToastStore.getState().addToast('Password must be at least 6 characters long', 'error');
      throw new Error('Invalid password');
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      permissions: DEFAULT_ROLE_PERMISSIONS[userData.role],
      createdAt: new Date(),
    };
    
    set((state) => ({
      users: [...state.users, newUser],
    }));

    useToastStore.getState().addToast('User created successfully', 'success');
  },
  
  deleteUser: async (userId) => {
    const currentUser = get().currentUser;
    
    // Prevent deleting super admin
    if (userId === SUPER_ADMIN.id) {
      useToastStore.getState().addToast('Cannot delete super admin account', 'error');
      throw new Error('Cannot delete super admin');
    }

    // Prevent self-deletion
    if (userId === currentUser?.id) {
      useToastStore.getState().addToast('Cannot delete your own account', 'error');
      throw new Error('Cannot delete own account');
    }

    set((state) => ({
      users: state.users.filter(user => user.id !== userId),
    }));

    useToastStore.getState().addToast('User deleted successfully', 'success');
  },
  
  updateUserPermissions: async (userId, permissions) => {
    if (userId === SUPER_ADMIN.id) {
      useToastStore.getState().addToast('Cannot modify super admin permissions', 'error');
      throw new Error('Cannot modify super admin');
    }

    set((state) => ({
      users: state.users.map(user => 
        user.id === userId 
          ? { ...user, permissions: { ...user.permissions, ...permissions } }
          : user
      ),
    }));

    useToastStore.getState().addToast('Permissions updated successfully', 'success');
  },

  updateUserRole: async (userId, role) => {
    if (userId === SUPER_ADMIN.id) {
      useToastStore.getState().addToast('Cannot modify super admin role', 'error');
      throw new Error('Cannot modify super admin');
    }

    set((state) => ({
      users: state.users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              role,
              permissions: DEFAULT_ROLE_PERMISSIONS[role]
            }
          : user
      ),
    }));

    useToastStore.getState().addToast('User role updated successfully', 'success');
  },

  updateUserPassword: async (userId: string, newPassword: string, currentUser: User) => {
    // Validate password
    if (!newPassword || newPassword.length < 6) {
      useToastStore.getState().addToast('Password must be at least 6 characters long', 'error');
      throw new Error('Invalid password');
    }

    // Only super admin can change other users' passwords
    if (userId !== currentUser.id && currentUser.role !== 'super_admin') {
      useToastStore.getState().addToast('Permission denied: Only super admin can change other users passwords', 'error');
      throw new Error('Permission denied');
    }

    // Cannot change super admin password unless you are super admin
    if (userId === SUPER_ADMIN.id && currentUser.id !== SUPER_ADMIN.id) {
      useToastStore.getState().addToast('Permission denied: Cannot change super admin password', 'error');
      throw new Error('Permission denied');
    }

    set((state) => ({
      users: state.users.map(user => 
        user.id === userId 
          ? { ...user, password: newPassword }
          : user
      ),
    }));

    useToastStore.getState().addToast('Password updated successfully', 'success');
  },
}));