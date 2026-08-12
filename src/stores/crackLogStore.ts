import { create } from 'zustand';

interface CrackLogState {
    logs: string[];
    found: string | null;
    addLog: (log: string) => void;
    setFound: (found: string | null) => void;
    clearLogs: () => void;
}

const initialLog = {
    logs: [] as string[],
    found: null as string | null,
};

export const useCrackLogStore = create<CrackLogState>((set) => ({
    ...initialLog,
    addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
    setFound: (found) => set({ found }),
    clearLogs: () => set({ logs: [], found: null }),
}));