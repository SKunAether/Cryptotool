use std::process::Command;
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;
use tauri_plugin_autostart::ManagerExt; // 只要有了这个，一切推断都自动完成！

#[derive(Debug, Serialize, Deserialize)]
pub struct DependencyStatus {
    name: String,
    current_version: String,
    latest_version: String,
    is_installed: bool,
}

#[tauri::command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
pub fn check_dependencies() -> Vec<DependencyStatus> {
    let deps = vec!["python", "node", "cargo", "git", "openssl"];
    let mut results = vec![];

    for dep in deps {
        let current = Command::new(dep)
            .arg("--version")
            .output()
            .ok()
            .and_then(|out| String::from_utf8(out.stdout).ok())
            .unwrap_or_else(|| "未安装".to_string());
            
        results.push(DependencyStatus {
            name: dep.to_string(),
            current_version: current.trim().to_string(),
            latest_version: "最新".to_string(),
            is_installed: !current.trim().is_empty() && !current.trim().starts_with("未安装"),
        });
    }
    results
}

#[tauri::command]
pub fn set_privacy_mode(state: State<AppState>, enabled: bool) -> Result<(), String> {
    state.privacy_mode.store(enabled, std::sync::atomic::Ordering::Relaxed);
    Ok(())
}

#[tauri::command]
pub fn toggle_autostart(app_handle: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    // 【终极解】：什么都不用转，直接调用！Rust 会自己搞定 ManagerExt<Runtime> 的泛型
    let autostart_manager = app_handle.autolaunch();
    if enabled {
        autostart_manager.enable().map_err(|e| e.to_string())?;
    } else {
        autostart_manager.disable().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_autostart_status(app_handle: tauri::AppHandle) -> Result<bool, String> {
    let autostart_manager = app_handle.autolaunch();
    autostart_manager.is_enabled().map_err(|e| e.to_string())
}