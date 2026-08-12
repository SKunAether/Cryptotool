import { useCrackConfigStore } from './crackConfigStore';
import { useCrackTaskStore } from './crackTaskStore';
import { useCrackLogStore } from './crackLogStore';
import { invokeCmd } from '../api';

export const useCrackStore = () => {
  const config = useCrackConfigStore();
  const task = useCrackTaskStore();
  const log = useCrackLogStore();

  // 启动方法
  const start = async () => {
    const { attackMode, mask, dictPath, algorithm, targetHash } = config;
    if (!targetHash.trim()) return;

    task.resetTask();
    log.clearLogs();
    task.setRunning(true);
    task.setPaused(false);

    try {
      let id: string;
      if (attackMode === 'mask') {
        id = await invokeCmd<string>('start_mask_crack', { mask, algorithm, targetHash: targetHash.trim() });
      } else {
        if (!dictPath.trim()) return;
        id = await invokeCmd<string>('start_dictionary_crack', { dictPath: dictPath.trim(), algorithm, targetHash: targetHash.trim() });
      }
      task.setTaskId(id);
    } catch (err) {
      console.error('启动爆破失败:', err);
      task.setRunning(false);
    }
  };

  const stop = async () => {
    const { taskId } = task;
    if (taskId) {
      try { await invokeCmd('stop_crack', { taskId }); } catch (e) { console.error(e); }
    }
    task.setRunning(false);
    task.setPaused(false);
    task.setTaskId(null);
  };

  const pause = async () => {
    const { taskId } = task;
    if (taskId) {
      try { await invokeCmd('pause_crack', { taskId }); } catch (e) { console.error(e); }
    }
  };

  const resume = async () => {
    const { taskId } = task;
    if (taskId) {
      try { await invokeCmd('resume_crack', { taskId }); } catch (e) { console.error(e); }
    }
  };

  // 清空日志（不影响其他状态）
  const clearLogs = () => {
    log.clearLogs();
  };

  // 重置所有
  const reset = () => {
    config.resetConfig();
    task.resetTask();
    log.clearLogs();
  };

  // 初始化事件监听
  const init = () => {
    task.initTaskListener();
  };

  return {
    // 配置
    attackMode: config.attackMode,
    mask: config.mask,
    dictPath: config.dictPath,
    algorithm: config.algorithm,
    targetHash: config.targetHash,
    setConfig: config.setConfig,

    // 任务状态
    taskId: task.taskId,
    running: task.running,
    paused: task.paused,
    progress: task.progress,
    checked: task.checked,
    total: task.total,
    speed: task.speed,

    // 日志
    logs: task.logs,
    found: task.found,

    // 方法
    start,
    stop,
    pause,
    resume,
    clearLogs,   // 新增
    reset,
    init,
  };
};

export default useCrackStore;