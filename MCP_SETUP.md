# MCP Server Setup Guide

## Overview

Cursor Layer provides an MCP (Model Context Protocol) server that adds approval and session tracking capabilities to Cursor.

## Installation

1. **Build the project:**
   ```bash
   cd cursor-layer
   npm install
   npm run build
   ```

2. **Make CLI executable (optional):**
   ```bash
   chmod +x dist/cli/index.js
   ```

## Configuration

### Option 1: Direct Node.js Command

Add to your Cursor MCP configuration file (location varies by OS):

**macOS/Linux:** `~/.cursor/mcp.json` or in Cursor settings
**Windows:** `%APPDATA%\Cursor\mcp.json` (typically `C:\Users\<username>\AppData\Roaming\Cursor\mcp.json`) or in Cursor settings

**Note**: On Windows, you can also configure MCP servers directly in Cursor Settings:
- Press `Ctrl + ,` to open Settings
- Navigate to **Tools & Integrations** → **MCP Servers**
- Click **Add Server** or **+** button

```json
{
  "mcpServers": {
    "cursor-layer": {
      "command": "node",
      "args": [
        "/absolute/path/to/cursor-layer/dist/cli/index.js",
        "mcp",
        "serve"
      ],
      "env": {
        "CURSOR_LAYER_DB_PATH": "~/.cursor-layer/db.sqlite"
      }
    }
  }
}
```

### Option 2: Global Installation

If installed globally via npm:

```json
{
  "mcpServers": {
    "cursor-layer": {
      "command": "cursor-layer",
      "args": ["mcp", "serve"]
    }
  }
}
```

## Available MCP Tools

Once configured, these tools are available to Cursor's AI:

### Approval Tools

- **`request_approval`** - Request approval to execute a tool
  - Parameters: `tool_name`, `tool_input`, `tool_use_id`, `session_id` (optional)
  - Returns: Approval ID and status

- **`list_approvals`** - List pending approvals
  - Parameters: `session_id` (optional), `status` (optional)
  - Returns: Array of approval objects

- **`approve`** - Approve a pending request
  - Parameters: `approval_id`, `comment` (optional)
  - Returns: Approval response with `behavior: "allow"`

- **`deny`** - Deny a pending request
  - Parameters: `approval_id`, `comment` (required)
  - Returns: Denial response with `behavior: "deny"`

### Session Tracking Tools

- **`log_session_start`** - Start tracking a session
  - Parameters: `session_id`, `run_id`, `query`, `working_dir` (optional)

- **`log_session_end`** - End tracking a session
  - Parameters: `session_id`, `cost_usd` (optional), `duration_ms` (optional)

## Usage in Cursor

### Approval Workflow

1. AI wants to execute a high-stakes tool (e.g., `bash rm -rf /important`)
2. AI calls `request_approval` tool
3. Approval appears in Cursor chat with approval ID
4. User responds:
   - `approve` tool with approval ID → AI proceeds
   - `deny` tool with approval ID and reason → AI aborts

### Example

**AI in Cursor:**
```
I need to delete the build directory. Requesting approval...

[Uses request_approval tool]
Approval required for: bash. Approval ID: local-abc123
```

**User in Cursor:**
```
[Uses approve tool with ID local-abc123]
Approved. Proceed with deletion.
```

**AI continues with approved action**

## Troubleshooting

### MCP Server Not Connecting

1. Verify the path to `dist/cli/index.js` is correct
2. Check that `npm run build` completed successfully
3. Review Cursor logs for connection errors
4. Test MCP server manually:
   ```bash
   node dist/cli/index.js mcp serve
   ```

### Module Not Found Errors

If you see errors like `Cannot find module '.../store'`, this is likely an ES module import issue:

1. **Ensure all imports have `.js` extensions**: ES modules require explicit `.js` extensions in relative imports
2. **Rebuild the project**: Run `npm run build` to regenerate the compiled files
3. **Check the compiled output**: Verify `dist/` directory has all `.js` files with proper imports

### Server Capabilities Error

If you see `Server does not support resources`, ensure the server capabilities include both `tools` and `resources`:

```typescript
capabilities: {
  tools: {},
  resources: {},
}
```

### Tools Not Available

1. Restart Cursor after MCP configuration changes
2. Check MCP server is running (should see "Cursor Layer MCP server started")
3. Verify configuration JSON syntax is valid

### Database Errors

1. Check `~/.cursor-layer/` directory exists and is writable
2. Verify SQLite is working: `sqlite3 ~/.cursor-layer/db.sqlite ".tables"`

## Testing

Test the MCP server manually:

```bash
# Start server (will run until stopped)
node dist/cli/index.js mcp serve

# In another terminal, test CLI
cursor-layer approvals list
cursor-layer sessions list
```

