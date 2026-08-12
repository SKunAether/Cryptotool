use rusqlite::Connection;
use std::sync::Mutex;
use crate::storage::migrations;

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
}