use crate::storage::migrations;
use chrono::{DateTime, Utc};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuditLog {
    pub id: Option<i64>,
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub details: String,
    pub user_id: Option<String>,
}

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: &str) -> rusqlite::Result<Self> {
        let conn = Connection::open(db_path)?;
        migrations::run_migrations(&conn)?;
        Ok(Database {
            conn: Mutex::new(conn),
        })
    }

    pub fn insert_audit_log(&self, log: &AuditLog) -> Result<i64, rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO audit_log (timestamp, event_type, details, user_id) VALUES (?, ?, ?, ?)",
            (&log.timestamp, &log.event_type, &log.details, &log.user_id),
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_recent_audit_logs(&self, limit: usize) -> Result<Vec<AuditLog>, rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, timestamp, event_type, details, user_id FROM audit_log ORDER BY timestamp DESC LIMIT ?"
        )?;
        let rows = stmt.query_map([limit as i64], |row| {
            Ok(AuditLog {
                id: row.get(0)?,
                timestamp: row.get(1)?,
                event_type: row.get(2)?,
                details: row.get(3)?,
                user_id: row.get(4)?,
            })
        })?;
        let mut logs = Vec::new();
        for log in rows {
            logs.push(log?);
        }
        Ok(logs)
    }
}
