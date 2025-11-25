# Debug Guide - Finding the Error Source

## Setup Status

### ✅ Desktop App
- **Status**: Standalone - no dependencies
- **Requirements**: None! Just run the executable
- **Database**: Auto-creates on first run

### ✅ MCP Server (Optional)
- **Status**: Built and ready
- **Location**: `cursor-layer/dist/mcp-server/index.js`
- **Required**: Only if you want to create approvals/sessions from Cursor
- **Setup**: Configure in Cursor MCP settings

### ✅ Commands (Optional)
- **Status**: Ready to use
- **Location**: `cursor-layer/.cursor/rules/`
- **Required**: Only if you want to use commands in Cursor
- **Setup**: Copy to your project's `.cursor/rules/`

## 🔍 Current Error

**Error**: "Execute returned results - did you mean to call query?"

This typically means:
- A SQL statement that returns data is using `execute()` instead of `query()`
- PRAGMA statements that return values need special handling

## 📊 Added Logging

I've added comprehensive logging with prefixes:
- `[DB]` - Database operations (initialization, queries, schema)
- `[CMD]` - Tauri command execution

## 🐛 How to Debug

### Step 1: Run from Terminal

```powershell
cd C:\Users\mithr\Documents\GitHub\project7\cursor-layer-desktop
.\src-tauri\target\release\cursor-layer-desktop.exe
```

This will show all `eprintln!` logs in the console.

### Step 2: Look for Error Location

The logs will show:
```
[DB] Initializing database at: ...
[DB] Creating directory: ...
[DB] Opening database connection...
[DB] Setting PRAGMA journal_mode = WAL
[DB] Setting PRAGMA foreign_keys = ON
[DB] Initializing schema...
[DB] Creating sessions table...
[DB] Sessions table created
[DB] Creating approvals table...
[DB] Failed to create approvals table: <ERROR HERE>
```

The last `[DB] Failed to...` message will show exactly what's failing.

### Step 3: Check the Error

The error message will tell you:
- Which operation failed
- What the SQL error is
- Where in the code it happened

## 🔧 Common Issues

### Issue 1: PRAGMA Returns Results
**Fix**: Use `query_row()` for PRAGMA statements that return values

### Issue 2: Table Already Exists with Different Schema
**Fix**: Delete database and recreate:
```powershell
Remove-Item "C:\Users\mithr\.cursor-layer\db.sqlite"
```

### Issue 3: Foreign Key Constraint
**Fix**: Ensure tables are created in correct order (sessions before approvals)

## ✅ What's Fixed

1. ✅ PRAGMA journal_mode now uses `query_row()` (returns a value)
2. ✅ All schema operations have error logging
3. ✅ All commands have logging
4. ✅ Better error messages

## 📝 Next Steps

1. **Close the app** (if running)
2. **Delete old database** (if exists):
   ```powershell
   Remove-Item "C:\Users\mithr\.cursor-layer\db.sqlite" -ErrorAction SilentlyContinue
   ```
3. **Run from terminal** to see logs:
   ```powershell
   cd C:\Users\mithr\Documents\GitHub\project7\cursor-layer-desktop
   .\src-tauri\target\release\cursor-layer-desktop.exe
   ```
4. **Check the logs** - they'll show exactly where it fails
5. **Share the error** from the logs if it still fails

