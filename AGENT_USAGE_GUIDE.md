# Agent Orchestration Usage Guide

## Overview

Cursor Layer provides a hybrid agent orchestration system that combines:
1. **MCP Tools** (preferred) - Explicit API for agent management
2. **Prompt-Based** (fallback) - Instructions for AI to act as agents

## How It Works

### MCP Tool Approach (Preferred)

When MCP server is available, use explicit tools:

```typescript
// 1. Spawn agents in parallel
const task1 = spawn_agent({
  agent_type: "codebase-locator",
  task: "Find all authentication-related files",
  context: { directory_hint: "src/auth" }
})

const task2 = spawn_agent({
  agent_type: "codebase-analyzer",
  task: "Analyze authentication middleware flow",
  context: { file_paths: ["src/auth/middleware.ts"] }
})

// 2. Wait for completion
// Check status periodically
get_agent_status({ task_id: task1.task_id })
// Status: "running" → "completed"

// 3. Get results
const results1 = get_agent_results({ task_id: task1.task_id })
const results2 = get_agent_results({ task_id: task2.task_id })

// 4. Update task status (after executing agent)
update_agent_task({
  task_id: task1.task_id,
  status: "completed",
  results: { /* agent findings */ }
})
```

### Prompt-Based Approach (Fallback)

If MCP tools aren't available, use explicit prompts:

```
Act as the codebase-locator agent. Find all authentication-related files.
Focus on src/auth directory and look for .ts and .tsx files.
Return results grouped by file type (implementation, tests, config).
Refer to .cursor/rules/agents/codebase-locator.mdc for your instructions.
```

## Available MCP Tools

### `spawn_agent`
Creates a new agent task and returns task_id + prompt instruction.

**Parameters:**
- `agent_type`: One of: codebase-locator, codebase-analyzer, codebase-pattern-finder, thoughts-locator, thoughts-analyzer, web-search-researcher
- `task`: Task description for the agent
- `context` (optional): Additional context object
- `session_id` (optional): Session ID for tracking

**Returns:**
```json
{
  "task_id": "uuid",
  "status": "pending",
  "prompt_instruction": "Act as the...",
  "message": "Agent task created..."
}
```

### `get_agent_status`
Get the current status of an agent task.

**Parameters:**
- `task_id`: Task ID from spawn_agent

**Returns:**
```json
{
  "task_id": "uuid",
  "agent_type": "codebase-locator",
  "task": "Find files...",
  "status": "running" | "completed" | "failed",
  "created_at": "ISO timestamp",
  "completed_at": "ISO timestamp",
  "error": "error message if failed"
}
```

### `get_agent_results`
Get the results from a completed agent task.

**Parameters:**
- `task_id`: Task ID from spawn_agent

**Returns:**
```json
{
  "status": "completed",
  "results": { /* agent-specific results */ },
  "error": "error message if failed"
}
```

### `update_agent_task`
Update an agent task with results or status. Call this after executing an agent.

**Parameters:**
- `task_id`: Task ID from spawn_agent
- `status`: "running" | "completed" | "failed"
- `results` (optional): Agent results object
- `error` (optional): Error message if failed

### `list_agent_tasks`
List agent tasks, optionally filtered.

**Parameters:**
- `session_id` (optional): Filter by session
- `status` (optional): Filter by status
- `limit` (optional): Max results (default: 100)

## Agent Execution Flow

### Using MCP Tools

1. **Spawn agents** - Create tasks for parallel execution
2. **Execute agents** - Use the prompt_instruction to run the agent
3. **Update tasks** - Call `update_agent_task` with results
4. **Get results** - Retrieve final results with `get_agent_results`
5. **Synthesize** - Combine all agent results into final answer

### Using Prompts (Fallback)

1. **Create prompts** - Generate explicit agent instructions
2. **Execute agents** - AI acts as the agent based on prompt
3. **Collect responses** - Gather all agent responses
4. **Synthesize** - Combine responses into final answer

## Best Practices

### Parallel Execution
Always spawn multiple agents in parallel when they're researching different aspects:

```typescript
// Good: Parallel execution
spawn_agent({ agent_type: "codebase-locator", task: "Find files" })
spawn_agent({ agent_type: "codebase-analyzer", task: "Analyze code" })
spawn_agent({ agent_type: "codebase-pattern-finder", task: "Find patterns" })

// Bad: Sequential execution
const task1 = spawn_agent(...)
await get_agent_results(task1.task_id)
const task2 = spawn_agent(...) // Don't wait!
```

### Task Tracking
Always track task IDs and wait for completion:

```typescript
const tasks = [
  spawn_agent({ agent_type: "codebase-locator", task: "..." }),
  spawn_agent({ agent_type: "codebase-analyzer", task: "..." })
]

// Wait for all to complete
for (const task of tasks) {
  let status = "running"
  while (status === "running" || status === "pending") {
    const statusResult = get_agent_status({ task_id: task.task_id })
    status = statusResult.status
    // Small delay before next check
  }
}
```

### Error Handling
Always check for errors:

```typescript
const results = get_agent_results({ task_id })
if (results.error) {
  // Handle error, maybe retry or use fallback
}
```

### Context Provision
Provide rich context to agents:

```typescript
spawn_agent({
  agent_type: "codebase-analyzer",
  task: "Analyze authentication flow",
  context: {
    file_paths: ["src/auth/middleware.ts", "src/auth/strategies/jwt.ts"],
    focus_area: "error handling and token validation",
    directory_hint: "src/auth"
  }
})
```

## Integration with Commands

Commands automatically use the best available method:

1. **Try MCP tools first** - If available, use explicit API
2. **Fallback to prompts** - If tools unavailable, use prompt instructions
3. **Track usage** - Log which method was used for debugging

## Examples

### Example 1: Research Codebase

```typescript
// Spawn 3 agents in parallel
const locatorTask = spawn_agent({
  agent_type: "codebase-locator",
  task: "Find all API route files",
  context: { directory_hint: "src/routes" }
})

const analyzerTask = spawn_agent({
  agent_type: "codebase-analyzer",
  task: "Understand how API routes handle authentication",
  context: { focus_area: "middleware and error handling" }
})

const patternTask = spawn_agent({
  agent_type: "codebase-pattern-finder",
  task: "Find similar API route patterns",
  context: { pattern_description: "REST API with authentication" }
})

// Wait for completion, get results, synthesize
```

### Example 2: Find Thoughts Documents

```typescript
const thoughtsTask = spawn_agent({
  agent_type: "thoughts-locator",
  task: "Find research documents about rate limiting",
  context: { categories: ["research", "plans"] }
})

// Get results and read relevant documents
```

### Example 3: Web Research

```typescript
const webTask = spawn_agent({
  agent_type: "web-search-researcher",
  task: "Find best practices for JWT token refresh patterns",
  context: { search_focus: "documentation and technical blogs" }
})
```

## Troubleshooting

### Agents Not Spawning
- Check MCP server is running
- Verify `spawn_agent` tool is available
- Check database for agent_tasks table

### Results Not Available
- Ensure task status is "completed"
- Check for errors in task status
- Verify `update_agent_task` was called

### Fallback to Prompts
If MCP tools fail, commands automatically fall back to prompt-based approach. This ensures agents always work, even without MCP server.

## See Also

- [AGENT_CONTRACTS.md](./.cursor/rules/AGENT_CONTRACTS.md) - Detailed agent contracts
- [AGENT_ORCHESTRATION_OPTIONS.md](./AGENT_ORCHESTRATION_OPTIONS.md) - Architecture decisions
- [MCP_SETUP.md](./MCP_SETUP.md) - MCP server setup

