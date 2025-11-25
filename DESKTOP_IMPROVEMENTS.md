# Desktop App Improvements from HumanLayer Patterns

## Overview

Analysis of HumanLayer's desktop app patterns and their applicability to `cursor-layer-desktop`.

## Key Improvements Identified

### 1. **Hook-Based Architecture** ✅ Partially Implemented

**Current State:**
- Hooks exist (`useApprovals`, `useSessions`)
- Components call Tauri directly for actions (`invoke` in `ApprovalCard`)

**HumanLayer Pattern:**
- All actions (`approve`, `deny`, `respond`) are methods on hooks
- Components never call Tauri directly
- Hooks handle all business logic

**Action Items:**
- [ ] Move `approve` and `deny` logic from `ApprovalCard` to `useApprovals` hook
- [ ] Add `respond` method for custom responses
- [ ] Hooks should auto-refresh after actions

### 2. **Data Enrichment** ❌ Missing

**Current State:**
- Raw database types used directly in components
- No session context joined with approvals

**HumanLayer Pattern:**
- `UnifiedApprovalRequest` type that enriches raw data
- Approvals joined with session context (query, model, etc.)
- UI-friendly formatting in hooks layer

**Action Items:**
- [ ] Create `UnifiedApprovalRequest` type in `src/types/ui.ts`
- [ ] Add `enrichApprovals` utility function
- [ ] Update `useApprovals` to return enriched data
- [ ] Separate database types from UI types

### 3. **Type Safety & Separation** ⚠️ Needs Improvement

**Current State:**
- Database types (`Approval`, `Session`) used directly in components
- Types defined in hooks files

**HumanLayer Pattern:**
- Separate `types/ui.ts` for UI types
- Protocol/database types in `lib/daemon/types.ts`
- Clear separation of concerns

**Action Items:**
- [ ] Create `src/types/ui.ts` for UI-specific types
- [ ] Create `src/types/database.ts` for database types
- [ ] Update hooks to use database types internally, return UI types
- [ ] Update components to use UI types only

### 4. **Error Handling** ⚠️ Basic

**Current State:**
- Basic error strings
- Toast notifications for errors

**HumanLayer Pattern:**
- `formatError` utility for user-friendly messages
- Error handling in hooks layer
- Components receive simple error strings

**Action Items:**
- [ ] Create `src/utils/formatting.ts` with `formatError` function
- [ ] Map technical errors to user-friendly messages
- [ ] Centralize error formatting in hooks

### 5. **Real-time Updates** ⚠️ Basic Polling

**Current State:**
- Manual polling in `ApprovalsPage` (3 second interval)
- No subscription pattern

**HumanLayer Pattern:**
- `useApprovalsWithSubscription` hook variant
- Configurable polling intervals
- Better state management

**Action Items:**
- [ ] Create `useApprovalsWithSubscription` hook
- [ ] Make polling interval configurable
- [ ] Add pause/resume functionality
- [ ] Better handling of connection state

### 6. **Keyboard Shortcuts** ❌ Missing

**HumanLayer Pattern:**
- Comprehensive hotkey system
- Scope-based isolation (prevents conflicts)
- Modal-aware shortcuts

**Action Items:**
- [ ] Add `react-hotkeys-hook` dependency
- [ ] Create `src/hooks/hotkeys/` directory
- [ ] Implement scope system for modal isolation
- [ ] Add common shortcuts:
  - `A` - Approve pending
  - `D` - Deny pending
  - `R` - Refresh
  - `Esc` - Close modals
  - `?` - Show shortcuts help

### 7. **Utility Functions** ⚠️ Partial

**Current State:**
- `date-fns` used directly in components
- No centralized formatting utilities

**HumanLayer Pattern:**
- `formatTimestamp` - relative time ("5m ago")
- `truncate` - text truncation with ellipsis
- `formatError` - error message formatting

**Action Items:**
- [ ] Create `src/utils/formatting.ts`
- [ ] Add `formatTimestamp` for relative dates
- [ ] Add `truncate` for long text
- [ ] Add `formatError` for user-friendly errors

### 8. **Component Patterns** ✅ Good

**Current State:**
- Components are relatively clean
- Good separation of presentation

**Minor Improvements:**
- [ ] Extract loading/error states to reusable components
- [ ] Add empty states with helpful messages
- [ ] Improve accessibility (ARIA labels, keyboard navigation)

## Implementation Status

### Phase 1: Core Architecture ✅ COMPLETE
1. ✅ Move actions to hooks (approve/deny)
2. ✅ Create type separation (UI vs database)
3. ✅ Add data enrichment
4. ✅ Improve error formatting
5. ✅ Utility functions

### Phase 2: UX Improvements ✅ COMPLETE
1. ✅ Add keyboard shortcuts
2. ✅ Better real-time updates (subscription hook)
3. ✅ Keyboard navigation (J/K for navigation, A/D for actions)

### Phase 3: Polish (Future)
- Component refinements
- Accessibility improvements
- Advanced hotkey scope system (modal isolation)

## Code Examples

### Improved Hook Pattern

```typescript
// src/hooks/useApprovals.ts
export function useApprovals(sessionId?: string) {
  const [approvals, setApprovals] = useState<UnifiedApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setError(null);
      const rawApprovals = await invoke<Approval[]>('get_pending_approvals', { session_id: sessionId });
      const sessions = await invoke<Session[]>('list_sessions', { limit: 100 });
      // Enrich with session context
      const enriched = enrichApprovals(rawApprovals, sessions);
      setApprovals(enriched);
    } catch (err) {
      setError(formatError(err));
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const approve = useCallback(async (approvalId: string, comment?: string) => {
    try {
      await invoke('approve_request', { approvalId, comment });
      await fetchApprovals(); // Auto-refresh
      toast.success('Approved');
    } catch (err) {
      toast.error(formatError(err));
      throw err;
    }
  }, [fetchApprovals]);

  const deny = useCallback(async (approvalId: string, comment: string) => {
    if (!comment.trim()) {
      throw new Error('Comment required when denying');
    }
    try {
      await invoke('deny_request', { approvalId, comment });
      await fetchApprovals(); // Auto-refresh
      toast.success('Denied');
    } catch (err) {
      toast.error(formatError(err));
      throw err;
    }
  }, [fetchApprovals]);

  return { approvals, loading, error, refresh: fetchApprovals, approve, deny };
}
```

### Type Separation

```typescript
// src/types/database.ts
export interface Approval {
  id: string;
  run_id: string;
  session_id: string;
  // ... raw database fields
}

// src/types/ui.ts
export interface UnifiedApprovalRequest {
  id: string;
  callId: string;
  runId: string;
  type: 'function_call' | 'human_contact';
  title: string; // Formatted for display
  description: string; // Full details
  tool?: string;
  parameters?: Record<string, any>;
  createdAt: Date;
  sessionId?: string;
  sessionQuery?: string; // Enriched from session
  sessionModel?: string; // Enriched from session
  status: 'pending' | 'approved' | 'denied';
}
```

### Enrichment Utility

```typescript
// src/utils/enrichment.ts
import { Approval } from '../types/database';
import { Session } from '../types/database';
import { UnifiedApprovalRequest } from '../types/ui';

export function enrichApprovals(
  approvals: Approval[],
  sessions: Session[]
): UnifiedApprovalRequest[] {
  const sessionMap = new Map(sessions.map(s => [s.id, s]));
  
  return approvals.map(approval => {
    const session = sessionMap.get(approval.session_id);
    return {
      id: approval.id,
      callId: approval.tool_use_id || approval.id,
      runId: approval.run_id,
      type: 'function_call' as const,
      title: formatToolName(approval.tool_name),
      description: formatToolDescription(approval.tool_name, approval.tool_input),
      tool: approval.tool_name,
      parameters: parseToolInput(approval.tool_input),
      createdAt: new Date(approval.created_at),
      sessionId: approval.session_id,
      sessionQuery: session?.query,
      sessionModel: session?.model,
      status: approval.status,
    };
  });
}
```

## Notes

- HumanLayer uses JSON-RPC over Unix sockets; we use Tauri IPC (simpler, sufficient)
- HumanLayer has more complex session management (Claude Code integration); we track Cursor sessions
- The core patterns (hooks, type separation, enrichment) are universally applicable
- Keyboard shortcuts are valuable for power users
- Error formatting improves UX significantly

