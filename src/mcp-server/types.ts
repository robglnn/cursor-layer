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

