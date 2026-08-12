import { describe, it, expect, beforeEach } from 'vitest';
import { useCrackConfigStore } from '../crackConfigStore';

describe('crackConfigStore', () => {
    beforeEach(() => {
        useCrackConfigStore.getState().resetConfig();
    });

    it('should update mask', () => {
        const store = useCrackConfigStore.getState();
        store.setConfig({ mask: '?d?d?d?d' });
        const updatedStore = useCrackConfigStore.getState();
        expect(updatedStore.mask).toBe('?d?d?d?d');
    });

    it('should update attack mode', () => {
        const store = useCrackConfigStore.getState();
        store.setConfig({ attackMode: 'dictionary' });
        const updatedStore = useCrackConfigStore.getState();
        expect(updatedStore.attackMode).toBe('dictionary');
    });

    it('should reset config to initial', () => {
        const store = useCrackConfigStore.getState();
        store.setConfig({ mask: 'custom', algorithm: 'sha256' });
        store.resetConfig();
        const resetStore = useCrackConfigStore.getState();
        expect(resetStore.mask).toBe('?d?d?d');
        expect(resetStore.algorithm).toBe('md5');
        expect(resetStore.attackMode).toBe('mask');
    });
});