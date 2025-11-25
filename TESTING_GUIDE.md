# Testing Guide - Research Agents, Sessions, and Approvals

## Quick Test Commands

### 1. Test Research Agents & Session Logging

**Command:**
```
/research-codebase "how does the MCP server handle approval requests?"
```

**What this tests:**
- ✅ Research agents (codebase-locator, codebase-analyzer, codebase-pattern-finder)
- ✅ Automatic session logging (should create session in database)
- ✅ Research.md file creation (should create file in thoughts/shared/research/)

**What to check:**
1. **In Cursor chat:** Should see research findings with file references
2. **In desktop app (Sessions tab):** Should see a new session appear
3. **In file system:** Should see `thoughts/shared/research/YYYY-MM-DD-*.md` file created
4. **In database:** Check `~/.cursor-layer/db.sqlite` for session record

### 2. Test Approvals (Manual Trigger)

**Command:**
```
Please use the request_approval MCP tool to test the approval system. Use:
- tool_name: "bash"
- tool_input: {"command": "echo 'test'"}
- tool_use_id: "test-123"
```

**What this tests:**
- ✅ Approval creation (should create approval in database)
- ✅ Desktop app display (should show approval in Approvals tab)

**What to check:**
1. **In Cursor chat:** Should see approval request message
2. **In desktop app (Approvals tab):** Should see pending approval appear
3. **In database:** Check `~/.cursor-layer/db.sqlite` for approval record

### 3. Test Full Workflow (Research + Session + Approval)

**Command:**
```
/research-codebase "find all files that use the request_approval MCP tool"
```

Then manually trigger an approval:
```
Please use the request_approval MCP tool with:
- tool_name: "write_file"
- tool_input: {"path": "test.txt", "contents": "test"}
- tool_use_id: "test-456"
```

**What this tests:**
- ✅ Complete workflow: research → session → approval
- ✅ All agents working together
- ✅ Data persistence across components

## Troubleshooting: Why No Data Shows Up

### Sessions Not Appearing?

**Possible causes:**
1. **MCP server not running** - Check Cursor settings → MCP servers
2. **Session logging not working** - Commands should auto-log, but verify MCP tools are available
3. **Database path mismatch** - Desktop app and MCP server must use same database

**Check:**
```bash
# Check if MCP server is running
# In Cursor, check Settings → Tools & Integrations → MCP Servers
# Should see "cursor-layer" with 11 tools enabled

# Check database exists
ls ~/.cursor-layer/db.sqlite  # macOS/Linux
dir %USERPROFILE%\.cursor-layer\db.sqlite  # Windows

# Check database contents
sqlite3 ~/.cursor-layer/db.sqlite "SELECT * FROM sessions ORDER BY created_at DESC LIMIT 5;"
```

### Approvals Not Appearing?

**Possible causes:**
1. **No approval requests triggered** - Approvals only appear when `request_approval` tool is called
2. **MCP server not connected** - Cursor must be connected to MCP server
3. **Database not shared** - Desktop app and MCP server must use same database path

**Check:**
```bash
# Check for approvals in database
sqlite3 ~/.cursor-layer/db.sqlite "SELECT * FROM approvals ORDER BY created_at DESC LIMIT 5;"

# Manually trigger approval via MCP tool
# In Cursor, ask AI to use request_approval tool
```

## Manual Testing Steps

### Step 1: Verify MCP Server is Running

1. Open Cursor Settings (`Ctrl+,` or `Cmd+,`)
2. Go to **Tools & Integrations** → **MCP Servers**
3. Verify `cursor-layer` shows **11 tools enabled**
4. If not, check MCP configuration in `~/.cursor/mcp.json`

### Step 2: Test Session Logging

1. Use `/research-codebase` command with any query
2. Wait for research to complete
3. Open desktop app → **Sessions** tab
4. Should see new session appear within 3-5 seconds (polling interval)

**If sessions don't appear:**
- Check database path: `~/.cursor-layer/db.sqlite` (same for both MCP and desktop app)
- Verify MCP server is actually running (check Cursor logs)
- Check desktop app is reading from correct database path

### Step 3: Test Approval Creation

1. In Cursor, ask AI to use the `request_approval` tool:
   ```
   Please use the request_approval MCP tool to test. Use:
   - tool_name: "bash"
   - tool_input: {"command": "ls"}
   - tool_use_id: "test-approval-1"
   ```

2. Open desktop app → **Approvals** tab
3. Should see pending approval appear within 3-5 seconds

**If approvals don't appear:**
- Verify MCP server is connected (11 tools should be available)
- Check database has approval records: `sqlite3 ~/.cursor-layer/db.sqlite "SELECT * FROM approvals;"`
- Verify desktop app database path matches MCP server path

### Step 4: Test Approval Actions

1. In desktop app, find a pending approval
2. Click **Approve** or **Deny**
3. Approval should update status
4. Refresh should show updated status

## Database Verification Commands

### Check Sessions
```bash
# macOS/Linux
sqlite3 ~/.cursor-layer/db.sqlite "SELECT id, query, status, created_at FROM sessions ORDER BY created_at DESC LIMIT 5;"

# Windows PowerShell
sqlite3 $env:USERPROFILE\.cursor-layer\db.sqlite "SELECT id, query, status, created_at FROM sessions ORDER BY created_at DESC LIMIT 5;"
```

### Check Approvals
```bash
# macOS/Linux
sqlite3 ~/.cursor-layer/db.sqlite "SELECT id, tool_name, status, created_at FROM approvals ORDER BY created_at DESC LIMIT 5;"

# Windows PowerShell
sqlite3 $env:USERPROFILE\.cursor-layer\db.sqlite "SELECT id, tool_name, status, created_at FROM approvals ORDER BY created_at DESC LIMIT 5;"
```

### Check Agent Tasks
```bash
# macOS/Linux
sqlite3 ~/.cursor-layer/db.sqlite "SELECT id, agent_type, status, created_at FROM agent_tasks ORDER BY created_at DESC LIMIT 5;"

# Windows PowerShell
sqlite3 $env:USERPROFILE\.cursor-layer\db.sqlite "SELECT id, agent_type, status, created_at FROM agent_tasks ORDER BY created_at DESC LIMIT 5;"
```

## Expected Behavior

### After Running `/research-codebase`:

1. **In Cursor:**
   - Research findings presented
   - Research.md file created (if thoughts/ directory exists)
   - Session logged (if MCP tools available)

2. **In Desktop App:**
   - New session appears in Sessions tab
   - Shows query, status, timestamps

3. **In Database:**
   - `sessions` table has new record
   - `agent_tasks` table may have records (if agents spawned)

### After Triggering Approval:

1. **In Cursor:**
   - Approval request message shown
   - Approval ID displayed

2. **In Desktop App:**
   - New approval appears in Approvals tab
   - Shows tool name, input, status

3. **In Database:**
   - `approvals` table has new record with status='pending'

## Common Issues & Fixes

### Issue: Sessions never appear

**Fix:**
1. Verify MCP server is running (11 tools enabled)
2. Check database path is correct for both MCP and desktop app
3. Restart Cursor after MCP configuration changes
4. Manually test: Ask AI to use `log_session_start` tool

### Issue: Approvals never appear

**Fix:**
1. Approvals only appear when `request_approval` tool is explicitly called
2. Cursor's AI doesn't automatically call it - you need to ask it to
3. Test by explicitly requesting: "Please use the request_approval MCP tool..."

### Issue: Desktop app shows "Error loading..."

**Fix:**
1. Check database file exists: `~/.cursor-layer/db.sqlite`
2. Verify database is readable/writable
3. Check desktop app logs (F12 in desktop app)
4. Ensure database schema is initialized

### Issue: Research.md file not created

**Fix:**
1. Create `thoughts/shared/research/` directory first
2. Ensure write permissions
3. Check if command completed successfully
4. Verify metadata gathering worked (git commands succeeded)

## Quick Test Checklist

- [ ] MCP server shows 11 tools in Cursor settings
- [ ] Database file exists at `~/.cursor-layer/db.sqlite`
- [ ] Desktop app can open and shows no errors
- [ ] `/research-codebase` command works and creates session
- [ ] Session appears in desktop app within 5 seconds
- [ ] `request_approval` tool can be called manually
- [ ] Approval appears in desktop app within 5 seconds
- [ ] Can approve/deny approval in desktop app
- [ ] Research.md file created (if thoughts/ directory exists)

## Next Steps After Testing

Once everything works:
1. Use `/research-codebase` for real research questions
2. Approvals will appear when AI needs permission for high-stakes tools
3. Sessions will track all your research and planning work
4. Research.md files will accumulate in thoughts/shared/research/

