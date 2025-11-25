/**
 * Formatting utilities for user-friendly display
 */

/**
 * Format error messages for display
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    
    // Map common technical errors to user-friendly messages
    if (msg.includes('Database not initialized')) {
      return 'Database is not ready. Please try again in a moment.';
    }
    if (msg.includes('Database lock')) {
      return 'Database is busy. Please try again.';
    }
    if (msg.includes('Failed to initialize database')) {
      return 'Could not connect to database. Please restart the application.';
    }
    if (msg.includes('not found')) {
      return 'Item not found. It may have been deleted.';
    }
    if (msg.includes('permission denied')) {
      return 'Permission denied. Check your database permissions.';
    }
    
    // Return the error message if no mapping found
    return msg;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Format timestamp as relative time (e.g., "5m ago", "2h ago")
 */
export function formatTimestamp(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  }
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }
  if (diffDay < 7) {
    return `${diffDay}d ago`;
  }
  
  // For older dates, use absolute format
  return then.toLocaleDateString();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format tool name for display
 */
export function formatToolName(toolName: string): string {
  // Convert snake_case to Title Case
  return toolName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format tool description from tool name and input
 */
export function formatToolDescription(toolName: string, toolInput: string): string {
  try {
    const parsed = JSON.parse(toolInput);
    const keys = Object.keys(parsed);
    if (keys.length === 0) {
      return `${formatToolName(toolName)} with no parameters`;
    }
    if (keys.length === 1) {
      return `${formatToolName(toolName)}: ${keys[0]}`;
    }
    return `${formatToolName(toolName)}: ${keys.length} parameters`;
  } catch {
    return `${formatToolName(toolName)}: ${truncate(toolInput, 50)}`;
  }
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms?: number): string {
  if (!ms) return 'N/A';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Format cost in USD
 */
export function formatCost(usd?: number): string {
  if (!usd) return 'N/A';
  if (usd < 0.01) {
    return `$${(usd * 1000).toFixed(2)}¢`;
  }
  return `$${usd.toFixed(2)}`;
}

