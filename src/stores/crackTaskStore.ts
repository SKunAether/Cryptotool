import { create } from 'zustand';
import { listen } from '@tauri-apps/api/event';

export interface CrackProgress {
    task_id: string;
    progress: number;
    checked: number;
    total: number;
    speed: number;
    status: string;
    found: string | null;
    logs: string[];
}

interface CrackTaskState {
    taskId: string | null;
    running: boolean;
    paused: boolean;
    progress: number;
    checked: number;
    total: number;
    speed: number;
    found: string | null;
    logs: string[];

    setTaskId: (id: string | null) => void;
    setRunning: (running: boolean) => void;
    setPaused: (paused: boolean) => void;
    updateProgress: (data: Partial<Omit<CrackTaskState, 'taskId' | 'running' | 'paused'>>) => void;
    resetTask: () => void;
    initTaskListener: () => void;
}

const initialTask = {
    taskId: null as string | null,
    running: false,
    paused: false,
    progress: 0,
    checked: 0,
    total: 0,
    speed: 0,
    found: null as string | null,
    logs: [] as string[],
};

export const useCrackTaskStore = create<CrackTaskState>((set, get) => ({
    ...initialTask,

    setTaskId: (id) => set({ taskId: id }),
    setRunning: (running) => set({ running }),
    setPaused: (paused) => set({ paused }),
    updateProgress: (data) => set((state) => ({ ...state, ...data })),
    resetTask: () => set(initialTask),

    initTaskListener: () => {
        listen<CrackProgress>('crack-update', (event) => {
            const data = event.payload;
            set({
                progress: data.progress * 100,
                checked: data.checked,
                total: data.total,
                speed: data.speed,
                logs: data.logs,
                found: data.found ?? get().found,
                running: data.status === 'running',
                paused: data.status === 'paused',
            });
            if (data.status === 'completed' || data.status === 'cancelled') {
                set({ running: false, paused: false, taskId: null });
            }
        }).catch(err => console.error('crack event listener error:', err));
    },
}));