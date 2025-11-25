# Desktop App Features

## Core Features

### 1. Approval Management

**Approval Dashboard**:
- List all pending approvals
- Filter by session, tool name, status
- Search functionality
- Sort by date, urgency

**Approval Detail View**:
- Full tool input preview (formatted JSON)
- Session context (what the AI is working on)
- Approve/deny buttons with comment input
- Approval history

**Real-time Updates**:
- Auto-refresh every 2-3 seconds
- System notifications for new approvals
- Visual indicators for pending count

### 2. Session Viewer

**Session List**:
- Table of recent sessions
- Query preview (truncated)
- Status badges
- Cost and duration
- Filter by status, date range
- Search by query text

**Session Detail**:
- Full conversation timeline
- Message history
- Tool calls and results
- File changes list
- Cost breakdown
- Export conversation

### 3. Analytics Dashboard

**Metrics**:
- Total sessions
- Total cost (USD)
- Average session duration
- Approval approval/denial rate
- Most used tools
- Sessions per day/week

**Charts**:
- Cost over time
- Session duration distribution
- Tool usage frequency
- Approval decision trends

## UI/UX Design

### Design Principles

- **Clean and Minimal** - Focus on content, not chrome
- **Fast** - Instant feedback, no lag
- **Keyboard-Friendly** - Full keyboard navigation
- **Responsive** - Works on different screen sizes

### Color Scheme

- **Pending Approvals**: Yellow/Orange
- **Approved**: Green
- **Denied**: Red
- **Sessions**: Blue/Gray

### Layout

```
┌─────────────────────────────────────┐
│  Cursor Layer                       │
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │  Main Content            │
│          │                          │
│ - Approvals│  - Approval List       │
│ - Sessions │  - Session Detail      │
│ - Analytics│  - Analytics Dashboard │
│          │                          │
└──────────┴──────────────────────────┘
```

## Platform-Specific Features

### Windows

- Windows 10/11 native notifications
- Taskbar integration
- Windows-style dialogs
- Proper file path handling

### macOS

- macOS Big Sur+ native notifications
- Menu bar integration (optional)
- macOS-style dialogs
- Apple Silicon support

## Technical Implementation

### Database Access

Both MCP server and desktop app use the same SQLite database:
- **Location**: `~/.cursor-layer/db.sqlite` (configurable)
- **Concurrency**: WAL mode allows concurrent reads
- **Locks**: Single writer, multiple readers
- **Sync**: Real-time via polling (2-3 second intervals)

### Tauri Commands

```rust
// Database access commands
#[tauri::command]
fn get_pending_approvals(session_id: Option<String>) -> Vec<Approval>

#[tauri::command]
fn approve_request(id: String, comment: Option<String>) -> Result<(), String>

#[tauri::command]
fn deny_request(id: String, comment: String) -> Result<(), String>

#[tauri::command]
fn list_sessions(limit: usize) -> Vec<Session>

#[tauri::command]
fn get_session(session_id: String) -> Option<Session>

#[tauri::command]
fn get_conversation(session_id: String) -> Vec<ConversationEvent>
```

### React Hooks

```typescript
// useApprovals hook
const { approvals, loading, approve, deny, refresh } = useApprovals();

// useSessions hook
const { sessions, loading, getSession } = useSessions();

// useDatabase hook (for custom queries)
const { query } = useDatabase();
```

## Notifications

### System Notifications

When new approval is created:
- **Title**: "Approval Required"
- **Body**: "Tool: {tool_name} - Session: {session_id}"
- **Action**: Click to open desktop app

### In-App Notifications

- Toast notifications for actions
- Badge count for pending approvals
- Visual indicators in UI

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Quick search
- `Ctrl/Cmd + A` - Select all (in list views)
- `Enter` - Approve selected
- `Esc` - Deny selected
- `Ctrl/Cmd + R` - Refresh

## Future Enhancements

- **Auto-approval rules** - Configure patterns for auto-approval
- **Approval templates** - Pre-written comments for common cases
- **Session comparison** - Compare two sessions side-by-side
- **Export/Import** - Export sessions to JSON/CSV
- **Team features** - Share approvals with team members
- **Webhooks** - Integrate with Slack, Discord, etc.

