use crate::services::analyzer_service::AnalyzerService;

#[tauri::command]
pub fn identify_hash(hash: String) -> Result<Vec<String>, String> {
    Ok(AnalyzerService::identify(&hash))
}

#[tauri::command]
pub fn check_weak_password(password: String) -> Result<bool, String> {
    Ok(AnalyzerService::check_weak_password(&password))
}

#[tauri::command]
pub fn check_des_weak_key(key_hex: String) -> Result<bool, String> {
    AnalyzerService::check_des_weak_key(&key_hex)
}