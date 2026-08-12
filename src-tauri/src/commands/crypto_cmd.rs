use crate::services::crypto_service::CryptoService;
use crate::storage::AuditLog;
use crate::AppState;
use chrono::Utc;
use tauri::AppHandle;
use tauri::Emitter;
use tauri::State;

#[tauri::command]
pub fn generate_aes_key() -> String {
    CryptoService::generate_key()
}

#[tauri::command]
pub fn aes_encrypt(
    app: AppHandle,
    state: State<AppState>,
    key_b64: String,
    plaintext: String,
) -> Result<String, String> {
    let result = CryptoService::encrypt(&key_b64, &plaintext);
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
        "AES-256-GCM 加密".to_string()
    };

    let log = AuditLog {
        id: None,
        timestamp: Utc::now(),
        event_type: "crypto".to_string(),
        details: action.clone(),
        user_id: None,
    };
    let _ = state.db.insert_audit_log(&log);

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

    let history_snapshot: Vec<crate::HistoryEntry> =
        state.history.lock().unwrap().iter().cloned().collect();
    let _ = app.emit("history-update", history_snapshot);

    result.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn aes_decrypt(
    app: AppHandle,
    state: State<AppState>,
    key_b64: String,
    ciphertext_b64: String,
) -> Result<String, String> {
    let result = CryptoService::decrypt(&key_b64, &ciphertext_b64);
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
        "AES-256-GCM 解密".to_string()
    };

    let log = AuditLog {
        id: None,
        timestamp: Utc::now(),
        event_type: "crypto".to_string(),
        details: action.clone(),
        user_id: None,
    };
    let _ = state.db.insert_audit_log(&log);

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

    let history_snapshot: Vec<crate::HistoryEntry> =
        state.history.lock().unwrap().iter().cloned().collect();
    let _ = app.emit("history-update", history_snapshot);

    result.map_err(|e| e.to_string())
}
