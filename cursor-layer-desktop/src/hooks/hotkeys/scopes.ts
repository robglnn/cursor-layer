/**
 * Hotkey scope constants
 * Used to isolate keyboard shortcuts in different UI contexts
 */

export const HOTKEY_SCOPES = {
  // Global shortcuts (always active)
  GLOBAL: '*',
  
  // Root app level
  ROOT: '.',
  
  // Approvals page
  APPROVALS: 'approvals',
  
  // Sessions page
  SESSIONS: 'sessions',
  
  // Modal contexts (isolate root scope)
  MODAL: 'modal',
} as const;

export type HotkeyScope = typeof HOTKEY_SCOPES[keyof typeof HOTKEY_SCOPES];

