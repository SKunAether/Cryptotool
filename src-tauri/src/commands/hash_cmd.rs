use tauri::State;
use tauri::AppHandle;
use tauri::Emitter;
use crate::AppState;
use crate::services::hash_service::HashService;
use crate::HistoryEntry;
use chrono::Utc;

#[tauri::command]
pub fn hash_string(
    app: AppHandle,
    state: State<AppState>,
    algorithm: String,
    text: String,
) -> Result<String, String> {
    let result = HashService::hash_text(&algorithm, &text);
    let status = if result.is_ok() { "成功".to_string() } else { "失败".to_string() };

    // 根据隐私模式决定动作描述
    let action = if state.privacy_mode.load(std::sync::atomic::Ordering::Relaxed) {
        "执行了一个功能".to_string()
    } else {
        format!("{} 哈希计算", algorithm.to_uppercase())
    };

    let entry = HistoryEntry {
        timestamp: Utc::now().to_rfc3339(),
        action,
        status: status.clone(),
    };

    {
        let mut history = state.history.lock().map_err(|e| e.to_string())?;
        if history.len() >= 100 {
            history.pop_front();
        }
        history.push_back(entry);
    }

    let history_snapshot: Vec<HistoryEntry> = state.history.lock().unwrap().iter().cloned().collect();
    let _ = app.emit("history-update", history_snapshot);

    result.map_err(|e| e.to_string())
}