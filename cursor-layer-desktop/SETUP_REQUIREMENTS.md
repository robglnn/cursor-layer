# Setup Requirements for Desktop App

## ✅ No MCP Server Required

**The desktop app works independently!** You don't need the MCP server running for the app to work.

### What Works Without MCP:
- ✅ App opens and runs
- ✅ Shows empty state (no approvals/sessions)
- ✅ Database is created automatically
- ✅ Schema is initialized automatically

### What Requires MCP:
- Creating approvals (via Cursor MCP tools)
- Creating sessions (via Cursor MCP tools)
- Seeing actual data (approvals/sessions appear when MCP creates them)

## Setup Checklist

### Desktop App Only (Minimum)
- [x] App is built ✅
- [x] Database auto-creates ✅
- [x] Schema auto-initializes ✅
- [ ] Run the app - should work!

### Full Setup (With MCP)
- [x] Desktop app built ✅
- [ ] MCP server configured in Cursor
- [ ] MCP server path in Cursor settings
- [ ] Restart Cursor after MCP config
- [ ] Use MCP tools in Cursor to create approvals/sessions
- [ ] Desktop app will show them automatically

## Current Status

**You're ready to run the app!** 

The app should:
1. Open without crashing
2. Show "No approvals found" (normal - no data yet)
3. Show "No sessions found" (normal - no data yet)
4. Stay open and functional

## Next Steps

1. **Run the app** - it should work now with the crash fixes
2. **Configure MCP** (optional) - to start creating approvals/sessions
3. **Use in Cursor** - MCP tools will populate the desktop app

## Troubleshooting

If app still crashes:
1. Delete database: `Remove-Item "C:\Users\mithr\.cursor-layer\db.sqlite"`
2. Run app again (will recreate database)
3. Check terminal output for error messages

