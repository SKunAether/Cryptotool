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

// 辅助：检查 Tauri 事件 API 是否可用
const isEventApiReady = () => {
  return typeof listen === 'function';
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  entries: [],
  init: () => {
    let retries = 0;
    const maxRetries = 30;
    const tryListen = () => {
      if (isEventApiReady()) {
        listen<HistoryEntry[]>('history-update', (event) => {
          if (Array.isArray(event.payload)) {
            set({ entries: event.payload });
          }
        }).catch((err) => {
          console.error('历史监听失败:', err);
        });
      } else {
        retries++;
        if (retries < maxRetries) {
          setTimeout(tryListen, 200);
        } else {
          console.error('历史监听初始化超时');
        }
      }
    };
    tryListen();
  },
}));