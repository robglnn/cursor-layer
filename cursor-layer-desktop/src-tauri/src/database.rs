use rusqlite::{Connection, Result, params};
use std::path::PathBuf;
use dirs;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self> {
        let db_path = Self::get_db_path();
        eprintln!("[DB] Initializing database at: {:?}", db_path);
        
        // Ensure directory exists
        if let Some(parent) = db_path.parent() {
            eprintln!("[DB] Creating directory: {:?}", parent);
            std::fs::create_dir_all(parent).map_err(|e| {
                eprintln!("[DB] Failed to create directory: {}", e);
                rusqlite::Error::SqliteFailure(
                    rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_IOERR),
                    Some(format!("Failed to create directory: {}", e))
                )
            })?;
        }

        eprintln!("[DB] Opening database connection...");
        let conn = Connection::open(&db_path).map_err(|e| {
            eprintln!("[DB] Failed to open database: {}", e);
            e
        })?;
        
        // Enable WAL mode and foreign keys
        eprintln!("[DB] Setting PRAGMA journal_mode = WAL");
        // PRAGMA journal_mode returns a value, so we need to ignore it
        let _: String = conn.query_row("PRAGMA journal_mode = WAL", [], |row| row.get(0)).map_err(|e| {
            eprintln!("[DB] Failed to set WAL mode: {}", e);
            e
        })?;
        
        eprintln!("[DB] Setting PRAGMA foreign_keys = ON");
        // PRAGMA foreign_keys doesn't return a value, so execute is fine
        conn.execute("PRAGMA foreign_keys = ON", []).map_err(|e| {
            eprintln!("[DB] Failed to enable foreign keys: {}", e);
            e
        })?;
        
        // Initialize schema
        eprintln!("[DB] Initializing schema...");
        let db = Database { conn };
        db.init_schema().map_err(|e| {
            eprintln!("[DB] Schema initialization failed: {}", e);
            e
        })?;
        eprintln!("[DB] Schema initialized successfully");
        
        Ok(db)
    }

    fn get_db_path() -> PathBuf {
        if let Some(home) = dirs::home_dir() {
            home.join(".cursor-layer").join("db.sqlite")
        } else {
            PathBuf::from(".cursor-layer").join("db.sqlite")
        }
    }

    fn init_schema(&self) -> Result<()> {
        eprintln!("[DB] Creating sessions table...");
        // Create tables
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL UNIQUE,
                query TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'starting',
                working_dir TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                cost_usd REAL,
                duration_ms INTEGER,
                error_message TEXT
            )",
            [],
        ).map_err(|e| {
            eprintln!("[DB] Failed to create sessions table: {}", e);
            e
        })?;
        eprintln!("[DB] Sessions table created");

        eprintln!("[DB] Creating approvals table...");
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS approvals (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                session_id TEXT NOT NULL,
                tool_use_id TEXT,
                status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied')),
                tool_name TEXT NOT NULL,
                tool_input TEXT NOT NULL,
                comment TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                responded_at TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )",
            [],
        ).map_err(|e| {
            eprintln!("[DB] Failed to create approvals table: {}", e);
            e
        })?;
        eprintln!("[DB] Approvals table created");

        eprintln!("[DB] Creating conversation_events table...");
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS conversation_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                sequence INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                role TEXT,
                content TEXT,
                tool_id TEXT,
                tool_name TEXT,
                tool_input_json TEXT,
                tool_result_for_id TEXT,
                tool_result_content TEXT,
                is_completed BOOLEAN DEFAULT FALSE,
                approval_status TEXT,
                approval_id TEXT,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )",
            [],
        ).map_err(|e| {
            eprintln!("[DB] Failed to create conversation_events table: {}", e);
            e
        })?;
        eprintln!("[DB] Conversation_events table created");

        // Create indexes
        eprintln!("[DB] Creating indexes...");
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_run_id ON sessions(run_id)", []).map_err(|e| {
            eprintln!("[DB] Failed to create index idx_sessions_run_id: {}", e);
            e
        })?;
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)", []).map_err(|e| {
            eprintln!("[DB] Failed to create index idx_sessions_status: {}", e);
            e
        })?;
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_approvals_pending ON approvals(status) WHERE status = 'pending'", []).map_err(|e| {
            eprintln!("[DB] Failed to create index idx_approvals_pending: {}", e);
            e
        })?;
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_approvals_session ON approvals(session_id)", []).map_err(|e| {
            eprintln!("[DB] Failed to create index idx_approvals_session: {}", e);
            e
        })?;
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_approvals_run_id ON approvals(run_id)", []).map_err(|e| {
            eprintln!("[DB] Failed to create index idx_approvals_run_id: {}", e);
            e
        })?;
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_approvals_tool_use_id ON approvals(tool_use_id)", []).map_err(|e| {
            eprintln!("[DB] Failed to create index idx_approvals_tool_use_id: {}", e);
            e
        })?;
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_conversation_session ON conversation_events(session_id, sequence)", []).map_err(|e| {
            eprintln!("[DB] Failed to create index idx_conversation_session: {}", e);
            e
        })?;
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_conversation_approval ON conversation_events(approval_id)", []).map_err(|e| {
            eprintln!("[DB] Failed to create index idx_conversation_approval: {}", e);
            e
        })?;
        eprintln!("[DB] All indexes created successfully");

        Ok(())
    }

    pub fn get_pending_approvals(&self, session_id: Option<String>) -> Result<Vec<Approval>> {
        let mut approvals = Vec::new();
        
        if let Some(sid) = session_id {
            let mut stmt = self.conn.prepare(
                "SELECT id, run_id, session_id, tool_use_id, status, tool_name, tool_input, comment, created_at, responded_at 
                 FROM approvals 
                 WHERE status = ? AND session_id = ?
                 ORDER BY created_at ASC"
            )?;
            let rows = stmt.query_map(params!["pending", sid], |row| {
                Ok(Approval {
                    id: row.get(0)?,
                    run_id: row.get(1)?,
                    session_id: row.get(2)?,
                    tool_use_id: row.get::<_, Option<String>>(3)?,
                    status: row.get(4)?,
                    tool_name: row.get(5)?,
                    tool_input: row.get(6)?,
                    comment: row.get::<_, Option<String>>(7)?,
                    created_at: row.get(8)?,
                    responded_at: row.get::<_, Option<String>>(9)?,
                })
            })?;
            for row in rows {
                approvals.push(row?);
            }
            eprintln!("[DB] Found {} approvals with session filter", approvals.len());
        } else {
            eprintln!("[DB] Querying all pending approvals...");
            let mut stmt = self.conn.prepare(
                "SELECT id, run_id, session_id, tool_use_id, status, tool_name, tool_input, comment, created_at, responded_at 
                 FROM approvals 
                 WHERE status = ?
                 ORDER BY created_at ASC"
            )?;
            let rows = stmt.query_map(params!["pending"], |row| {
                Ok(Approval {
                    id: row.get(0)?,
                    run_id: row.get(1)?,
                    session_id: row.get(2)?,
                    tool_use_id: row.get::<_, Option<String>>(3)?,
                    status: row.get(4)?,
                    tool_name: row.get(5)?,
                    tool_input: row.get(6)?,
                    comment: row.get::<_, Option<String>>(7)?,
                    created_at: row.get(8)?,
                    responded_at: row.get::<_, Option<String>>(9)?,
                })
            })?;
            for row in rows {
                approvals.push(row?);
            }
            eprintln!("[DB] Found {} total pending approvals", approvals.len());
        }
        
        Ok(approvals)
    }

    pub fn update_approval_status(
        &self,
        approval_id: &str,
        status: &str,
        comment: Option<&str>,
    ) -> Result<()> {
        self.conn.execute(
            "UPDATE approvals SET status = ?, comment = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?",
            params![status, comment, approval_id],
        )?;
        Ok(())
    }

    pub fn list_sessions(&self, limit: i64) -> Result<Vec<Session>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, run_id, query, status, working_dir, created_at, last_activity_at, completed_at, cost_usd, duration_ms, error_message
             FROM sessions 
             ORDER BY last_activity_at DESC 
             LIMIT ?"
        )?;

        let rows = stmt.query_map([limit], |row| {
            Ok(Session {
                id: row.get(0)?,
                run_id: row.get(1)?,
                query: row.get(2)?,
                status: row.get(3)?,
                working_dir: row.get::<_, Option<String>>(4)?,
                created_at: row.get(5)?,
                last_activity_at: row.get(6)?,
                completed_at: row.get::<_, Option<String>>(7)?,
                cost_usd: row.get::<_, Option<f64>>(8)?,
                duration_ms: row.get::<_, Option<i64>>(9)?,
                error_message: row.get::<_, Option<String>>(10)?,
            })
        })?;

        let mut sessions = Vec::new();
        for row in rows {
            sessions.push(row?);
        }
        Ok(sessions)
    }

    pub fn get_session(&self, session_id: &str) -> Result<Option<Session>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, run_id, query, status, working_dir, created_at, last_activity_at, completed_at, cost_usd, duration_ms, error_message
             FROM sessions 
             WHERE id = ?"
        )?;

        let row = stmt.query_row([session_id], |row| {
            Ok(Session {
                id: row.get(0)?,
                run_id: row.get(1)?,
                query: row.get(2)?,
                status: row.get(3)?,
                working_dir: row.get::<_, Option<String>>(4)?,
                created_at: row.get(5)?,
                last_activity_at: row.get(6)?,
                completed_at: row.get::<_, Option<String>>(7)?,
                cost_usd: row.get::<_, Option<f64>>(8)?,
                duration_ms: row.get::<_, Option<i64>>(9)?,
                error_message: row.get::<_, Option<String>>(10)?,
            })
        });

        match row {
            Ok(session) => Ok(Some(session)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn get_conversation(&self, session_id: &str) -> Result<Vec<ConversationEvent>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, session_id, sequence, event_type, created_at, role, content, tool_id, tool_name, tool_input_json, tool_result_for_id, tool_result_content, is_completed, approval_status, approval_id
             FROM conversation_events 
             WHERE session_id = ? 
             ORDER BY sequence ASC"
        )?;

        let rows = stmt.query_map([session_id], |row| {
            Ok(ConversationEvent {
                id: row.get(0)?,
                session_id: row.get(1)?,
                sequence: row.get(2)?,
                event_type: row.get(3)?,
                created_at: row.get(4)?,
                role: row.get::<_, Option<String>>(5)?,
                content: row.get::<_, Option<String>>(6)?,
                tool_id: row.get::<_, Option<String>>(7)?,
                tool_name: row.get::<_, Option<String>>(8)?,
                tool_input_json: row.get::<_, Option<String>>(9)?,
                tool_result_for_id: row.get::<_, Option<String>>(10)?,
                tool_result_content: row.get::<_, Option<String>>(11)?,
                is_completed: row.get::<_, Option<i32>>(12)?.map(|v| v != 0),
                approval_status: row.get::<_, Option<String>>(13)?,
                approval_id: row.get::<_, Option<String>>(14)?,
            })
        })?;

        let mut events = Vec::new();
        for row in rows {
            events.push(row?);
        }
        Ok(events)
    }
}

#[derive(Debug, serde::Serialize)]
pub struct Approval {
    pub id: String,
    pub run_id: String,
    pub session_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_use_id: Option<String>,
    pub status: String,
    pub tool_name: String,
    pub tool_input: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub comment: Option<String>,
    pub created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub responded_at: Option<String>,
}

#[derive(Debug, serde::Serialize)]
pub struct Session {
    pub id: String,
    pub run_id: String,
    pub query: String,
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub working_dir: Option<String>,
    pub created_at: String,
    pub last_activity_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completed_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cost_usd: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_ms: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,
}

#[derive(Debug, serde::Serialize)]
pub struct ConversationEvent {
    pub id: i64,
    pub session_id: String,
    pub sequence: i64,
    pub event_type: String,
    pub created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_input_json: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_result_for_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_result_content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_completed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub approval_status: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub approval_id: Option<String>,
}
