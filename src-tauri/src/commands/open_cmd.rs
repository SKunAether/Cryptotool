use tauri::{Manager, Url, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub fn open_external(app: tauri::AppHandle, url: String) -> Result<(), String> {
    // 仅允许 http/https 链接，避免被用于本地文件或其它协议
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err("unsupported_url".to_string());
    }

    let parsed: Url = url.parse().map_err(|_| "invalid_url".to_string())?;

    // 在应用内新建 Webview 窗口打开链接。
    // 这样不依赖系统默认浏览器（例如无 xdg-open / 无默认浏览器的环境），
    // 保证点击后一定有可见反应。
    if let Some(window) = app.get_webview_window("external") {
        window.navigate(parsed).map_err(|e| e.to_string())?;
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(());
    }
    let window = WebviewWindowBuilder::new(&app, "external", WebviewUrl::External(parsed))
        .title("CryptoTool")
        .inner_size(1000.0, 720.0)
        .build()
        .map_err(|e| e.to_string())?;
    let _ = window;
    Ok(())
}
