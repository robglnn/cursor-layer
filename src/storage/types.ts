/**
 * Type definitions for storage layer
 */

export interface Session {
  id: string;
  runId: string;
  query: string;
  status: SessionStatus;
  workingDir?: string;
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

