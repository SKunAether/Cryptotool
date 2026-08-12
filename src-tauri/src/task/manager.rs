use crate::error::{AppError, ErrorSeverity};
use crate::task::state::TaskStatus;
use serde_json::Value;
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

pub struct TaskManager {
    tasks: Mutex<HashMap<String, TaskStatus>>,
    cancel_flags: Mutex<HashMap<String, Arc<AtomicBool>>>,
    pause_flags: Mutex<HashMap<String, Arc<AtomicBool>>>,
    metadata: Mutex<HashMap<String, Value>>,
}

impl TaskManager {
    pub fn new() -> Self {
        TaskManager {
            tasks: Mutex::new(HashMap::new()),
            cancel_flags: Mutex::new(HashMap::new()),
            pause_flags: Mutex::new(HashMap::new()),
            metadata: Mutex::new(HashMap::new()),
        }
    }

    pub fn create(&self, task_id: String) -> Result<(), AppError> {
        let mut tasks = self.tasks.lock()?;
        tasks.insert(task_id, TaskStatus::Created);
        Ok(())
    }

    pub fn update_status(&self, task_id: &str, new_status: TaskStatus) -> Result<(), AppError> {
        let mut tasks = self.tasks.lock()?;
        if let Some(status) = tasks.get_mut(task_id) {
            *status = new_status;
            Ok(())
        } else {
            Err(AppError::new("task.not_found", ErrorSeverity::Error))
        }
    }

    pub fn get_status(&self, task_id: &str) -> Result<TaskStatus, AppError> {
        let tasks = self.tasks.lock()?;
        tasks
            .get(task_id)
            .cloned()
            .ok_or_else(|| AppError::new("task.not_found", ErrorSeverity::Error))
    }

    pub fn register_cancel_flag(
        &self,
        task_id: String,
        flag: Arc<AtomicBool>,
    ) -> Result<(), AppError> {
        let mut flags = self.cancel_flags.lock()?;
        flags.insert(task_id, flag);
        Ok(())
    }

    pub fn register_pause_flag(
        &self,
        task_id: String,
        flag: Arc<AtomicBool>,
    ) -> Result<(), AppError> {
        let mut flags = self.pause_flags.lock()?;
        flags.insert(task_id, flag);
        Ok(())
    }

    pub fn cancel_task(&self, task_id: &str) -> Result<(), AppError> {
        let flags = self.cancel_flags.lock()?;
        if let Some(flag) = flags.get(task_id) {
            flag.store(true, Ordering::Relaxed);
            Ok(())
        } else {
            Err(AppError::new("task.not_found", ErrorSeverity::Error))
        }
    }

    pub fn pause_task(&self, task_id: &str) -> Result<(), AppError> {
        let flags = self.pause_flags.lock()?;
        if let Some(flag) = flags.get(task_id) {
            flag.store(true, Ordering::Relaxed);
            self.update_status(task_id, TaskStatus::Paused)?;
            Ok(())
        } else {
            Err(AppError::new("task.not_found", ErrorSeverity::Error))
        }
    }

    pub fn resume_task(&self, task_id: &str) -> Result<(), AppError> {
        let flags = self.pause_flags.lock()?;
        if let Some(flag) = flags.get(task_id) {
            flag.store(false, Ordering::Relaxed);
            self.update_status(task_id, TaskStatus::Running)?;
            Ok(())
        } else {
            Err(AppError::new("task.not_found", ErrorSeverity::Error))
        }
    }

    pub fn set_task_metadata(
        &self,
        task_id: &str,
        key: &str,
        value: Value,
    ) -> Result<(), AppError> {
        let mut meta = self.metadata.lock()?;
        if let Some(task_meta) = meta.get_mut(task_id) {
            if let Some(obj) = task_meta.as_object_mut() {
                obj.insert(key.to_string(), value);
            } else {
                let mut obj = serde_json::Map::new();
                obj.insert(key.to_string(), value);
                *task_meta = serde_json::Value::Object(obj);
            }
        } else {
            let mut obj = serde_json::Map::new();
            obj.insert(key.to_string(), value);
            meta.insert(task_id.to_string(), serde_json::Value::Object(obj));
        }
        Ok(())
    }

    pub fn get_task_metadata(&self, task_id: &str, key: &str) -> Result<Option<Value>, AppError> {
        let meta = self.metadata.lock()?;
        if let Some(task_meta) = meta.get(task_id) {
            if let Some(obj) = task_meta.as_object() {
                return Ok(obj.get(key).cloned());
            }
        }
        Ok(None)
    }

    pub fn active_count(&self) -> usize {
        // 这里如果锁中毒，我们简单返回 0，避免 panic
        if let Ok(tasks) = self.tasks.lock() {
            tasks
                .values()
                .filter(|status| matches!(status, TaskStatus::Running | TaskStatus::Paused))
                .count()
        } else {
            0
        }
    }
}
