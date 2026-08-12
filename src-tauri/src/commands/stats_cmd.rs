use tauri::State;
use crate::AppState;
use serde::Serialize;

#[derive(Serialize)]
pub struct DashboardStats {
    pub today_operations: u32,
    pub active_tasks: u32,
    pub history_count: u32,
}

#[tauri::command]
pub fn get_dashboard_stats(state: State<AppState>) -> Result<DashboardStats, String> {
    let history = state.history.lock().map_err(|e| e.to_string())?;
    let history_count = history.len() as u32;

    // 统计今日运算次数（通过历史记录中今天的时间戳）
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let today_operations = history.iter()
        .filter(|entry| entry.timestamp.starts_with(&today))
        .count() as u32;

    // 活跃任务数（通过 TaskManager 获取）
    let active_tasks = state.task_manager.active_count() as u32;

    Ok(DashboardStats {
        today_operations,
        active_tasks,
        history_count,
    })
}