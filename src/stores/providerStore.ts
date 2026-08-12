import { create } from 'zustand';
import { invokeCmd } from '../api';

export interface ProviderInfo {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface ProviderStore {
  providers: ProviderInfo[];
  loading: boolean;
  fetchProviders: () => Promise<void>;
}

export const useProviderStore = create<ProviderStore>((set) => ({ // 修复：去掉未使用的 get 参数
  providers: [],
  loading: false,
  fetchProviders: async () => {
    set({ loading: true });
    let retries = 0;
    const maxRetries = 15;
    const attemptFetch = async () => {
      try {
        const list = await invokeCmd<ProviderInfo[]>('list_providers');
        set({ providers: list, loading: false });
      } catch (err) {
        console.error('获取 Provider 失败:', err);
        retries++;
        if (retries < maxRetries) {
          // 等待 500ms 后重试
          setTimeout(() => attemptFetch(), 500);
        } else {
          set({ loading: false });
          console.error('获取 Provider 最终失败');
        }
      }
    };
    attemptFetch();
  },
}));