/**
 * Hotkey utilities
 * Simplified version of HumanLayer's scope system
 */

export { HOTKEY_SCOPES, type HotkeyScope } from './scopes';

/**
 * Get platform-specific modifier key
 */
export function getModifierKey(): 'metaKey' | 'ctrlKey' {
  return navigator.platform.includes('Mac') ? 'metaKey' : 'ctrlKey';
}

/**
 * Format hotkey for display
 */
export function formatHotkey(keys: string): string {
  const isMac = navigator.platform.includes('Mac');
  return keys
    .replace(/meta/i, isMac ? '⌘' : 'Ctrl')
    .replace(/ctrl/i, 'Ctrl')
    .replace(/alt/i, isMac ? '⌥' : 'Alt')
    .replace(/shift/i, 'Shift')
    .replace(/enter/i, 'Enter')
    .replace(/escape/i, 'Esc');
}

