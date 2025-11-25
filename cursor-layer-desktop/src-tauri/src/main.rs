// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;

use commands::*;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            get_pending_approvals,
            approve_request,
            deny_request,
            list_sessions,
            get_session,
            get_conversation
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

