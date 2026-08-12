use serde::Serialize;
use tauri::command;

#[derive(Debug, Serialize)]
pub struct UpdateInfo {
    pub latest_version: String,
    pub current_version: String,
    pub update_available: bool,
    pub release_url: String,
}

#[command]
pub async fn check_update() -> Result<UpdateInfo, String> {
    let current = env!("CARGO_PKG_VERSION").to_string();
    let url = "https://api.github.com/repos/crypto-tool/cryptotool/releases/latest";

    let client = reqwest::Client::builder()
        .user_agent("CryptoTool")
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("GitHub API 响应错误: {}", response.status()));
    }

    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    let latest = json["tag_name"]
        .as_str()
        .unwrap_or("0.0.0")
        .trim_start_matches('v');
    let release_url = json["html_url"]
        .as_str()
        .unwrap_or("https://github.com/crypto-tool/cryptotool/releases");

    let update_available = latest != current;

    Ok(UpdateInfo {
        latest_version: latest.to_string(),
        current_version: current,
        update_available,
        release_url: release_url.to_string(),
    })
}
