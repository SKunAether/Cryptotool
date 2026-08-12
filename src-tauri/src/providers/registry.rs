use std::collections::HashMap;
use crate::providers::hash_provider::HashProvider;
use crate::providers::crypto_provider::CryptoProvider;
use crate::providers::crack_provider::CrackProvider;
use crate::providers::analyzer_provider::AnalyzerProvider;
use cryptotool_plugin_sdk::SecurityProvider;

pub struct ProviderRegistry {
    providers: HashMap<String, Box<dyn SecurityProvider>>,
}

impl ProviderRegistry {
    pub fn new() -> Self {
        let mut registry = Self {
            providers: HashMap::new(),
        };
        registry.register(Box::new(HashProvider));
        registry.register(Box::new(CryptoProvider));
        registry.register(Box::new(CrackProvider));
        registry.register(Box::new(AnalyzerProvider));
        registry
    }

    pub fn register(&mut self, provider: Box<dyn SecurityProvider>) {
        let id = provider.metadata().id.clone();
        self.providers.insert(id, provider);
    }

    pub fn get(&self, id: &str) -> Option<&Box<dyn SecurityProvider>> {
        self.providers.get(id)
    }

    pub fn list(&self) -> Vec<String> {
        self.providers.keys().cloned().collect()
    }
}