import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { Approval as DbApproval, Session as DbSession } from '../types/database';
import { UnifiedApprovalRequest } from '../types/ui';
import { enrichApprovals } from '../utils/enrichment';
import { formatError } from '../utils/formatting';

export function useApprovals(sessionId?: string) {
  const [approvals, setApprovals] = useState<UnifiedApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch approvals and sessions in parallel
      const [rawApprovals, rawSessions] = await Promise.all([
        invoke<DbApproval[]>('get_pending_approvals', { session_id: sessionId || null }),
        invoke<DbSession[]>('list_sessions', { limit: 100 }),
      ]);
      
      // Enrich approvals with session context
      const enriched = enrichApprovals(rawApprovals || [], rawSessions || []);
      setApprovals(enriched);
    } catch (err) {
      const errorMsg = formatError(err);
      console.error('Failed to fetch approvals:', errorMsg);
      setError(errorMsg);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const refresh = useCallback(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const approve = useCallback(async (approvalId: string, comment?: string) => {
    try {
      await invoke('approve_request', {
        approvalId,
        comment: comment || undefined,
      });
      toast.success('Approval granted');
      // Auto-refresh after action
      await fetchApprovals();
    } catch (err) {
      const errorMsg = formatError(err);
      toast.error(`Failed to approve: ${errorMsg}`);
      throw err;
    }
  }, [fetchApprovals]);

  const deny = useCallback(async (approvalId: string, comment: string) => {
    if (!comment.trim()) {
      const errorMsg = 'Comment is required when denying an approval';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
    try {
      await invoke('deny_request', {
        approvalId,
        comment: comment.trim(),
      });
      toast.success('Approval denied');
      // Auto-refresh after action
      await fetchApprovals();
    } catch (err) {
      const errorMsg = formatError(err);
      toast.error(`Failed to deny: ${errorMsg}`);
      throw err;
    }
  }, [fetchApprovals]);

  return {
    approvals,
    loading,
    error,
    refresh,
    approve,
    deny,
  };
}
