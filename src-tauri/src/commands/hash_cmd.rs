use crate::services::hash_service::HashService;
use crate::storage::AuditLog;
use crate::AppState;
use chrono::Utc;
use tauri::AppHandle;
use tauri::Emitter;
use tauri::State;

#[tauri::command]
pub fn hash_string(
    app: AppHandle,
    state: State<AppState>,
    algorithm: String,
    text: String,
) -> Result<String, String> {
    let result = HashService::hash_text(&algorithm, &text);
    let status = if result.is_ok() {
        "成功".to_string()
    } else {
        "失败".to_string()
    };

    let action = if state
        .privacy_mode
        .load(std::sync::atomic::Ordering::Relaxed)
    {
        "执行了一个功能".to_string()
    } else {
        format!("{} 哈希计算", algorithm.to_uppercase())
    };

    // 写入数据库
    let log = AuditLog {
        id: None,
        timestamp: Utc::now(),
        event_type: "hash".to_string(),
        details: action.clone(),
        user_id: None,
    };
    let _ = state.db.insert_audit_log(&log);

    // 内存历史
    let entry = crate::HistoryEntry {
        timestamp: chrono::Utc::now().to_rfc3339(),
        action: action.clone(),
        status: status.clone(),
    };
    {
        let mut history = state.history.lock().map_err(|e| e.to_string())?;
        if history.len() >= 100 {
            history.pop_front();
        }
        history.push_back(entry);
    }

    // 发送事件
    let history_snapshot: Vec<crate::HistoryEntry> =
        state.history.lock().unwrap().iter().cloned().collect();
    let _ = app.emit("history-update", history_snapshot);

    result.map_err(|e| e.to_string())
}
