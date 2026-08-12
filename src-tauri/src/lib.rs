mod commands;
mod engine;
mod error;
mod events;
mod plugin;
mod providers;
mod services;
mod storage;
mod task;
mod utils;

pub use services::crypto_service::CryptoService;
pub use services::hash_service::HashService;

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;
use tauri::WindowEvent;

use providers::registry::ProviderRegistry;
use serde::Serialize;
use std::collections::VecDeque;
use std::sync::{atomic::AtomicBool, Arc, Mutex};
use storage::db::Database;
use task::manager::TaskManager;

use tauri_plugin_autostart::MacosLauncher;

#[derive(Debug, Clone, Serialize)]
pub struct HistoryEntry {
    pub timestamp: String,
    pub action: String,
    pub status: String,
}

pub struct AppState {
    pub provider_registry: Mutex<ProviderRegistry>,
    pub db: Arc<Database>,
    pub task_manager: Arc<TaskManager>,
    pub history: Arc<Mutex<VecDeque<HistoryEntry>>>,
    pub privacy_mode: Arc<AtomicBool>,
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let registry = ProviderRegistry::new();
            let db =
                Arc::new(Database::new("cryptotool.db").expect("Failed to initialize database"));
            let task_manager = Arc::new(TaskManager::new());

            let app_handle = app.handle().clone();

            // 历史记录仅内存存储，启动时为空
            let history_entries = VecDeque::new();

            // 静默启动
            let args: Vec<String> = std::env::args().collect();
            if args.contains(&"--silent".to_string()) {
                if let Some(window) = app.get_webview_window("main") {
                    window.hide().ok();
                }
            }

            // 托盘菜单
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(move |app, event| {
                    if event.id() == "quit" {
                        app.exit(0);
                    } else if event.id() == "show" {
                        if let Some(window) = app.get_webview_window("main") {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                })
                .build(app)?;

            // 最小化到托盘
            if let Some(window) = app.get_webview_window("main") {
                let handle = app_handle.clone();
                window.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        if let Some(w) = handle.get_webview_window("main") {
                            w.hide().unwrap();
                        }
                    }
                });
            }

            app.manage(AppState {
                provider_registry: Mutex::new(registry),
                db,
                task_manager,
                history: Arc::new(Mutex::new(history_entries)),
                privacy_mode: Arc::new(AtomicBool::new(false)),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::system_cmd::get_app_version,
            commands::system_cmd::check_dependencies,
            commands::system_cmd::set_privacy_mode,
            commands::system_cmd::toggle_autostart,
            commands::system_cmd::get_autostart_status,
            commands::provider_cmd::list_providers,
            commands::hash_cmd::hash_string,
            commands::crypto_cmd::generate_aes_key,
            commands::crypto_cmd::aes_encrypt,
            commands::crypto_cmd::aes_decrypt,
            commands::crack_cmd::start_mask_crack,
            commands::crack_cmd::start_dictionary_crack,
            commands::crack_cmd::stop_crack,
            commands::crack_cmd::pause_crack,
            commands::crack_cmd::resume_crack,
            commands::analyzer_cmd::identify_hash,
            commands::analyzer_cmd::check_weak_password,
            commands::analyzer_cmd::check_des_weak_key,
            commands::stats_cmd::get_dashboard_stats,
            commands::update_cmd::check_update,
            commands::open_cmd::open_external,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
