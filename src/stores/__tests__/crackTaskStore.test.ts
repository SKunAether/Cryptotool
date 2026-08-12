import { describe, it, expect, beforeEach } from 'vitest';
import { useCrackTaskStore } from '../crackTaskStore';

describe('crackTaskStore', () => {
    beforeEach(() => {
        useCrackTaskStore.getState().resetTask();
    });

    it('should set task id', () => {
        const store = useCrackTaskStore.getState();
        store.setTaskId('task-123');
        const updatedStore = useCrackTaskStore.getState();
        expect(updatedStore.taskId).toBe('task-123');
    });

    it('should set running state', () => {
        const store = useCrackTaskStore.getState();
        store.setRunning(true);
        const updatedStore = useCrackTaskStore.getState();
        expect(updatedStore.running).toBe(true);
    });

    it('should reset task state', () => {
        const store = useCrackTaskStore.getState();
        store.setRunning(true);
        store.setPaused(true);
        store.updateProgress({ progress: 50, checked: 100 });
        store.resetTask();
        const resetStore = useCrackTaskStore.getState();
        expect(resetStore.running).toBe(false);
        expect(resetStore.paused).toBe(false);
        expect(resetStore.progress).toBe(0);
        expect(resetStore.checked).toBe(0);
    });
});