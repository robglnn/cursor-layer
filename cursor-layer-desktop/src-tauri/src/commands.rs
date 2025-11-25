use crate::database::{Database, Approval, Session, ConversationEvent};
use std::sync::Mutex;
use lazy_static::lazy_static;

// Global database instance - initialize with error handling
lazy_static! {
    static ref DB: Mutex<Option<Database>> = Mutex::new(None);
}

fn get_db() -> Result<std::sync::MutexGuard<'static, Option<Database>>, String> {
    eprintln!("[CMD] Getting database connection...");
    let mut db_opt = DB.lock().map_err(|e| {
        eprintln!("[CMD] Database lock error: {}", e);
        format!("Database lock error: {}", e)
    })?;
    
    if db_opt.is_none() {
        eprintln!("[CMD] Database not initialized, creating now...");
        *db_opt = Some(Database::new().map_err(|e| {
            eprintln!("[CMD] Failed to initialize database: {}", e);
            format!("Failed to initialize database: {}", e)
        })?);
        eprintln!("[CMD] Database initialized successfully");
    }
    
    Ok(db_opt)
}

#[tauri::command]
pub fn get_pending_approvals(session_id: Option<String>) -> Result<Vec<Approval>, String> {
    eprintln!("[CMD] get_pending_approvals called, session_id: {:?}", session_id);
    let db_opt = get_db()?;
    let db = db_opt.as_ref().ok_or("Database not initialized")?;
    eprintln!("[CMD] Querying database for pending approvals...");
    match db.get_pending_approvals(session_id) {
        Ok(approvals) => {
            eprintln!("[CMD] Found {} pending approvals", approvals.len());
            Ok(approvals)
        },
        Err(e) => {
            eprintln!("[CMD] Error fetching approvals: {}", e);
            // Return empty vec instead of error to prevent crash
            Ok(Vec::new())
        }
    }
}

#[tauri::command]
pub fn approve_request(approval_id: String, comment: Option<String>) -> Result<(), String> {
    let db_opt = get_db()?;
    let db = db_opt.as_ref().ok_or("Database not initialized")?;
    db.update_approval_status(&approval_id, "approved", comment.as_deref())
        .map_err(|e| format!("Database error: {}", e))
}

#[tauri::command]
pub fn deny_request(approval_id: String, comment: String) -> Result<(), String> {
    let db_opt = get_db()?;
    let db = db_opt.as_ref().ok_or("Database not initialized")?;
    db.update_approval_status(&approval_id, "denied", Some(&comment))
        .map_err(|e| format!("Database error: {}", e))
}

#[tauri::command]
pub fn list_sessions(limit: i64) -> Result<Vec<Session>, String> {
    let db_opt = get_db()?;
    let db = db_opt.as_ref().ok_or("Database not initialized")?;
    match db.list_sessions(limit) {
        Ok(sessions) => Ok(sessions),
        Err(e) => {
            eprintln!("Error fetching sessions: {}", e);
            // Return empty vec instead of error to prevent crash
            Ok(Vec::new())
        }
    }
}

#[tauri::command]
pub fn get_session(session_id: String) -> Result<Option<Session>, String> {
    let db_opt = get_db()?;
    let db = db_opt.as_ref().ok_or("Database not initialized")?;
    db.get_session(&session_id)
        .map_err(|e| format!("Database error: {}", e))
}

#[tauri::command]
pub fn get_conversation(session_id: String) -> Result<Vec<ConversationEvent>, String> {
    let db_opt = get_db()?;
    let db = db_opt.as_ref().ok_or("Database not initialized")?;
    db.get_conversation(&session_id)
        .map_err(|e| format!("Database error: {}", e))
}

