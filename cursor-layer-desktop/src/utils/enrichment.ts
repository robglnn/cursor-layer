/**
 * Data enrichment utilities
 * Combines raw database data with additional context for UI display
 */

import { Approval as DbApproval, Session as DbSession } from '../types/database';
import { UnifiedApprovalRequest, SessionSummary } from '../types/ui';
import { formatToolName, formatToolDescription, formatDuration, formatCost } from './formatting';

/**
 * Parse tool input JSON safely
 */
function parseToolInput(toolInput: string): Record<string, any> | undefined {
  try {
    return JSON.parse(toolInput);
  } catch {
    return undefined;
  }
}

/**
 * Enrich approvals with session context
 */
export function enrichApprovals(
  approvals: DbApproval[],
  sessions: DbSession[]
): UnifiedApprovalRequest[] {
  const sessionMap = new Map(sessions.map(s => [s.id, s]));
  
  return approvals.map(approval => {
    const session = sessionMap.get(approval.session_id);
    const toolInput = parseToolInput(approval.tool_input);
    
    return {
      id: approval.id,
      callId: approval.tool_use_id || approval.id,
      runId: approval.run_id,
      type: 'function_call' as const,
      title: formatToolName(approval.tool_name),
      description: formatToolDescription(approval.tool_name, approval.tool_input),
      tool: approval.tool_name,
      parameters: toolInput,
      createdAt: new Date(approval.created_at),
      status: approval.status,
      respondedAt: approval.responded_at ? new Date(approval.responded_at) : undefined,
      comment: approval.comment,
      // Enriched from session
      sessionId: approval.session_id,
      sessionQuery: session?.query,
      sessionStatus: session?.status,
      sessionWorkingDir: session?.working_dir,
    };
  });
}

/**
 * Enrich sessions with computed fields
 */
export function enrichSessions(sessions: DbSession[]): SessionSummary[] {
  return sessions.map(session => ({
    id: session.id,
    runId: session.run_id,
    query: session.query,
    status: session.status,
    workingDir: session.working_dir,
    createdAt: new Date(session.created_at),
    lastActivityAt: new Date(session.last_activity_at),
    completedAt: session.completed_at ? new Date(session.completed_at) : undefined,
    costUSD: session.cost_usd,
    durationMs: session.duration_ms,
    errorMessage: session.error_message,
    // Computed fields
    duration: formatDuration(session.duration_ms),
    cost: formatCost(session.cost_usd),
  }));
}

