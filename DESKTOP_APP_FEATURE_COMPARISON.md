# Desktop App Feature Comparison: HumanLayer vs Cursor Layer

## Overview

This document compares the features of HumanLayer's desktop app (`humanlayer-wui`) with cursor-layer's desktop app (`cursor-layer-desktop`).

## Key Architectural Difference

**HumanLayer Desktop App:**
- **Full session management** - Can launch, control, and manage Claude Code sessions
- **Active daemon integration** - Communicates with HumanLayer Daemon (HLD) via JSON-RPC
- **Session lifecycle control** - Can start, interrupt, fork, and archive sessions

**Cursor Layer Desktop App:**
- **Read-only viewer** - Only displays data from shared SQLite database
- **Approval management** - Can approve/deny existing approvals
- **No session control** - Cannot launch or manage Cursor sessions (Cursor manages its own sessions)

---

## Feature Comparison Table

| Feature | HumanLayer | Cursor Layer | Notes |
|---------|-----------|--------------|-------|
| **Session Management** |
| Launch Sessions | ✅ Yes | ❌ No | HumanLayer launches Claude Code sessions; Cursor manages its own |
| View Sessions | ✅ Yes | ✅ Yes | Both display session history |
| Interrupt Sessions | ✅ Yes | ❌ No | HumanLayer can stop running sessions |
| Archive Sessions | ✅ Yes | ❌ No | HumanLayer can archive/unarchive sessions |
| Fork Sessions | ✅ Yes | ❌ No | HumanLayer can fork sessions to create variants |
| Rename Sessions | ✅ Yes | ❌ No | HumanLayer can rename sessions |
| Session Details View | ✅ Yes | ❌ No | HumanLayer has detailed session view with conversation |
| **Approval Management** |
| View Approvals | ✅ Yes | ✅ Yes | Both display pending approvals |
| Approve Requests | ✅ Yes | ✅ Yes | Both can approve pending approvals |
| Deny Requests | ✅ Yes | ✅ Yes | Both can deny pending approvals |
| Real-time Updates | ✅ Yes (WebSocket) | ✅ Yes (Polling) | HumanLayer uses WebSocket; Cursor Layer polls |
| Approval Filtering | ✅ Yes | ⚠️ Basic | HumanLayer filters by session, status, type |
| **Conversation View** |
| View Conversation | ✅ Yes | ❌ No | HumanLayer shows full conversation history |
| Tool Call Details | ✅ Yes | ❌ No | HumanLayer shows tool calls and results |
| Event Timeline | ✅ Yes | ❌ No | HumanLayer shows chronological event stream |
| **User Interface** |
| Keyboard Shortcuts | ✅ Yes (Extensive) | ✅ Yes (Basic) | HumanLayer has 20+ shortcuts; Cursor Layer has 6 |
| Command Palette | ✅ Yes | ❌ No | HumanLayer has Cmd+K command palette |
| Theme Toggle | ✅ Yes | ⚠️ System | HumanLayer has built-in theme switcher |
| Settings Dialog | ✅ Yes | ❌ No | HumanLayer has preferences/settings |
| Hotkey Help | ✅ Yes | ✅ Yes | Both show keyboard shortcuts |
| **Session Features** |
| Draft Sessions | ✅ Yes | ❌ No | HumanLayer can create draft sessions before launching |
| Session Launcher | ✅ Yes | ❌ No | HumanLayer has dedicated session launcher UI |
| Bypass Permissions | ✅ Yes | ❌ No | HumanLayer can enable auto-approve for sessions |
| Auto-accept Edits | ✅ Yes | ❌ No | HumanLayer can auto-accept file edits |
| Session Search | ✅ Yes | ❌ No | HumanLayer can search/filter sessions |
| Bulk Operations | ✅ Yes | ❌ No | HumanLayer can bulk archive/select sessions |
| **Data Enrichment** |
| Session Context | ✅ Yes | ✅ Yes | Both enrich approvals with session data |
| Tool Formatting | ✅ Yes | ✅ Yes | Both format tool names and inputs |
| Relative Timestamps | ✅ Yes | ✅ Yes | Both show "5m ago" style timestamps |
| **Advanced Features** |
| Event Subscriptions | ✅ Yes (WebSocket) | ❌ No | HumanLayer has real-time event streaming |
| Telemetry | ✅ Yes (PostHog) | ❌ No | HumanLayer tracks usage analytics |
| Undo Actions | ✅ Yes | ❌ No | HumanLayer can undo archive/delete actions |
| Session Forking | ✅ Yes | ❌ No | HumanLayer can fork sessions to create variants |
| Parent Session Navigation | ✅ Yes | ❌ No | HumanLayer shows session relationships |
| **Platform Support** |
| macOS | ✅ Yes | ✅ Yes | Both support macOS |
| Windows | ❌ No | ✅ Yes | Cursor Layer supports Windows |
| Linux | ❌ No | ⚠️ Untested | Cursor Layer should work on Linux |

---

## Detailed Feature Breakdown

### Session Management

#### HumanLayer
- **Launch Sessions**: Can create and launch new Claude Code sessions from the desktop app
- **Session Control**: Can interrupt, fork, archive, and rename sessions
- **Session Details**: Full conversation view with tool calls, results, and timeline
- **Draft Sessions**: Can create draft sessions before launching
- **Session Launcher**: Dedicated UI for launching sessions with options (model, working dir, etc.)

#### Cursor Layer
- **View Only**: Can only view sessions that were logged via MCP tools
- **No Control**: Cannot launch, interrupt, or manage sessions
- **Basic Display**: Shows session list with basic info (query, status, cost, duration)
- **No Details**: No conversation view or detailed session information

### Approval Management

#### HumanLayer
- **Real-time**: WebSocket-based real-time updates
- **Filtering**: Filter by session, status, approval type
- **Rich Context**: Shows full conversation context around approvals
- **Bulk Actions**: Can approve/deny multiple approvals

#### Cursor Layer
- **Polling**: Polls every 3-5 seconds for updates
- **Basic Filtering**: Only shows pending vs resolved
- **Session Context**: Enriches approvals with session query and status
- **Single Actions**: Approve/deny one at a time

### User Interface

#### HumanLayer
- **20+ Keyboard Shortcuts**: Comprehensive hotkey system
- **Command Palette**: Cmd+K to search and execute actions
- **Theme Toggle**: Built-in light/dark theme switcher
- **Settings**: Preferences dialog for user settings
- **Hotkey Scopes**: Advanced scope system for modal isolation

#### Cursor Layer
- **6 Keyboard Shortcuts**: Basic shortcuts (A/D/J/K/R/?)
- **No Command Palette**: No global command search
- **System Theme**: Uses system theme preference
- **No Settings**: No preferences or settings dialog
- **Basic Scopes**: Simple scope system

### Advanced Features

#### HumanLayer
- **Event Subscriptions**: WebSocket-based real-time event streaming
- **Telemetry**: PostHog integration for usage analytics
- **Undo Actions**: Can undo archive/delete operations
- **Session Forking**: Create session variants by forking
- **Parent Navigation**: Navigate between parent/child sessions
- **Bypass Permissions**: Enable auto-approve for specific sessions
- **Auto-accept Edits**: Automatically accept file edits

#### Cursor Layer
- **No Subscriptions**: Polling-based updates only
- **No Telemetry**: No analytics or usage tracking
- **No Undo**: No undo functionality
- **No Forking**: Cannot fork sessions
- **No Relationships**: No parent/child session tracking
- **No Bypass**: No auto-approve features
- **No Auto-accept**: Manual approval required

---

## Why the Differences?

### Architectural Reasons

1. **Session Management Model**:
   - **HumanLayer**: Desktop app actively manages Claude Code sessions via daemon
   - **Cursor Layer**: Cursor IDE manages its own sessions; desktop app is passive viewer

2. **Communication Protocol**:
   - **HumanLayer**: JSON-RPC over WebSocket for real-time bidirectional communication
   - **Cursor Layer**: Shared SQLite database with polling for updates

3. **Integration Level**:
   - **HumanLayer**: Deep integration with Claude Code daemon
   - **Cursor Layer**: Lightweight MCP-based integration

### Design Philosophy

**HumanLayer**: Full-featured session management platform
- Designed as primary interface for Claude Code
- Rich feature set for power users
- Active session control and management

**Cursor Layer**: Minimal approval viewer
- Designed as lightweight approval interface
- Focused on essential approval workflow
- Passive viewer, not active manager

---

## What Cursor Layer Could Add (Future)

### High Priority
1. **Session Details View** - Show conversation history and tool calls
2. **Real-time Updates** - WebSocket or better polling mechanism
3. **More Keyboard Shortcuts** - Expand hotkey system
4. **Approval Filtering** - Filter by session, status, tool type

### Medium Priority
5. **Command Palette** - Cmd+K for quick actions
6. **Settings Dialog** - User preferences
7. **Theme Toggle** - Built-in theme switcher
8. **Bulk Operations** - Approve/deny multiple at once

### Low Priority
9. **Telemetry** - Optional usage analytics
10. **Undo Actions** - Undo approval decisions
11. **Session Search** - Search/filter sessions
12. **Advanced Filtering** - Complex approval queries

---

## Summary

**HumanLayer Desktop App** is a **full-featured session management platform** with:
- ✅ Active session control (launch, interrupt, fork, archive)
- ✅ Rich conversation views
- ✅ Real-time WebSocket updates
- ✅ 20+ keyboard shortcuts
- ✅ Command palette and settings
- ✅ Advanced features (forking, bypass permissions, etc.)

**Cursor Layer Desktop App** is a **minimal approval viewer** with:
- ✅ Basic approval management (approve/deny)
- ✅ Session list view
- ✅ Basic keyboard shortcuts (6)
- ✅ Data enrichment (session context)
- ✅ Cross-platform support (Windows + macOS)

**Key Insight**: Cursor Layer's desktop app is intentionally minimal because:
1. Cursor IDE manages its own sessions (no need for session control)
2. Focus is on approval workflow, not full session management
3. Shared database model is simpler than daemon communication
4. Cross-platform support prioritized over feature richness

---

## Recommendation

For cursor-layer desktop app, prioritize:
1. **Session Details View** - Most requested feature
2. **Real-time Updates** - Better user experience
3. **More Keyboard Shortcuts** - Power user efficiency
4. **Approval Filtering** - Better organization

Skip features that don't make sense:
- ❌ Session launching (Cursor manages this)
- ❌ Session forking (Cursor doesn't support this)
- ❌ Bypass permissions (Different approval model)

