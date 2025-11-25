# MCP Server Setup for Windows

## Quick Setup

The MCP configuration file has been created at:
```
C:\Users\mithr\AppData\Roaming\Cursor\mcp.json
```

## Configuration Details

The MCP server is configured to run:
- **Command**: `node`
- **Script**: `C:\Users\mithr\Documents\GitHub\project7\cursor-layer\dist\cli\index.js`
- **Args**: `mcp serve`

## Next Steps

1. **Restart Cursor** completely (close all windows and reopen)
2. **Verify MCP is loaded**:
   - Open Cursor Settings (Ctrl + ,)
   - Go to Tools & Integrations → MCP Servers
   - You should see "cursor-layer" listed

3. **Test the MCP server**:
   - In Cursor chat, the AI should now have access to approval tools
   - You can also test via CLI: `node dist/cli/index.js mcp serve`

## Troubleshooting

### MCP Not Appearing in Cursor

1. **Check the config file exists**:
   ```powershell
   Get-Content "$env:APPDATA\Cursor\mcp.json"
   ```

2. **Verify the path is correct**:
   ```powershell
   Test-Path "C:\Users\mithr\Documents\GitHub\project7\cursor-layer\dist\cli\index.js"
   ```

3. **Check Cursor logs**:
   - Open Cursor
   - Help → Toggle Developer Tools
   - Check Console for MCP errors

4. **Manual test**:
   ```powershell
   cd C:\Users\mithr\Documents\GitHub\project7\cursor-layer
   node dist/cli/index.js mcp serve
   ```
   (This will run until you stop it with Ctrl+C)

### Alternative Configuration Location

If Cursor doesn't pick up `mcp.json` in `%APPDATA%\Cursor\`, try:

1. **In Cursor Settings**:
   - Press `Ctrl + ,`
   - Search for "MCP"
   - Add server configuration directly in settings UI

2. **Or check for settings.json**:
   ```powershell
   Get-Content "$env:APPDATA\Cursor\User\settings.json" | Select-String -Pattern "mcp"
   ```

## Configuration File Format

```json
{
  "mcpServers": {
    "cursor-layer": {
      "command": "node",
      "args": [
        "C:\\Users\\mithr\\Documents\\GitHub\\project7\\cursor-layer\\dist\\cli\\index.js",
        "mcp",
        "serve"
      ]
    }
  }
}
```

**Note**: Use forward slashes or escaped backslashes in JSON paths on Windows.

