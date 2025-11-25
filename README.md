# Cursor Layer

AI orchestration tools for Cursor IDE - enabling context engineering patterns, approval workflows, and session tracking for large-scale brownfield projects.

**Standalone package** - No external dependencies on other repositories. Clone and use immediately.

## Features

- **Context Engineering Patterns** - Battle-tested workflows for complex codebases
- **Approval Workflows** - Human-in-the-loop for high-stakes operations via MCP
- **Session Tracking** - Track AI coding sessions and decisions
- **Efficient Research** - Parallel sub-agents for comprehensive codebase exploration

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/robglnn/cursor-layer.git
cd cursor-layer

# Install dependencies
npm install

# Build
npm run build
```

### Setup in Your Project

1. **Copy Cursor rules to your project:**
   ```bash
   # From cursor-layer directory
   cp -r .cursor/rules /path/to/your/project/.cursor/
   ```

2. **Or use the CLI (once implemented):**
   ```bash
   npm install -g cursor-layer
   cursor-layer init
   ```

3. **Configure MCP in Cursor:**
   Add to your Cursor MCP configuration:
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

## Architecture

- **MCP Server** - TypeScript/Node.js server providing approval and session tools
- **Commands** - `.cursor/rules/commands/` with workflow patterns
- **Agents** - Specialized sub-agents for efficient context usage
- **Storage** - SQLite database for sessions and approvals
- **File Watcher** - Respects .gitignore, excludes node_modules, dist, .git

## Status

🚧 MVP in development

