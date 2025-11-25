# Cursor Layer Features

Complete feature list and capabilities of Cursor Layer.

## Core Commands

### Planning Workflow
- **Research Codebase** (`research-codebase.mdc`) - Comprehensive codebase research using parallel sub-agents
- **Create Plan** (`create-plan.mdc`) - Create detailed implementation plans with thorough research
- **Iterate Plan** (`iterate-plan.mdc`) - Update existing implementation plans
- **Implement Plan** (`implement-plan.mdc`) - Implement technical plans with verification

### Workflow Management
- **Create Worktree** (`create-worktree.mdc`) - Create git worktree for parallel development sessions
- **Create Handoff** (`create-handoff.mdc`) - Create handoff document for transferring work between sessions
- **Resume Handoff** (`resume-handoff.mdc`) - Resume work from handoff document with context analysis

### Development Workflow
- **Commit** (`commit.mdc`) - Create git commits with user approval (no AI attribution)
- **Debug** (`debug.mdc`) - Debug issues by investigating logs, database state, and git history
- **Local Review** (`local-review.mdc`) - Set up worktree for reviewing colleague's branch

## Specialized Agents

### Codebase Research
- **Codebase Locator** (`codebase-locator.mdc`) - Find WHERE files and components live
- **Codebase Analyzer** (`codebase-analyzer.mdc`) - Understand HOW specific code works
- **Codebase Pattern Finder** (`codebase-pattern-finder.mdc`) - Find examples of existing patterns

### Thoughts & External Research
- **Thoughts Locator** (`thoughts-locator.mdc`) - Find relevant documents in thoughts/ directory
- **Thoughts Analyzer** (`thoughts-analyzer.mdc`) - Extract high-value insights from thoughts documents
- **Web Search Researcher** (`web-search-researcher.mdc`) - Web research for external information

## Infrastructure

### MCP Server
- **Approval Workflows** - Human-in-the-loop for high-stakes operations
- **Session Tracking** - Track AI coding sessions and decisions
- **SQLite Storage** - Persistent storage for sessions, approvals, and conversation events

### Desktop App
- **Cross-platform** - Windows and macOS support
- **Approval Management** - Visual UI for managing pending approvals
- **Session Viewer** - Browse session history with conversation timelines
- **Real-time Updates** - Auto-refreshes to show latest data

### File Management
- **File Watcher** - Automatic file change tracking with .gitignore support
- **Thoughts Directory** - Structured research document management

## Advanced Features

### Parallel Sessions
- Run multiple Cursor sessions simultaneously using git worktrees
- Isolated environments for parallel development
- Shared thoughts directory across worktrees

### Session Handoffs
- Transfer work between sessions via structured handoff documents
- Preserve context, learnings, and next steps
- Resume work seamlessly in new sessions

### Thoughts Management
- Structured research document system
- Team-shared and personal thought directories
- Searchable thoughts directory for AI assistants

### Web Research
- External research capabilities via web-search-researcher agent
- Strategic web searches for documentation, best practices, and solutions
- Source attribution and quality guidelines

## Use Cases

### Large Brownfield Projects
- Efficient context usage for 36M+ line codebases
- Parallel research with specialized agents
- Structured planning and implementation workflows

### Team Collaboration
- Shared thoughts directory for team knowledge
- Handoff documents for work continuity
- Local review setup for colleague branches

### Research & Planning
- Comprehensive codebase research
- External web research for modern information
- Structured implementation planning

## See Also

- [FEATURES_COMPARISON.md](./FEATURES_COMPARISON.md) - Comparison with HumanLayer
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [AUTO_MODE_GUIDE.md](./AUTO_MODE_GUIDE.md) - Using with Cursor's Auto mode

