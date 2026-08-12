use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use crate::task::state::TaskStatus;
use crate::error::{AppError, ErrorSeverity};

pub struct TaskManager {
    tasks: Mutex<HashMap<String, TaskStatus>>,
    cancel_flags: Mutex<HashMap<String, Arc<AtomicBool>>>,
    pause_flags: Mutex<HashMap<String, Arc<AtomicBool>>>,  // 新增暂停标志
}

impl TaskManager {
    pub fn new() -> Self {
        TaskManager {
            tasks: Mutex::new(HashMap::new()),
            cancel_flags: Mutex::new(HashMap::new()),
            pause_flags: Mutex::new(HashMap::new()),
        }
    }

    pub fn create(&self, task_id: String) -> Result<(), AppError> {
        let mut tasks = self.tasks.lock().map_err(|e|
            AppError::with_params("task.lock_error", vec![e.to_string()], ErrorSeverity::Error))?;
        tasks.insert(task_id, TaskStatus::Created);
        Ok(())
    }

    pub fn update_status(&self, task_id: &str, new_status: TaskStatus) -> Result<(), AppError> {
        let mut tasks = self.tasks.lock().map_err(|e|
            AppError::with_params("task.lock_error", vec![e.to_string()], ErrorSeverity::Error))?;
        if let Some(status) = tasks.get_mut(task_id) {
            *status = new_status;
            Ok(())
        } else {
            Err(AppError::new("task.not_found", ErrorSeverity::Error))
        }
    }

    pub fn get_status(&self, task_id: &str) -> Result<TaskStatus, AppError> {
        let tasks = self.tasks.lock().map_err(|e|
            AppError::with_params("task.lock_error", vec![e.to_string()], ErrorSeverity::Error))?;
        tasks.get(task_id).cloned().ok_or_else(||
            AppError::new("task.not_found", ErrorSeverity::Error))
    }

    pub fn register_cancel_flag(&self, task_id: String, flag: Arc<AtomicBool>) {
        let mut flags = self.cancel_flags.lock().unwrap();
        flags.insert(task_id, flag);
    }

    pub fn register_pause_flag(&self, task_id: String, flag: Arc<AtomicBool>) {
        let mut flags = self.pause_flags.lock().unwrap();
        flags.insert(task_id, flag);
    }

    pub fn cancel_task(&self, task_id: &str) -> Result<(), AppError> {
        let flags = self.cancel_flags.lock().map_err(|e|
            AppError::with_params("task.lock_error", vec![e.to_string()], ErrorSeverity::Error))?;
        if let Some(flag) = flags.get(task_id) {
            flag.store(true, Ordering::Relaxed);
            Ok(())
        } else {
            Err(AppError::new("task.not_found", ErrorSeverity::Error))
        }
    }

    pub fn pause_task(&self, task_id: &str) -> Result<(), AppError> {
        let flags = self.pause_flags.lock().map_err(|e|
            AppError::with_params("task.lock_error", vec![e.to_string()], ErrorSeverity::Error))?;
        if let Some(flag) = flags.get(task_id) {
            flag.store(true, Ordering::Relaxed);
            // 更新任务状态为 Paused
            self.update_status(task_id, TaskStatus::Paused)?;
            Ok(())
        } else {
            Err(AppError::new("task.not_found", ErrorSeverity::Error))
        }
    }

    pub fn resume_task(&self, task_id: &str) -> Result<(), AppError> {
        let flags = self.pause_flags.lock().map_err(|e|
            AppError::with_params("task.lock_error", vec![e.to_string()], ErrorSeverity::Error))?;
        if let Some(flag) = flags.get(task_id) {
            flag.store(false, Ordering::Relaxed);
            self.update_status(task_id, TaskStatus::Running)?;
            Ok(())
        } else {
            Err(AppError::new("task.not_found", ErrorSeverity::Error))
        }
    }

    pub fn active_count(&self) -> usize {
        let tasks = self.tasks.lock().unwrap();
        tasks.values().filter(|status| {
        matches!(status, TaskStatus::Running | TaskStatus::Paused)
        }).count()
    }
}