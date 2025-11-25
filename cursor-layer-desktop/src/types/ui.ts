/**
 * UI types - enriched data for display
 * These combine database types with additional context
 */

/**
 * UI-friendly approval type that combines Approval with Session context
 */
export interface UnifiedApprovalRequest {
  id: string;
  callId: string; // tool_use_id or id
  runId: string;
  type: 'function_call' | 'human_contact';
  title: string; // Formatted for display
  description: string; // Full details
  tool?: string; // Tool name
  parameters?: Record<string, any>; // Parsed tool input
  createdAt: Date;
  status: 'pending' | 'approved' | 'denied';
  respondedAt?: Date;
  comment?: string;
  // Enriched from session
  sessionId?: string;
  sessionQuery?: string;
  sessionStatus?: string;
  sessionWorkingDir?: string;
}

/**
 * UI-friendly session type
 */
export interface SessionSummary {
  id: string;
  runId: string;
  query: string;
  status: string;
  workingDir?: string;
  createdAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
  costUSD?: number;
  durationMs?: number;
  errorMessage?: string;
  // Computed fields
  duration?: string; // Formatted duration
  cost?: string; // Formatted cost
}

