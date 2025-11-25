# Setup Checklist - What Needs to Run First

## ✅ Desktop App Requirements

### Nothing Required!
The desktop app is **completely standalone** and doesn't need anything else running.

- ✅ No MCP server needed
- ✅ No database setup needed (creates automatically)
- ✅ No other services needed
- ✅ Just run the executable

## 🔍 What the App Does on Startup

1. **Creates database directory** (`~/.cursor-layer/`)
2. **Creates database file** (`db.sqlite`)
3. **Initializes schema** (creates tables and indexes)
4. **Queries for data** (returns empty if no data exists)

## 🐛 Debugging the Current Error

The error "Execute returned results - did you mean to call query?" suggests:
- A SQL statement is using `execute()` when it should use `query()`
- Or a statement is returning results when it shouldn't

### Added Logging

I've added comprehensive logging that will show:
- `[DB]` - Database operations
- `[CMD]` - Command execution

### To See Logs

**Option 1: Run from terminal** (see logs in console):
```powershell
cd C:\Users\mithr\Documents\GitHub\project7\cursor-layer-desktop
.\src-tauri\target\release\cursor-layer-desktop.exe
```

**Option 2: Check Windows Event Viewer** for crash logs

**Option 3: Enable console in Tauri** (for release builds)

## 📋 Setup Status

### Desktop App
- ✅ Built and ready
- ✅ No dependencies on other services
- ✅ Database auto-creates

### MCP Server (Optional - for creating data)
- ✅ Built (`cursor-layer/dist/`)
- ⚠️ Needs to be configured in Cursor
- ⚠️ Needs to be running when using Cursor

### Commands (Optional - for using in Cursor)
- ✅ Ready in `.cursor/rules/`
- ⚠️ Need to be copied to your project

## 🎯 Current Issue

The database initialization is failing. The logs will show exactly where:
- Which table creation is failing
- Which index creation is failing
- What the exact error is

## Next Steps

1. **Rebuild with logging** (done)
2. **Run from terminal** to see logs
3. **Check logs** to find exact failure point
4. **Fix the specific issue** based on logs

