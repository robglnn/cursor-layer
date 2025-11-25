# Cursor Layer

AI orchestration tools for Cursor IDE - enabling context engineering patterns, approval workflows, and session tracking for large-scale brownfield projects.

**Standalone package** - No external dependencies on other repositories. Clone and use immediately.

## Features

- **Context Engineering Patterns** - Battle-tested workflows for complex codebases
- **Approval Workflows** - Human-in-the-loop for high-stakes operations via MCP
- **Session Tracking** - Track AI coding sessions and decisions
- **Efficient Research** - Parallel sub-agents for comprehensive codebase exploration
- **Web Search** - External research capabilities via web-search-researcher agent
- **Thoughts Management** - Structured research document system with thoughts-analyzer and thoughts-locator
- **Parallel Sessions** - Git worktree support for running multiple sessions simultaneously
- **Session Handoffs** - Transfer work between sessions via handoff documents
- **Dev Workflow Commands** - Commit, debug, and local-review commands for streamlined development

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

   This gives you:
   - ✅ `commands/` - All core commands (research, plan, iterate, implement, commit, debug, etc.)
   - ✅ `agents/` - Specialized research agents (codebase, thoughts, web search)

2. **Configure MCP in Cursor (Optional):**
   For approval workflows and session tracking, add to your Cursor MCP configuration:
   ```json
   {
     "mcpServers": {
       "cursor-layer": {
         "command": "node",
         "args": ["/absolute/path/to/cursor-layer/dist/mcp-server/index.js"]
       }
     }
   }
   ```

3. **Set up Thoughts Directory (Optional):**
   Create a `thoughts/` directory in your project root for research documents:
   ```
   thoughts/
   ├── shared/          # Team-shared documents
   │   ├── research/    # Research documents
   │   ├── plans/       # Implementation plans
   │   ├── handoffs/    # Session handoff documents
   │   └── tickets/     # Ticket documentation
   └── [username]/      # Personal thoughts
   ```

### Available Commands

**Core Workflow:**
- `/research-codebase` - Comprehensive codebase research with parallel agents
- `/create-plan` - Create detailed implementation plans
- `/iterate-plan` - Update existing plans
- `/implement-plan` - Implement plans with verification

**Workflow Management:**
- `/create-worktree` - Create git worktree for parallel sessions
- `/create-handoff` - Create handoff document for session transfer
- `/resume-handoff` - Resume work from handoff document

**Development:**
- `/commit` - Create git commits with user approval
- `/debug` - Debug issues via logs, database, and git state
- `/local-review` - Set up worktree for reviewing colleague's branch

### Available Agents

**Codebase Research:**
- `codebase-locator` - Find WHERE code lives
- `codebase-analyzer` - Understand HOW code works
- `codebase-pattern-finder` - Find similar patterns

**Thoughts & Research:**
- `thoughts-locator` - Find relevant documents in thoughts/ directory
- `thoughts-analyzer` - Extract high-value insights from thoughts documents
- `web-search-researcher` - Web research for external information

## Architecture

- **MCP Server** - TypeScript/Node.js server providing approval and session tools
- **Commands** - `.cursor/rules/commands/` with workflow patterns
- **Agents** - Specialized sub-agents for efficient context usage
- **Storage** - SQLite database for sessions and approvals (supports worktrees and handoffs)
- **File Watcher** - Respects .gitignore, excludes node_modules, dist, .git
- **Desktop App** - Cross-platform Tauri app for approval management

## Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [FEATURES.md](./FEATURES.md) - Complete feature list
- [FEATURES_COMPARISON.md](./FEATURES_COMPARISON.md) - Comparison with HumanLayer
- [AUTO_MODE_GUIDE.md](./AUTO_MODE_GUIDE.md) - Using with Cursor's Auto mode
- [MCP_SETUP.md](./MCP_SETUP.md) - MCP server setup instructions

## Status

✅ **Production Ready** - Core features complete and stable

All core commands, agents, and infrastructure are implemented and working. Ready for use with large-scale brownfield projects.

