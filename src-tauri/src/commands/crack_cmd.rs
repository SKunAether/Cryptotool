use tauri::State;
use tauri::AppHandle;
use crate::AppState;
use crate::services::crack_service::CrackService;
use std::sync::Arc;
use std::sync::atomic::AtomicBool;

#[tauri::command]
pub async fn start_mask_crack(
    app: AppHandle,
    state: State<'_, AppState>,
    mask: String,
    algorithm: String,
    target_hash: String,
) -> Result<String, String> {
    let pause_flag = Arc::new(AtomicBool::new(false));
    CrackService::start_crack(
        app,
        &state.task_manager,
        state.history.clone(),
        &mask,
        &algorithm,
        &target_hash,
        pause_flag,
        state.privacy_mode.clone(),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn start_dictionary_crack(
    app: AppHandle,
    state: State<'_, AppState>,
    dict_path: String,
    algorithm: String,
    target_hash: String,
) -> Result<String, String> {
    CrackService::start_dictionary_crack(
        app,
        &state.task_manager,
        state.history.clone(),
        &dict_path,
        &algorithm,
        &target_hash,
        state.privacy_mode.clone(),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn stop_crack(
    state: State<'_, AppState>,
    task_id: String,
) -> Result<(), String> {
    state.task_manager.cancel_task(&task_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn pause_crack(
    state: State<'_, AppState>,
    task_id: String,
) -> Result<(), String> {
    state.task_manager.pause_task(&task_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn resume_crack(
    state: State<'_, AppState>,
    task_id: String,
) -> Result<(), String> {
    state.task_manager.resume_task(&task_id).map_err(|e| e.to_string())
}