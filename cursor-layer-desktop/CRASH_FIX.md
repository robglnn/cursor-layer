# Crash Fix - Database Schema Initialization

## Issue
The desktop app was crashing because the Rust database code wasn't initializing the schema (creating tables).

## Fix Applied
✅ Added `init_schema()` method to Rust database code
✅ Schema now initializes automatically on database connection
✅ Better error handling added

## What Changed

### Database Initialization
- Now creates all required tables on first run:
  - `sessions` table
  - `approvals` table  
  - `conversation_events` table
- Creates all indexes
- Enables foreign keys and WAL mode

### Error Handling
- Better error messages in frontend
- Console logging for debugging
- Graceful error display in UI

## Rebuild Required

The app has been rebuilt with the fix. Run:

```powershell
& "C:\Users\mithr\Documents\GitHub\project7\cursor-layer-desktop\src-tauri\target\release\cursor-layer-desktop.exe"
```

## Expected Behavior

1. **First Run**: Creates database and schema automatically
2. **Empty State**: Shows "No approvals found" and "No sessions found" (expected)
3. **No Crashes**: App should stay open and functional

## Database Location

Database is created at:
- **Windows**: `C:\Users\mithr\.cursor-layer\db.sqlite`
- **macOS**: `~/.cursor-layer/db.sqlite`

This is the same location the MCP server uses, so they share data automatically.

