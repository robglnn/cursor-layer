/**
 * SQLite storage layer for sessions and approvals
 * 
 * Simplified schema based on HumanLayer patterns
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync } from 'fs';
import type { Session, Approval, ConversationEvent, SessionStatus, ApprovalStatus } from './types';

export interface StoreOptions {
  dbPath?: string;
}

export class Store {
  private db: Database.Database;

  constructor(options: StoreOptions = {}) {
    const dbPath = options.dbPath || this.getDefaultDbPath();
    this.ensureDbDirectory(dbPath);
    
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    
    this.initSchema();
  }

  private getDefaultDbPath(): string {
    const cursorLayerDir = join(homedir(), '.cursor-layer');
    return join(cursorLayerDir, 'db.sqlite');
  }

  private ensureDbDirectory(dbPath: string): void {
    const dir = join(dbPath, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  private initSchema(): void {
    const schema = `
      -- Sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL UNIQUE,
        query TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'starting',
        working_dir TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        cost_usd REAL,
        duration_ms INTEGER,
        error_message TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_run_id ON sessions(run_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

      -- Approvals table
      CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        tool_use_id TEXT,
        status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied')),
        tool_name TEXT NOT NULL,
        tool_input TEXT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );
      CREATE INDEX IF NOT EXISTS idx_approvals_pending ON approvals(status) WHERE status = 'pending';
      CREATE INDEX IF NOT EXISTS idx_approvals_session ON approvals(session_id);
      CREATE INDEX IF NOT EXISTS idx_approvals_run_id ON approvals(run_id);
      CREATE INDEX IF NOT EXISTS idx_approvals_tool_use_id ON approvals(tool_use_id);

      -- Conversation events table
      CREATE TABLE IF NOT EXISTS conversation_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        role TEXT,
        content TEXT,
        tool_id TEXT,
        tool_name TEXT,
        tool_input_json TEXT,
        tool_result_for_id TEXT,
        tool_result_content TEXT,
        is_completed BOOLEAN DEFAULT FALSE,
        approval_status TEXT,
        approval_id TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );
      CREATE INDEX IF NOT EXISTS idx_conversation_session ON conversation_events(session_id, sequence);
      CREATE INDEX IF NOT EXISTS idx_conversation_approval ON conversation_events(approval_id);
    `;

    this.db.exec(schema);
  }

  // Session methods
  createSession(session: Session): void {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (
        id, run_id, query, status, working_dir,
        created_at, last_activity_at, completed_at,
        cost_usd, duration_ms, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      session.id,
      session.runId,
      session.query,
      session.status,
      session.workingDir || null,
      session.createdAt.toISOString(),
      session.lastActivityAt.toISOString(),
      session.completedAt?.toISOString() || null,
      session.costUSD || null,
      session.durationMs || null,
      session.errorMessage || null
    );
  }

  updateSession(sessionId: string, updates: Partial<Session>): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.lastActivityAt !== undefined) {
      fields.push('last_activity_at = ?');
      values.push(updates.lastActivityAt.toISOString());
    }
    if (updates.completedAt !== undefined) {
      fields.push('completed_at = ?');
      values.push(updates.completedAt.toISOString());
    }
    if (updates.costUSD !== undefined) {
      fields.push('cost_usd = ?');
      values.push(updates.costUSD);
    }
    if (updates.durationMs !== undefined) {
      fields.push('duration_ms = ?');
      values.push(updates.durationMs);
    }
    if (updates.errorMessage !== undefined) {
      fields.push('error_message = ?');
      values.push(updates.errorMessage);
    }

    if (fields.length === 0) return;

    values.push(sessionId);
    const sql = `UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);
  }

  getSession(sessionId: string): Session | null {
    const row = this.db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
    if (!row) return null;

    return this.rowToSession(row);
  }

  getSessionByRunId(runId: string): Session | null {
    const row = this.db.prepare('SELECT * FROM sessions WHERE run_id = ?').get(runId) as any;
    if (!row) return null;

    return this.rowToSession(row);
  }

  listSessions(limit = 100): Session[] {
    const rows = this.db.prepare(`
      SELECT * FROM sessions 
      ORDER BY last_activity_at DESC 
      LIMIT ?
    `).all(limit) as any[];

    return rows.map(row => this.rowToSession(row));
  }

  private rowToSession(row: any): Session {
    return {
      id: row.id,
      runId: row.run_id,
      query: row.query,
      status: row.status as SessionStatus,
      workingDir: row.working_dir || undefined,
      createdAt: new Date(row.created_at),
      lastActivityAt: new Date(row.last_activity_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      costUSD: row.cost_usd || undefined,
      durationMs: row.duration_ms || undefined,
      errorMessage: row.error_message || undefined,
    };
  }

  // Approval methods
  createApproval(approval: Approval): void {
    const stmt = this.db.prepare(`
      INSERT INTO approvals (
        id, run_id, session_id, tool_use_id, status,
        tool_name, tool_input, comment, created_at, responded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      approval.id,
      approval.runId,
      approval.sessionId,
      approval.toolUseId || null,
      approval.status,
      approval.toolName,
      approval.toolInput,
      approval.comment || null,
      approval.createdAt.toISOString(),
      approval.respondedAt?.toISOString() || null
    );
  }

  getApproval(approvalId: string): Approval | null {
    const row = this.db.prepare('SELECT * FROM approvals WHERE id = ?').get(approvalId) as any;
    if (!row) return null;

    return this.rowToApproval(row);
  }

  getPendingApprovals(sessionId?: string): Approval[] {
    let sql = 'SELECT * FROM approvals WHERE status = ?';
    const params: any[] = ['pending'];

    if (sessionId) {
      sql += ' AND session_id = ?';
      params.push(sessionId);
    }

    sql += ' ORDER BY created_at ASC';

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map(row => this.rowToApproval(row));
  }

  updateApprovalStatus(
    approvalId: string,
    status: ApprovalStatus,
    comment?: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE approvals 
      SET status = ?, comment = ?, responded_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(status, comment || null, approvalId);
  }

  private rowToApproval(row: any): Approval {
    return {
      id: row.id,
      runId: row.run_id,
      sessionId: row.session_id,
      toolUseId: row.tool_use_id || undefined,
      status: row.status as ApprovalStatus,
      toolName: row.tool_name,
      toolInput: row.tool_input,
      comment: row.comment || undefined,
      createdAt: new Date(row.created_at),
      respondedAt: row.responded_at ? new Date(row.responded_at) : undefined,
    };
  }

  // Conversation event methods
  addConversationEvent(event: Omit<ConversationEvent, 'id'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO conversation_events (
        session_id, sequence, event_type, created_at,
        role, content, tool_id, tool_name, tool_input_json,
        tool_result_for_id, tool_result_content, is_completed,
        approval_status, approval_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      event.sessionId,
      event.sequence,
      event.eventType,
      event.createdAt.toISOString(),
      event.role || null,
      event.content || null,
      event.toolId || null,
      event.toolName || null,
      event.toolInputJson || null,
      event.toolResultForId || null,
      event.toolResultContent || null,
      event.isCompleted ? 1 : 0,
      event.approvalStatus || null,
      event.approvalId || null
    );

    return Number(result.lastInsertRowid);
  }

  getConversation(sessionId: string): ConversationEvent[] {
    const rows = this.db.prepare(`
      SELECT * FROM conversation_events 
      WHERE session_id = ? 
      ORDER BY sequence ASC
    `).all(sessionId) as any[];

    return rows.map(row => this.rowToConversationEvent(row));
  }

  private rowToConversationEvent(row: any): ConversationEvent {
    return {
      id: row.id,
      sessionId: row.session_id,
      sequence: row.sequence,
      eventType: row.event_type as ConversationEvent['eventType'],
      createdAt: new Date(row.created_at),
      role: row.role || undefined,
      content: row.content || undefined,
      toolId: row.tool_id || undefined,
      toolName: row.tool_name || undefined,
      toolInputJson: row.tool_input_json || undefined,
      toolResultForId: row.tool_result_for_id || undefined,
      toolResultContent: row.tool_result_content || undefined,
      isCompleted: row.is_completed === 1,
      approvalStatus: row.approval_status as ApprovalStatus | undefined,
      approvalId: row.approval_id || undefined,
    };
  }

  close(): void {
    this.db.close();
  }
}

