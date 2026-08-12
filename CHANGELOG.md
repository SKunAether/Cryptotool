# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-08-15

### Added

- Initial release
- Hash Provider: MD5, SHA256, SHA512 with KAT tests
- Crypto Provider: AES-256-GCM encrypt/decrypt, random key generation
- Crack Provider: Mask and dictionary attacks with pause/resume/stop
- Analyzer Provider: Hash type identification, weak password rules, DES weak key detection
- Dashboard with real-time stats and activity history
- Theme system: Light, Dark, System follow
- Internationalization: Chinese (zh-CN) and English (en-US)
- Privacy mode: History stores only function names
- System tray integration with hide/show/quit
- Auto-start, silent start, minimize to tray
- Check for updates via GitHub API
- SQLite storage for settings and audit logs (in-memory history)
- Zeroize for sensitive data
- Plugin SDK foundation

### Fixed

- All beta-phase known issues
- IPC error handling improved

### Security

- Sensitive data zeroization after use
- Privacy mode prevents content logging
- Capability-based permission system (Tauri)