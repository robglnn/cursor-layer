import { useEffect, useState, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useApprovalsWithSubscription } from '../hooks/useApprovalsWithSubscription';
import ApprovalCard from '../components/ApprovalCard';
import { AlertCircle, Keyboard } from 'lucide-react';
import { HOTKEY_SCOPES } from '../hooks/hotkeys';
import { toast } from 'sonner';

export default function ApprovalsPage() {
  const { approvals, loading, error, refresh, approve, deny } = useApprovalsWithSubscription({
    pollInterval: 3000,
    enabled: true,
  });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const pending = approvals.filter((a) => a.status === 'pending');
  const resolved = approvals.filter((a) => a.status !== 'pending');

  // Keyboard shortcuts
  const handleApproveFirst = useCallback(async () => {
    if (pending.length === 0) {
      toast.info('No pending approvals');
      return;
    }
    const approval = pending[selectedIndex] || pending[0];
    try {
      await approve(approval.id);
    } catch (err) {
      // Error handled in hook
    }
  }, [pending, selectedIndex, approve]);

  const handleDenyFirst = useCallback(async () => {
    if (pending.length === 0) {
      toast.info('No pending approvals');
      return;
    }
    const approval = pending[selectedIndex] || pending[0];
    const comment = prompt('Enter a reason for denial (required):');
    if (!comment || !comment.trim()) {
      return;
    }
    try {
      await deny(approval.id, comment);
    } catch (err) {
      // Error handled in hook
    }
  }, [pending, selectedIndex, deny]);

  // Global shortcuts
  useHotkeys('r', () => {
    refresh();
    toast.success('Refreshed');
  }, {
    scopes: [HOTKEY_SCOPES.APPROVALS, HOTKEY_SCOPES.ROOT],
    preventDefault: true,
  });

  useHotkeys('?', () => {
    setShowShortcuts(prev => !prev);
  }, {
    scopes: [HOTKEY_SCOPES.APPROVALS, HOTKEY_SCOPES.ROOT],
    preventDefault: true,
  });

  // Approval shortcuts (only when there are pending approvals)
  useHotkeys('a', handleApproveFirst, {
    scopes: [HOTKEY_SCOPES.APPROVALS],
    preventDefault: true,
    enabled: pending.length > 0,
  });

  useHotkeys('d', handleDenyFirst, {
    scopes: [HOTKEY_SCOPES.APPROVALS],
    preventDefault: true,
    enabled: pending.length > 0,
  });

  // Navigation shortcuts
  useHotkeys('j', () => {
    if (pending.length > 0) {
      setSelectedIndex(prev => Math.min(prev + 1, pending.length - 1));
    }
  }, {
    scopes: [HOTKEY_SCOPES.APPROVALS],
    preventDefault: true,
    enabled: pending.length > 0,
  });

  useHotkeys('k', () => {
    if (pending.length > 0) {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    }
  }, {
    scopes: [HOTKEY_SCOPES.APPROVALS],
    preventDefault: true,
    enabled: pending.length > 0,
  });

  useEffect(() => {
    // Reset selection when pending list changes
    if (selectedIndex >= pending.length) {
      setSelectedIndex(Math.max(0, pending.length - 1));
    }
  }, [pending.length, selectedIndex]);

  if (loading && approvals.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Loading approvals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Error loading approvals: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" data-hotkey-scope={HOTKEY_SCOPES.APPROVALS}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Approvals
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {pending.length} pending, {resolved.length} resolved
          </p>
        </div>
        <button
          onClick={() => setShowShortcuts(prev => !prev)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          title="Show keyboard shortcuts (?)"
        >
          <Keyboard className="w-4 h-4" />
          Shortcuts
        </button>
      </div>

      {showShortcuts && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div><kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">A</kbd> Approve first pending</div>
            <div><kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">D</kbd> Deny first pending</div>
            <div><kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">J</kbd> Next approval</div>
            <div><kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">K</kbd> Previous approval</div>
            <div><kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">R</kbd> Refresh</div>
            <div><kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">?</kbd> Toggle shortcuts</div>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Pending ({pending.length})
          </h3>
          <div className="space-y-4">
            {pending.map((approval, index) => (
              <div
                key={approval.id}
                className={index === selectedIndex ? 'ring-2 ring-blue-500 rounded-lg' : ''}
              >
                <ApprovalCard
                  approval={approval}
                  onApprove={approve}
                  onDeny={deny}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Resolved ({resolved.length})
          </h3>
          <div className="space-y-4">
            {resolved.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={approve}
                onDeny={deny}
              />
            ))}
          </div>
        </div>
      )}

      {approvals.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No approvals found
        </div>
      )}
    </div>
  );
}
