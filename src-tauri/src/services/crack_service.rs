use crate::engine::crack_engine::{MaskGenerator, crack_block};
use crate::engine::dictionary_engine::DictionaryReader;
use crate::error::AppError;
use crate::error::ErrorSeverity;
use crate::HistoryEntry;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::collections::VecDeque;
use crate::task::manager::TaskManager;
use crate::task::state::TaskStatus;
use tauri::{AppHandle, Emitter};
use serde::Serialize;
use std::thread;
use std::time::Duration;

#[derive(Clone, Serialize)]
pub struct CrackProgress {
    pub task_id: String,
    pub progress: f64,
    pub checked: u64,
    pub total: u64,
    pub speed: f64,
    pub status: String,
    pub found: Option<String>,
    pub logs: Vec<String>,
}

pub struct CrackService;

impl CrackService {
    /// 掩码攻击（支持暂停和隐私模式）
    pub fn start_crack(
        app: AppHandle,
        task_manager: &TaskManager,
        history: Arc<Mutex<VecDeque<HistoryEntry>>>,
        mask: &str,
        algo: &str,
        target_hash: &str,
        pause_flag: Arc<AtomicBool>,
        privacy: Arc<AtomicBool>,
    ) -> Result<String, AppError> {
        let task_id = uuid::Uuid::new_v4().to_string();
        task_manager.create(task_id.clone())?;
        task_manager.update_status(&task_id, TaskStatus::Running)?;

        let generator = MaskGenerator::new(mask);
        let total = generator.total_combinations();
        if total == 0 {
            return Err(AppError::new("crack.empty_mask", ErrorSeverity::Error));
        }
        let cancel_flag = Arc::new(AtomicBool::new(false));
        task_manager.register_cancel_flag(task_id.clone(), cancel_flag.clone());
        task_manager.register_pause_flag(task_id.clone(), pause_flag.clone());

        let algo = algo.to_string();
        let target = target_hash.to_string();
        let app_clone = app.clone();
        let task_id_clone = task_id.clone();
        let history_clone = history.clone();
        let cancel = cancel_flag.clone();
        let pause = pause_flag.clone();
        let privacy_clone = privacy.clone();

        std::thread::spawn(move || {
            let block_size = 10000u64;
            let mut checked = 0u64;
            let start_time = std::time::Instant::now();
            let mut found: Option<String> = None;

            loop {
                // 暂停等待
                while pause.load(Ordering::Relaxed) {
                    if cancel.load(Ordering::Relaxed) {
                        break;
                    }
                    thread::sleep(Duration::from_millis(200));
                }
                if cancel.load(Ordering::Relaxed) {
                    let _ = app_clone.emit("crack-update", CrackProgress {
                        task_id: task_id_clone.clone(),
                        progress: checked as f64 / total as f64,
                        checked,
                        total,
                        speed: 0.0,
                        status: "cancelled".into(),
                        found: None,
                        logs: vec!["[system] 任务已取消".into()],
                    });
                    add_crack_history(&history_clone, &app_clone, &algo, "已取消", privacy_clone.clone());
                    break;
                }

                let remaining = total - checked;
                let current_block = if remaining < block_size { remaining } else { block_size };
                if current_block == 0 { break; }

                let candidates = generator.generate_block(checked, current_block);
                let block_found = crack_block(&algo, &target, candidates, cancel.clone());

                if let Some(plain) = block_found {
                    found = Some(plain);
                }

                checked += current_block;
                let elapsed = start_time.elapsed().as_secs_f64();
                let speed = if elapsed > 0.0 { checked as f64 / elapsed } else { 0.0 };
                let progress = checked as f64 / total as f64;

                let status = if found.is_some() { "completed" } else { "running" };
                let mut logs = vec![format!("[{}] 已尝试 {} / {} 候选",
                    chrono::Local::now().format("%H:%M:%S"), checked, total)];
                if let Some(ref plain) = found {
                    logs.push(format!("[RESULT] 找到密码: {}", plain));
                }

                let _ = app_clone.emit("crack-update", CrackProgress {
                    task_id: task_id_clone.clone(),
                    progress,
                    checked,
                    total,
                    speed,
                    status: status.to_string(),
                    found: found.clone(),
                    logs,
                });

                if found.is_some() {
                    add_crack_history(&history_clone, &app_clone, &algo, "成功", privacy_clone.clone());
                    break;
                }
                thread::sleep(Duration::from_millis(50));
            }

            if !cancel.load(Ordering::Relaxed) && found.is_none() {
                let final_logs = vec![format!("[{}] 任务完成，已检查所有 {} 个候选，未找到匹配密码",
                    chrono::Local::now().format("%H:%M:%S"), total)];
                let _ = app_clone.emit("crack-update", CrackProgress {
                    task_id: task_id_clone.clone(),
                    progress: 1.0,
                    checked: total,
                    total,
                    speed: if start_time.elapsed().as_secs_f64() > 0.0 { total as f64 / start_time.elapsed().as_secs_f64() } else { 0.0 },
                    status: "completed".into(),
                    found: None,
                    logs: final_logs,
                });
                add_crack_history(&history_clone, &app_clone, &algo, "未找到", privacy_clone.clone());
            }
        });

        Ok(task_id)
    }

    /// 字典攻击（支持暂停和隐私模式）
    pub fn start_dictionary_crack(
        app: AppHandle,
        task_manager: &TaskManager,
        history: Arc<Mutex<VecDeque<HistoryEntry>>>,
        dict_path: &str,
        algo: &str,
        target_hash: &str,
        privacy: Arc<AtomicBool>,
    ) -> Result<String, AppError> {
        let task_id = uuid::Uuid::new_v4().to_string();
        task_manager.create(task_id.clone())?;
        task_manager.update_status(&task_id, TaskStatus::Running)?;

        let cancel_flag = Arc::new(AtomicBool::new(false));
        let pause_flag = Arc::new(AtomicBool::new(false));
        task_manager.register_cancel_flag(task_id.clone(), cancel_flag.clone());
        task_manager.register_pause_flag(task_id.clone(), pause_flag.clone());

        let path = std::path::Path::new(dict_path);
        let reader = DictionaryReader::new(path, cancel_flag.clone())
            .map_err(|e| AppError::with_params("crack.dict_error", vec![e], ErrorSeverity::Error))?;

        let algo = algo.to_string();
        let target = target_hash.to_string();
        let app_clone = app.clone();
        let task_id_clone = task_id.clone();
        let history_clone = history.clone();
        let cancel = cancel_flag.clone();
        let pause = pause_flag.clone();
        let privacy_clone = privacy.clone();

        std::thread::spawn(move || {
            let start_time = std::time::Instant::now();
            let mut checked = 0u64;
            let mut reader = reader;
            let mut found: Option<String> = None;
            let block_size = 10000;

            loop {
                // 暂停等待
                while pause.load(Ordering::Relaxed) {
                    if cancel.load(Ordering::Relaxed) {
                        let _ = app_clone.emit("crack-update", CrackProgress {
                            task_id: task_id_clone.clone(),
                            progress: 0.0,
                            checked,
                            total: 0,
                            speed: 0.0,
                            status: "cancelled".into(),
                            found: None,
                            logs: vec!["[system] 任务已取消".into()],
                        });
                        add_crack_history(&history_clone, &app_clone, &algo, "已取消", privacy_clone.clone());
                        return;
                    }
                    thread::sleep(Duration::from_millis(200));
                }

                if cancel.load(Ordering::Relaxed) {
                    let _ = app_clone.emit("crack-update", CrackProgress {
                        task_id: task_id_clone.clone(),
                        progress: 0.0,
                        checked,
                        total: 0,
                        speed: 0.0,
                        status: "cancelled".into(),
                        found: None,
                        logs: vec!["[system] 任务已取消".into()],
                    });
                    add_crack_history(&history_clone, &app_clone, &algo, "已取消", privacy_clone.clone());
                    return;
                }

                let (candidates, eof) = match reader.read_block(block_size) {
                    Ok((lines, eof)) => (lines, eof),
                    Err(e) => {
                        let _ = app_clone.emit("crack-update", CrackProgress {
                            task_id: task_id_clone.clone(),
                            progress: 0.0,
                            checked,
                            total: 0,
                            speed: 0.0,
                            status: "failed".into(),
                            found: None,
                            logs: vec![format!("[ERROR] 字典读取错误: {}", e)],
                        });
                        break;
                    }
                };

                if candidates.is_empty() && eof {
                    break;
                }

                let block_found = crack_block(&algo, &target, candidates, cancel.clone());

                if let Some(plain) = block_found {
                    found = Some(plain);
                }

                checked += block_size as u64;
                let elapsed = start_time.elapsed().as_secs_f64();
                let speed = if elapsed > 0.0 { checked as f64 / elapsed } else { 0.0 };
                let status = if found.is_some() { "completed" } else { "running" };
                let mut logs = vec![format!("[{}] 已尝试 {} 行", chrono::Local::now().format("%H:%M:%S"), checked)];
                if let Some(ref plain) = found {
                    logs.push(format!("[RESULT] 找到密码: {}", plain));
                }

                let _ = app_clone.emit("crack-update", CrackProgress {
                    task_id: task_id_clone.clone(),
                    progress: 0.0,
                    checked,
                    total: 0,
                    speed,
                    status: status.to_string(),
                    found: found.clone(),
                    logs,
                });

                if found.is_some() {
                    add_crack_history(&history_clone, &app_clone, &algo, "成功", privacy_clone.clone());
                    break;
                }

                if eof {
                    break;
                }
                thread::sleep(Duration::from_millis(50));
            }

            if !cancel.load(Ordering::Relaxed) && found.is_none() {
                let final_logs = vec![format!("[{}] 字典扫描完成，已检查所有行，未找到匹配密码", chrono::Local::now().format("%H:%M:%S"))];
                let _ = app_clone.emit("crack-update", CrackProgress {
                    task_id: task_id_clone.clone(),
                    progress: 1.0,
                    checked,
                    total: 0,
                    speed: 0.0,
                    status: "completed".into(),
                    found: None,
                    logs: final_logs,
                });
                add_crack_history(&history_clone, &app_clone, &algo, "未找到", privacy_clone.clone());
            }
        });

        Ok(task_id)
    }
}

fn add_crack_history(
    history: &Arc<Mutex<VecDeque<HistoryEntry>>>,
    app: &AppHandle,
    algo: &str,
    status: &str,
    privacy: Arc<AtomicBool>,
) {
    let mut entries = history.lock().unwrap();
    let action = if privacy.load(Ordering::Relaxed) {
        "执行了一个功能".to_string()
    } else {
        format!("{} 爆破", algo.to_uppercase())
    };
    let entry = HistoryEntry {
        timestamp: chrono::Utc::now().to_rfc3339(),
        action,
        status: status.to_string(),
    };
    if entries.len() >= 100 {
        entries.pop_front();
    }
    entries.push_back(entry);
    let snapshot: Vec<HistoryEntry> = entries.iter().cloned().collect();
    let _ = app.emit("history-update", snapshot);
}