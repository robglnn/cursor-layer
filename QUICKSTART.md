# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Copy Commands to Your Project

Copy the `.cursor/rules` directory to your project root:

```bash
# From your project root
cp -r cursor-layer/.cursor/rules .cursor/
```

**Windows PowerShell:**
```powershell
Copy-Item -Recurse -Path cursor-layer\.cursor\rules -Destination .cursor\
```

This gives you:
- ✅ `commands/` - All 4 core commands
- ✅ `agents/` - Specialized research agents

### Step 2: (Optional) Set Up MCP Server

If you want approval workflows and session tracking:

1. **Build cursor-layer** (if not already built):
   ```bash
   cd cursor-layer
   npm install
   npm run build
   ```

2. **Configure MCP in Cursor**:
   Add to your Cursor settings (`.cursor/mcp.json` or Cursor settings):
   ```json
   {
     "mcpServers": {
       "cursor-layer": {
         "command": "node",
         "args": ["C:\\absolute\\path\\to\\cursor-layer\\dist\\mcp-server\\index.js"]
       }
     }
   }
   ```
   **Note**: Use absolute path with Windows-style backslashes or forward slashes

3. **Restart Cursor** to load the MCP server

### Step 3: (Optional) Desktop App

For visual approval management:

1. **Build desktop app** (if not already built):
   ```bash
   cd cursor-layer-desktop
   npm install
   npm run tauri build
   ```

2. **Run the app**:
   ```powershell
   .\src-tauri\target\release\cursor-layer-desktop.exe
   ```

The desktop app:
- ✅ Works standalone (no MCP server needed)
- ✅ Auto-creates database on first run
- ✅ Shares database with MCP server automatically
- ✅ Shows approvals/sessions created via MCP

### Step 4: Use Commands in Cursor

**Enable Auto Mode** (recommended for unlimited tokens):
- In Cursor, enable Auto mode from the chat interface

**Use Commands**:
- In Cursor chat, reference the commands:
  - `/research-codebase` or mention "research codebase"
  - `/create-plan` or mention "create plan"
  - `/iterate-plan` or mention "iterate plan"
  - `/implement-plan` or mention "implement plan"

## 📋 What You Get

### Commands Available
1. **Research Codebase** - Document and understand your codebase
2. **Create Plan** - Create detailed implementation plans
3. **Iterate Plan** - Update existing plans
4. **Implement Plan** - Implement plans with verification

### Specialized Agents
- **codebase-locator** - Find WHERE code lives
- **codebase-analyzer** - Understand HOW code works
- **codebase-pattern-finder** - Find similar patterns

## 🎯 Example Usage

### Research a Feature
```
Research how authentication works in this codebase
```
Cursor will use the research-codebase command with Auto mode.

### Create an Implementation Plan
```
Create a plan to add user notifications
```
Cursor will use the create-plan command to build a detailed plan.

### Implement a Plan
```
Implement the plan at path/to/plan.md
```
Cursor will use the implement-plan command to execute the plan.

## 🔧 Optional: Desktop App

If you want the desktop app for approval management:

1. **Build the desktop app** (if not already built):
   ```bash
   cd cursor-layer-desktop
   npm install
   npm run tauri build
   ```

2. **Run the app**:
   - Windows: `src-tauri/target/release/cursor-layer-desktop.exe`
   - Or: `npm run tauri dev` for development

## ✅ You're Ready!

That's it! Your commands are ready to use with Cursor's Auto mode and unlimited tokens.

## 🆘 Troubleshooting

**Commands not working?**
- Make sure `.cursor/rules/` is in your project root
- Restart Cursor after copying files
- Check that Auto mode is enabled

**MCP server not connecting?**
- Verify the path in MCP config is absolute
- Check that `cursor-layer` is built (`npm run build`)
- Restart Cursor after MCP config changes

**Need help?**
- Check `README.md` for detailed documentation
- See `FEATURES_COMPARISON.md` for feature list
- Review `AUTO_MODE_GUIDE.md` for Auto mode details

