import { create } from 'zustand';
import { invokeCmd } from '../api';

interface PrivacyStore {
  privacyMode: boolean;
  togglePrivacy: () => void;
  fetchPrivacy: () => Promise<void>;
}

export const usePrivacyStore = create<PrivacyStore>((set, get) => ({
  privacyMode: localStorage.getItem('privacyMode') === 'true',
  togglePrivacy: async () => {
    const newVal = !get().privacyMode;
    try {
      await invokeCmd('set_privacy_mode', { enabled: newVal });
    } catch (err) {
      console.error('Failed to set privacy mode:', err);
    }
    localStorage.setItem('privacyMode', String(newVal));
    set({ privacyMode: newVal });
  },
  fetchPrivacy: async () => {
    // 后端默认为 false，暂时从 localStorage 读取，无需额外同步
  },
}));