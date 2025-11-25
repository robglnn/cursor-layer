import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Session as DbSession } from '../types/database';
import { SessionSummary } from '../types/ui';
import { enrichSessions } from '../utils/enrichment';
import { formatError } from '../utils/formatting';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const rawSessions = await invoke<DbSession[]>('list_sessions', { limit: 50 });
      
      // Enrich sessions with computed fields
      const enriched = enrichSessions(rawSessions || []);
      setSessions(enriched);
    } catch (err) {
      const errorMsg = formatError(err);
      console.error('Failed to fetch sessions:', errorMsg);
      setError(errorMsg);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const refresh = useCallback(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refresh,
  };
}
