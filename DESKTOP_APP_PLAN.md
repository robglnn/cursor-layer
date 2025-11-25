# Desktop App Implementation Plan

## Overview

Cross-platform Tauri desktop app for managing approvals and viewing sessions. Works alongside Cursor IDE.

## Why Desktop App?

- **Rich UI** - Better than CLI for managing multiple approvals
- **Session History** - Visual timeline of AI work
- **Analytics** - Cost tracking, session metrics
- **Notifications** - System notifications for pending approvals
- **Always Available** - Works even when Cursor is closed

## Architecture

### Tech Stack

- **Framework**: Tauri v2 (Rust backend, WebView frontend)
- **Frontend**: React + TypeScript + Tailwind CSS
- **UI Components**: Radix UI (like HumanLayer)
- **Database**: Shared SQLite with MCP server
- **Platforms**: Windows + macOS (primary)

### Project Structure

```
cursor-layer-desktop/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs              # Tauri entry point
│   │   ├── commands.rs          # Tauri commands (database access)
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── pages/
│   │   ├── ApprovalsPage.tsx    # Main approvals view
│   │   ├── SessionsPage.tsx     # Sessions list
│   │   └── SessionDetailPage.tsx # Session detail
│   ├── components/
│   │   ├── ApprovalCard.tsx
│   │   ├── ApprovalDetail.tsx
│   │   ├── SessionCard.tsx
│   │   └── SessionTimeline.tsx
│   ├── hooks/
│   │   ├── useApprovals.ts      # Approval management
│   │   ├── useSessions.ts       # Session queries
│   │   └── useDatabase.ts       # Database access
│   ├── lib/
│   │   └── database.ts          # Database client
│   └── App.tsx
├── package.json
└── tsconfig.json
```

## Features

### 1. Approval Management

**Approval List View**:
- Table/list of pending approvals
- Status badges (pending, approved, denied)
- Filter by session, tool name, status
- Search functionality
- Sort by date, tool, session

**Approval Detail View**:
- Full tool input preview
- Session context
- Approve/deny buttons
- Comment input
- History of approval

**Real-time Updates**:
- Poll database every 2-3 seconds
- Show new approvals immediately
- Update status changes

### 2. Session Viewer

**Session List**:
- Table of recent sessions
- Query preview
- Status, cost, duration
- Filter and search

**Session Detail**:
- Full conversation timeline
- File changes list
- Tool calls and results
- Cost breakdown
- Export functionality

### 3. Analytics Dashboard

- Total sessions
- Total cost
- Average session duration
- Most used tools
- Approval approval/denial rate

## Implementation Steps

### Step 1: Tauri Setup

1. Initialize Tauri v2 project
2. Configure for Windows and macOS
3. Set up React + TypeScript
4. Add Tailwind CSS
5. Test build process

### Step 2: Database Integration

1. Create Tauri commands for database access
2. Implement Rust SQLite bindings
3. Share database path with MCP server
4. Test concurrent access (WAL mode)

### Step 3: Approval UI

1. Build approval list component
2. Build approval detail modal
3. Implement approve/deny actions
4. Add real-time polling
5. Add filtering and search

### Step 4: Session UI

1. Build session list component
2. Build session detail view
3. Show conversation timeline
4. Display file changes
5. Add cost metrics

### Step 5: Polish

1. Add system notifications
2. Improve UI/UX
3. Add keyboard shortcuts
4. Test on Windows and macOS
5. Performance optimization

## Database Access Pattern

### Tauri Commands

```rust
// src-tauri/src/commands.rs

#[tauri::command]
async fn get_pending_approvals(session_id: Option<String>) -> Result<Vec<Approval>, String> {
    // Access SQLite database
    // Return approvals
}

#[tauri::command]
async fn approve_request(approval_id: String, comment: Option<String>) -> Result<(), String> {
    // Update approval status
    // Return success/error
}
```

### React Hooks

```typescript
// src/hooks/useApprovals.ts

export function useApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  
  useEffect(() => {
    // Poll database via Tauri command
    const interval = setInterval(async () => {
      const data = await invoke('get_pending_approvals');
      setApprovals(data);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const approve = async (id: string, comment?: string) => {
    await invoke('approve_request', { approvalId: id, comment });
    // Refresh
  };
  
  return { approvals, approve, deny };
}
```

## Platform-Specific Considerations

### Windows

- Use Windows-native notifications
- Handle Windows file paths correctly
- Test on Windows 10 and 11
- Bundle SQLite properly

### macOS

- Use macOS-native notifications
- Handle macOS file permissions
- Test on Intel and Apple Silicon
- Code signing for distribution

## Distribution

### Build Targets

- **Windows**: `.exe` installer or portable
- **macOS**: `.dmg` or `.app` bundle
- **Auto-update**: Consider Tauri's update system

### Installation

Users can:
1. Download installer for their platform
2. Install desktop app
3. App automatically finds database (same location as MCP server)
4. Start managing approvals immediately

## Success Criteria

- [ ] App builds for Windows
- [ ] App builds for macOS
- [ ] Approvals can be viewed and managed
- [ ] Sessions are displayed correctly
- [ ] Real-time updates work
- [ ] Database access is concurrent-safe
- [ ] UI is responsive and fast
- [ ] Notifications work on both platforms

## Timeline

- **Week 3**: Tauri setup and database integration
- **Week 4**: UI implementation and testing
- **Week 5**: Polish and cross-platform testing

