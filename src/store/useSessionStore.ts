import { create } from 'zustand';
import { SESSION_TIMEOUT, checkSessionTimeout } from '../lib/security';
import { useAuthStore } from './useAuthStore';
import { useToastStore } from './useToastStore';

interface SessionStore {
  lastActivity: Date;
  updateActivity: () => void;
  checkSession: () => boolean;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  lastActivity: new Date(),
  
  updateActivity: () => {
    set({ lastActivity: new Date() });
  },
  
  checkSession: () => {
    const isValid = checkSessionTimeout(get().lastActivity);
    if (!isValid) {
      useAuthStore.getState().logout();
      useToastStore.getState().addToast('Session expired. Please login again.', 'warning');
    }
    return isValid;
  },
}));

// Set up activity listeners
if (typeof window !== 'undefined') {
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    window.addEventListener(event, () => {
      useSessionStore.getState().updateActivity();
    });
  });

  // Check session every minute
  setInterval(() => {
    useSessionStore.getState().checkSession();
  }, 60000);
}