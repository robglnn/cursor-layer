/**
 * Type definitions for storage layer
 */

export interface Session {
  id: string;
  runId: string;
  query: string;
  status: SessionStatus;
  workingDir?: string;
  worktreePath?: string; // Path to git worktree if this session is in a worktree
  handoffId?: string; // ID of handoff document if resuming from handoff
  createdAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
  costUSD?: number;
  durationMs?: number;
  errorMessage?: string;
}

export type SessionStatus = 
  | 'starting'
  | 'running'
  | 'completed'
  | 'failed'
  | 'waiting_input';

export interface Approval {
  id: string;
  runId: string;
  sessionId: string;
  toolUseId?: string;
  status: ApprovalStatus;
  toolName: string;
  toolInput: string; // JSON string
  comment?: string;
  createdAt: Date;
  respondedAt?: Date;
}

export type ApprovalStatus = 'pending' | 'approved' | 'denied';

export interface ConversationEvent {
  id: number;
  sessionId: string;
  sequence: number;
  eventType: 'message' | 'tool_call' | 'tool_result' | 'system';
  createdAt: Date;
  role?: 'user' | 'assistant' | 'system';
  content?: string;
  toolId?: string;
  toolName?: string;
  toolInputJson?: string;
  toolResultForId?: string;
  toolResultContent?: string;
  isCompleted?: boolean;
  approvalStatus?: ApprovalStatus;
  approvalId?: string;
}

export interface AgentTask {
  id: string;
  sessionId?: string;
  agentType: string;
  task: string;
  context?: string; // JSON string
  status: AgentTaskStatus;
  results?: string; // JSON string
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export type AgentTaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export type AgentType = 
  | 'codebase-locator'
  | 'codebase-analyzer'
  | 'codebase-pattern-finder'
  | 'thoughts-locator'
  | 'thoughts-analyzer'
  | 'web-search-researcher';

