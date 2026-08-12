use rusqlite::Connection;

pub fn run_migrations(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS providers (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            version     TEXT NOT NULL,
            enabled     INTEGER DEFAULT 1,
            metadata_json TEXT
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id          TEXT PRIMARY KEY,
            provider_id TEXT NOT NULL,
            task_type   TEXT NOT NULL,
            status      TEXT NOT NULL DEFAULT 'created',
            created_at  TEXT NOT NULL,
            finished_at TEXT,
            summary     TEXT
        );

        CREATE TABLE IF NOT EXISTS audit_log (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp   TEXT NOT NULL,
            event_type  TEXT NOT NULL,
            details     TEXT,
            user_id     TEXT
        );
    ")?;
    Ok(())
}