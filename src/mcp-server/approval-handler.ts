/**
 * Approval handler - manages approval workflow
 * 
 * Based on HumanLayer approval patterns:
 * - Auto-approve if session has dangerously_skip_permissions enabled
 * - Create approval record
 * - Wait for user decision
 * - Return allow/deny behavior
 */

import { randomUUID } from 'crypto';
import { Store } from '../storage';
import type { Approval, Session } from '../storage/types';
import type { RequestApprovalParams, ApprovalResponse } from './types';

export class ApprovalHandler {
  private store: Store;
  private pendingApprovals: Map<string, {
    resolve: (response: ApprovalResponse) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();

  constructor(store: Store) {
    this.store = store;
  }

  /**
   * Request approval for a tool execution
   * Returns immediately if auto-approved, otherwise waits for user decision
   */
  async requestApproval(
    params: RequestApprovalParams,
    sessionId?: string
  ): Promise<ApprovalResponse> {
    // Get or create session
    let session: Session | null = null;
    let runId: string = randomUUID();

    if (sessionId) {
      session = this.store.getSession(sessionId);
      if (session) {
        runId = session.runId;
      }
    }

    // Create approval record
    const approvalId = `local-${randomUUID()}`;
    const toolInputJson = JSON.stringify(params.tool_input);

    // Check for auto-approval (simplified - no dangerously_skip_permissions for MVP)
    // In future, check session settings for auto-approve modes

    const approval: Approval = {
      id: approvalId,
      runId,
      sessionId: sessionId || 'unknown',
      toolUseId: params.tool_use_id,
      status: 'pending',
      toolName: params.tool_name,
      toolInput: toolInputJson,
      createdAt: new Date(),
    };

    this.store.createApproval(approval);

    // For MVP, we'll return a pending response that Cursor can show in chat
    // The actual approval will be handled via separate approve/deny tools
    return {
      behavior: 'deny', // Default to deny until approved
      message: `Approval required for: ${params.tool_name}. Use approve/deny tools to respond. Approval ID: ${approvalId}`,
    };
  }

  /**
   * Approve a pending approval
   */
  approve(approvalId: string, comment?: string): ApprovalResponse {
    const approval = this.store.getApproval(approvalId);
    if (!approval) {
      throw new Error(`Approval not found: ${approvalId}`);
    }

    if (approval.status !== 'pending') {
      throw new Error(`Approval ${approvalId} is not pending (status: ${approval.status})`);
    }

    this.store.updateApprovalStatus(approvalId, 'approved', comment);

    // Parse tool input to return
    let updatedInput: unknown;
    try {
      updatedInput = JSON.parse(approval.toolInput);
    } catch {
      updatedInput = approval.toolInput;
    }

    return {
      behavior: 'allow',
      updatedInput,
    };
  }

  /**
   * Deny a pending approval
   */
  deny(approvalId: string, comment: string): ApprovalResponse {
    const approval = this.store.getApproval(approvalId);
    if (!approval) {
      throw new Error(`Approval not found: ${approvalId}`);
    }

    if (approval.status !== 'pending') {
      throw new Error(`Approval ${approvalId} is not pending (status: ${approval.status})`);
    }

    this.store.updateApprovalStatus(approvalId, 'denied', comment);

    return {
      behavior: 'deny',
      message: comment || 'Approval denied',
    };
  }

  /**
   * List pending approvals
   */
  listApprovals(sessionId?: string): Approval[] {
    return this.store.getPendingApprovals(sessionId);
  }
}

