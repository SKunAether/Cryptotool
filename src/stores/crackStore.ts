import { create } from 'zustand';
import { listen } from '@tauri-apps/api/event';
import { invokeCmd } from '../api';

interface CrackProgress {
  task_id: string;
  progress: number;
  checked: number;
  total: number;
  speed: number;
  status: string;
  found: string | null;
  logs: string[];
}

interface CrackState {
  taskId: string | null;
  running: boolean;
  paused: boolean;
  progress: number;
  checked: number;
  total: number;
  speed: number;
  logs: string[];
  found: string | null;
  attackMode: 'mask' | 'dictionary';
  mask: string;
  dictPath: string;
  algorithm: string;
  targetHash: string;

  start: () => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  setConfig: (config: Partial<Pick<CrackState, 'attackMode' | 'mask' | 'dictPath' | 'algorithm' | 'targetHash'>>) => void;
  reset: () => void;
  init: () => void;
}

const initialState = {
  taskId: null as string | null,
  running: false,
  paused: false,
  progress: 0,
  checked: 0,
  total: 0,
  speed: 0,
  logs: [] as string[],
  found: null as string | null,
  attackMode: 'mask' as 'mask' | 'dictionary',
  mask: '?d?d?d',
  dictPath: '',
  algorithm: 'md5',
  targetHash: '',
};

export const useCrackStore = create<CrackState>((set, get) => ({
  ...initialState,

  start: async () => {
    const { attackMode, mask, dictPath, algorithm, targetHash } = get();
    if (!targetHash.trim()) return;
    try {
      set({ running: true, paused: false, found: null, logs: [], progress: 0, checked: 0, total: 0, speed: 0 });
      let id: string;
      if (attackMode === 'mask') {
        id = await invokeCmd<string>('start_mask_crack', { mask, algorithm, targetHash: targetHash.trim() });
      } else {
        if (!dictPath.trim()) return;
        id = await invokeCmd<string>('start_dictionary_crack', { dictPath: dictPath.trim(), algorithm, targetHash: targetHash.trim() });
      }
      set({ taskId: id });
    } catch (err) {
      console.error('启动爆破失败:', err);
      set({ running: false });
    }
  },

  stop: async () => {
    const { taskId } = get();
    if (taskId) {
      try { await invokeCmd('stop_crack', { taskId }); } catch (e) { console.error(e); }
    }
    set({ running: false, paused: false, taskId: null });
  },

  pause: async () => {
    const { taskId } = get();
    if (taskId) {
      try { await invokeCmd('pause_crack', { taskId }); } catch (e) { console.error(e); }
    }
  },

  resume: async () => {
    const { taskId } = get();
    if (taskId) {
      try { await invokeCmd('resume_crack', { taskId }); } catch (e) { console.error(e); }
    }
  },

  setConfig: (config) => set(config),

  reset: () => set(initialState),

  init: () => {
    // 全局监听 crack-update 事件
    listen<CrackProgress>('crack-update', (event) => {
      const data = event.payload;
      set({
        progress: data.progress * 100,
        checked: data.checked,
        total: data.total,
        speed: data.speed,
        logs: data.logs,
        found: data.found ?? get().found, // 保留之前找到的密码
        running: data.status === 'running',
        paused: data.status === 'paused',
      });
      if (data.status === 'completed' || data.status === 'cancelled') {
        set({ running: false, paused: false, taskId: null });
      }
    }).catch(err => console.error('crack event listener error:', err));
  },
}));