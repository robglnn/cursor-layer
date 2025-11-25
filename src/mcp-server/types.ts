/**
 * MCP Server type definitions
 */

export interface RequestApprovalParams {
  tool_name: string;
  tool_input: unknown; // Will be JSON stringified
  tool_use_id: string;
  session_id?: string;
}

export interface ApprovalResponse {
  behavior: 'allow' | 'deny';
  message?: string;
  updatedInput?: unknown;
}

export interface ListApprovalsParams {
  session_id?: string;
  status?: 'pending' | 'approved' | 'denied';
}

export interface ApproveParams {
  approval_id: string;
  comment?: string;
}

export interface DenyParams {
  approval_id: string;
  comment: string; // Required for deny
}

export interface SpawnAgentParams {
  agent_type: 'codebase-locator' | 'codebase-analyzer' | 'codebase-pattern-finder' | 'thoughts-locator' | 'thoughts-analyzer' | 'web-search-researcher';
  task: string;
  context?: Record<string, unknown>;
  session_id?: string;
}

export interface GetAgentStatusParams {
  task_id: string;
}

export interface GetAgentResultsParams {
  task_id: string;
}

export interface ListAgentTasksParams {
  session_id?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  limit?: number;
}

