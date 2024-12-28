import { create } from 'zustand';
import type { AuditLog } from '../types/auth';

interface AuditStore {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getLogs: (limit?: number) => AuditLog[];
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  logs: [],
  
  addLog: (logData) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      ...logData,
      timestamp: new Date(),
    };
    
    set((state) => ({
      logs: [newLog, ...state.logs],
    }));
  },
  
  getLogs: (limit) => {
    const logs = get().logs;
    return limit ? logs.slice(0, limit) : logs;
  },
}));