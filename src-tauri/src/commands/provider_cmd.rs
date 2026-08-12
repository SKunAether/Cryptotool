use crate::AppState;
use serde::Serialize;
use tauri::State;

#[derive(Serialize)]
pub struct ProviderInfo {
    pub id: String,
    pub name: String,
    pub category: String,
    pub description: String,
}

#[tauri::command]
pub fn list_providers(state: State<AppState>) -> Result<Vec<ProviderInfo>, String> {
    let registry = state.provider_registry.lock().map_err(|e| e.to_string())?;
    let list: Vec<ProviderInfo> = registry
        .list()
        .iter()
        .map(|id| {
            let p = registry.get(id).unwrap();
            let meta = p.metadata();
            ProviderInfo {
                id: meta.id,
                name: meta.name,
                category: format!("{:?}", meta.category),
                description: meta.description,
            }
        })
        .collect();
    Ok(list)
}