# Agent Contracts

This document defines the contracts for all specialized agents in cursor-layer. Each agent has a specific role, expected inputs, and output format.

## Agent Types

### codebase-locator
**Purpose:** Find WHERE files and components live in the codebase

**Input:**
- `query`: Description of what to find (e.g., "authentication middleware", "user model")
- `directory_hint` (optional): Specific directory to focus on
- `file_patterns` (optional): File extensions or patterns to search

**Output Format:**
```
## File Locations for [Topic]

### Implementation Files
- `path/to/file.ext` - Brief description
- `path/to/another.ext` - Another description

### Test Files
- `path/to/test.ext` - Test description

### Related Directories
- `path/to/dir/` - Contains X related files
```

**Key Behaviors:**
- Uses grep, glob, and list_directory tools
- Groups files by purpose (implementation, tests, config, docs)
- Provides full paths from repository root
- Respects .gitignore patterns

---

### codebase-analyzer
**Purpose:** Understand HOW specific code works

**Input:**
- `file_paths`: Array of file paths to analyze
- `focus_area` (optional): Specific aspect to focus on (e.g., "data flow", "error handling")

**Output Format:**
```
## Analysis: [Component Name]

### Overview
[2-3 sentence summary]

### Entry Points
- `file:line` - Function/class description

### Core Implementation
#### 1. [Feature Name] (`file:line-range`)
- Description of what happens
- Key logic points

### Data Flow
1. Entry point → transformation → output

### Key Patterns
- Pattern name: Description
```

**Key Behaviors:**
- Reads files completely (no limit/offset)
- Traces function calls and data flow
- Documents existing code, doesn't critique
- Includes specific file:line references

---

### codebase-pattern-finder
**Purpose:** Find similar implementations and patterns

**Input:**
- `pattern_description`: What pattern to find (e.g., "API route with authentication", "database query with pagination")
- `example_file` (optional): File to use as reference

**Output Format:**
```
## Pattern Examples: [Pattern Type]

### Pattern 1: [Name]
**Found in**: `file:line-range`
**Used for**: Description

[Code snippet with context]

**Key aspects**:
- Aspect 1
- Aspect 2
```

**Key Behaviors:**
- Searches for similar code structures
- Provides multiple examples when available
- Includes test patterns
- Shows actual working code

---

### thoughts-locator
**Purpose:** Find relevant documents in thoughts/ directory

**Input:**
- `query`: What to search for in thoughts
- `categories` (optional): Specific categories (tickets, research, plans, etc.)

**Output Format:**
```
## Thought Documents about [Topic]

### Tickets
- `thoughts/path/to/ticket.md` - Description

### Research Documents
- `thoughts/path/to/research.md` - Description
```

**Key Behaviors:**
- Searches thoughts/shared/, thoughts/[username]/, thoughts/global/
- Corrects searchable/ paths to actual paths
- Groups by document type
- Doesn't read full contents, just locates

---

### thoughts-analyzer
**Purpose:** Extract high-value insights from thoughts documents

**Input:**
- `document_path`: Path to thoughts document to analyze
- `focus` (optional): Specific aspect to focus on

**Output Format:**
```
## Analysis of: [Document Path]

### Document Context
- **Date**: [When written]
- **Purpose**: [Why it exists]
- **Status**: [Relevance assessment]

### Key Decisions
1. [Decision]: [Details]
   - Rationale: [Why]
   - Impact: [What it enables]

### Critical Constraints
- [Constraint]: [Details]

### Actionable Insights
- [Insight 1]
- [Insight 2]
```

**Key Behaviors:**
- Filters aggressively - only high-value info
- Distinguishes decisions from explorations
- Notes temporal context
- Highlights what's still applicable

---

### web-search-researcher
**Purpose:** Find external information via web search

**Input:**
- `query`: Research question or topic
- `search_focus` (optional): Type of sources (docs, blogs, forums, etc.)

**Output Format:**
```
## Summary
[Brief overview]

## Detailed Findings
### [Topic/Source]
**Source**: [Name with link]
**Key Information**:
- Finding 1
- Finding 2

## Additional Resources
- [Link] - Description
```

**Key Behaviors:**
- Uses WebSearch and WebFetch tools
- Prioritizes official documentation
- Provides source attribution
- Notes publication dates for currency

---

## Agent Invocation Patterns

### Pattern 1: Explicit MCP Tool Call (Preferred)
```typescript
// AI calls MCP tool
spawn_agent({
  agent_type: "codebase-locator",
  task: "Find all authentication-related files",
  context: {
    directory_hint: "src/auth",
    file_patterns: ["*.ts", "*.tsx"]
  }
})
```

### Pattern 2: Prompt-Based (Fallback)
```
Use the codebase-locator agent to find all authentication-related files.
Focus on src/auth directory and look for .ts and .tsx files.
Return results grouped by file type (implementation, tests, config).
```

### Pattern 3: Parallel Agent Spawning
```typescript
// Spawn multiple agents in parallel
spawn_agent({ agent_type: "codebase-locator", task: "Find auth files" })
spawn_agent({ agent_type: "codebase-analyzer", task: "Analyze auth flow" })
spawn_agent({ agent_type: "codebase-pattern-finder", task: "Find auth patterns" })
```

---

## Agent Result Format

All agents return structured results:

```typescript
interface AgentResult {
  agent_type: string;
  task_id: string;
  status: 'running' | 'completed' | 'failed';
  results?: {
    summary: string;
    findings: any; // Agent-specific structure
    file_references?: string[]; // file:line format
  };
  error?: string;
  created_at: string;
  completed_at?: string;
}
```

---

## Best Practices

1. **Always specify agent type explicitly** - Don't rely on AI to guess
2. **Provide clear task descriptions** - Vague tasks lead to poor results
3. **Use parallel agents** - Spawn multiple agents simultaneously for efficiency
4. **Wait for completion** - Don't proceed until all agents finish
5. **Synthesize results** - Combine agent findings into coherent answer
6. **Track agent usage** - Log which agents ran for debugging

---

## Integration with Commands

Commands should:
1. **Prefer MCP tools** - Use `spawn_agent` when available
2. **Fallback to prompts** - If tools unavailable, use explicit prompt instructions
3. **Track agent tasks** - Store agent task IDs for status checking
4. **Synthesize results** - Combine multiple agent outputs into final answer

