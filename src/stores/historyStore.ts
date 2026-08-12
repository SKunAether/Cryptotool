import { create } from 'zustand';
import { listen } from '@tauri-apps/api/event';

export interface HistoryEntry {
  timestamp: string;
  action: string;
  status: string;
}

interface HistoryStore {
  entries: HistoryEntry[];
  init: () => void;
}

let isListening = false;

export const useHistoryStore = create<HistoryStore>((set) => ({
  entries: [], // 初始为空
  init: () => {
    if (isListening) return;
    isListening = true;
    listen<HistoryEntry[]>('history-update', (event) => {
      console.log('[historyStore] 收到历史更新:', event.payload);
      if (Array.isArray(event.payload)) {
        set({ entries: event.payload });
      }
    }).catch(err => console.error('历史监听失败:', err));
  },
}));