# Installation Guide

## Standalone Installation

Cursor Layer is completely standalone - no dependencies on external repositories.

### Option 1: Clone and Use

```bash
# Clone the repository
git clone <your-repo-url> cursor-layer
cd cursor-layer

# Install dependencies
npm install

# Build the project
npm run build
```

### Option 2: Install as NPM Package (when published)

```bash
npm install -g cursor-layer
```

## Setup in Your Project

### Step 1: Copy Cursor Rules

Copy the `.cursor/rules/` directory to your project:

```bash
# From cursor-layer directory
cp -r .cursor/rules /path/to/your/project/.cursor/
```

This will add:
- `commands/research-codebase.mdc` - Research workflow
- `agents/codebase-locator.mdc` - File location agent
- `agents/codebase-analyzer.mdc` - Code analysis agent
- `agents/codebase-pattern-finder.mdc` - Pattern finding agent

### Step 2: Configure MCP Server (when implemented)

Add to your Cursor MCP configuration file:

```json
{
  "mcpServers": {
    "cursor-layer": {
      "command": "cursor-layer",
      "args": ["mcp", "serve"],
      "env": {
        "CURSOR_LAYER_DB_PATH": "~/.cursor-layer/db.sqlite"
      }
    }
  }
}
```

### Step 3: Use in Cursor

Once set up, you can use:

- `/research-codebase` - Comprehensive codebase research
- Agents are automatically available for parallel research tasks

## Requirements

- Node.js 18+ 
- Cursor IDE
- TypeScript (for development)

## Troubleshooting

### Commands not working in Cursor

1. Ensure `.cursor/rules/` is in your project root
2. Restart Cursor IDE
3. Check Cursor settings for rules directory path

### MCP Server not connecting

1. Verify `cursor-layer` is in your PATH
2. Check MCP configuration syntax
3. Review Cursor logs for connection errors

