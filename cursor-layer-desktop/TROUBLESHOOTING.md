# Troubleshooting Desktop App Crashes

## Common Issues

### App Crashes on Startup

**Symptom**: App closes immediately, especially during "loading approvals" or "loading sessions"

**Possible Causes**:
1. Database schema not initialized
2. SQL query errors
3. Missing database file
4. Permission issues

**Solutions**:

1. **Check if database exists**:
   ```powershell
   Test-Path "C:\Users\mithr\.cursor-layer\db.sqlite"
   ```

2. **Delete database to force re-initialization**:
   ```powershell
   Remove-Item "C:\Users\mithr\.cursor-layer\db.sqlite" -ErrorAction SilentlyContinue
   ```

3. **Check database directory exists**:
   ```powershell
   Test-Path "C:\Users\mithr\.cursor-layer"
   ```

4. **Run with console to see errors**:
   - The app should show errors in the terminal if run from command line
   - Or check Windows Event Viewer for crash logs

## Setup Requirements

### Minimum Setup (App Should Work)
- ✅ Database directory will be created automatically
- ✅ Schema will be initialized automatically
- ✅ No MCP server required for app to run
- ✅ App works independently

### For Full Functionality
- ✅ MCP server configured in Cursor (for creating approvals/sessions)
- ✅ MCP server running (when using Cursor)
- ✅ Both share same database location

## Testing

1. **First Run**: App should create database and show empty state
2. **No Data**: "No approvals found" and "No sessions found" is normal
3. **With MCP**: Approvals/sessions appear when MCP server creates them

## Debug Mode

To see what's happening, check:
- Terminal output (if run from command line)
- Browser console (F12 in app, if it stays open long enough)
- Database file location: `C:\Users\mithr\.cursor-layer\db.sqlite`

