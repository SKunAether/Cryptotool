import { create } from 'zustand';

interface CrackConfigState {
    attackMode: 'mask' | 'dictionary';
    mask: string;
    dictPath: string;
    algorithm: string;
    targetHash: string;

    setConfig: (config: Partial<Pick<CrackConfigState, 'attackMode' | 'mask' | 'dictPath' | 'algorithm' | 'targetHash'>>) => void;
    resetConfig: () => void;
}

const initialConfig = {
    attackMode: 'mask' as const,
    mask: '?d?d?d',
    dictPath: '',
    algorithm: 'md5',
    targetHash: '',
};

export const useCrackConfigStore = create<CrackConfigState>((set) => ({
    ...initialConfig,
    setConfig: (config) => set((state) => ({ ...state, ...config })),
    resetConfig: () => set(initialConfig),
}));