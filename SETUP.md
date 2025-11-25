# Setup Guide - Running Cursor Layer

## Quick Setup (Commands Only - Recommended First Step)

### 1. Copy Commands to Your Project

**From your project root** (the 36M-line brownfield project):

```powershell
# Copy the .cursor/rules directory to your project
Copy-Item -Recurse -Path cursor-layer\.cursor\rules -Destination .cursor\
```

This gives you all 4 commands and 3 agents ready to use.

### 2. Enable Auto Mode in Cursor

1. Open Cursor IDE
2. In the chat interface, enable **Auto mode** (for unlimited tokens)
3. You're ready to use commands!

### 3. Test It Out

Try in Cursor chat:
```
Research how authentication works in this codebase
```

Or:
```
Create a plan to add user notifications
```

**That's it!** Commands work immediately. No build needed.

---

## Optional: MCP Server Setup (For Approvals & Sessions)

If you want approval workflows and session tracking:

### 1. Build cursor-layer (if not already built)

```powershell
cd cursor-layer
npm install
npm run build
```

### 2. Configure MCP in Cursor

**Option A: Via Cursor Settings UI**
1. Open Cursor Settings
2. Go to "Features" → "Model Context Protocol"
3. Add new MCP server:
   - **Name**: `cursor-layer`
   - **Command**: `node`
   - **Args**: `C:\Users\mithr\Documents\GitHub\project7\cursor-layer\dist\mcp-server\index.js`
   - (Use absolute path to the built file)

**Option B: Via Config File**
Create/edit `.cursor/mcp.json` in your project:
```json
{
  "mcpServers": {
    "cursor-layer": {
      "command": "node",
      "args": ["C:\\Users\\mithr\\Documents\\GitHub\\project7\\cursor-layer\\dist\\mcp-server\\index.js"]
    }
  }
}
```

### 3. Restart Cursor

Close and reopen Cursor to load the MCP server.

### 4. Verify MCP Connection

In Cursor chat, you should see MCP tools available:
- `request_approval` - Request human approval
- `list_approvals` - List pending approvals
- `approve` - Approve a request
- `deny` - Deny a request
- Session tracking tools

---

## Optional: Desktop App Setup

For visual approval management and session viewing:

### 1. Build Desktop App (if not already built)

```powershell
cd cursor-layer-desktop
npm install
npm run tauri build
```

### 2. Run the Desktop App

**Windows:**
```powershell
.\src-tauri\target\release\cursor-layer-desktop.exe
```

**Or run in dev mode:**
```powershell
npm run tauri dev
```

### 3. Connect to Database

The desktop app automatically connects to the same database as the MCP server:
- **Location**: `~/.cursor-layer/db.sqlite`
- **Shared**: Both MCP server and desktop app use the same database
- **Auto-sync**: Approvals and sessions sync automatically

---

## Setup Checklist

### Minimum Setup (Commands Only)
- [ ] Copy `.cursor/rules/` to your project
- [ ] Enable Auto mode in Cursor
- [ ] Test a command

### Full Setup (With MCP & Desktop)
- [ ] Copy `.cursor/rules/` to your project
- [ ] Build cursor-layer: `npm run build`
- [ ] Configure MCP in Cursor settings
- [ ] Restart Cursor
- [ ] (Optional) Build desktop app
- [ ] (Optional) Run desktop app

---

## Verification

### Test Commands Work
```
Research how error handling works in this codebase
```

### Test MCP Server (if configured)
- Check Cursor shows MCP tools in chat
- Try: "Request approval for deploying to production"

### Test Desktop App (if installed)
- Open desktop app
- Should show empty approvals/sessions initially
- Will populate as you use MCP tools

---

## Troubleshooting

**Commands not working?**
- Verify `.cursor/rules/` exists in project root
- Restart Cursor after copying files
- Check Auto mode is enabled

**MCP server not connecting?**
- Verify absolute path in MCP config
- Check `cursor-layer/dist/mcp-server/index.js` exists
- Restart Cursor after config changes
- Check Cursor's MCP logs for errors

**Desktop app not connecting?**
- Verify database exists at `~/.cursor-layer/db.sqlite`
- Database is created automatically by MCP server
- Both apps share the same database location

---

## Next Steps

1. **Start with commands only** (simplest)
2. **Add MCP server** when you need approvals
3. **Add desktop app** for visual management

See `QUICKSTART.md` for more details!

