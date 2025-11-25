/**
 * Database types - raw data from SQLite
 * These match the Rust database schema exactly
 */

export interface Approval {
  id: string;
  run_id: string;
  session_id: string;
  tool_use_id?: string;
  tool_name: string;
  tool_input: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  responded_at?: string;
  comment?: string;
}

export interface Session {
  id: string;
  run_id: string;
  query: string;
  status: string;
  working_dir?: string;
  worktree_path?: string;
  handoff_id?: string;
  created_at: string;
  last_activity_at: string;
  completed_at?: string;
  cost_usd?: number;
  duration_ms?: number;
  error_message?: string;
}

export interface ConversationEvent {
  id: number;
  session_id: string;
  sequence: number;
  event_type: string;
  created_at: string;
  role?: string;
  content?: string;
  tool_id?: string;
  tool_name?: string;
  tool_input_json?: string;
  tool_result_for_id?: string;
  tool_result_content?: string;
  is_completed?: boolean;
  approval_status?: string;
  approval_id?: string;
}

