import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSessions } from '../hooks/useSessions';
import SessionCard from '../components/SessionCard';
import { AlertCircle, Keyboard } from 'lucide-react';
import { HOTKEY_SCOPES } from '../hooks/hotkeys';
import { toast } from 'sonner';

export default function SessionsPage() {
  const { sessions, loading, error, refresh } = useSessions();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts
  useHotkeys('r', () => {
    refresh();
    toast.success('Refreshed');
  }, {
    scopes: [HOTKEY_SCOPES.SESSIONS, HOTKEY_SCOPES.ROOT],
    preventDefault: true,
  });

  useHotkeys('?', () => {
    setShowShortcuts(prev => !prev);
  }, {
    scopes: [HOTKEY_SCOPES.SESSIONS, HOTKEY_SCOPES.ROOT],
    preventDefault: true,
  });

  useEffect(() => {
    // Only start polling if initial load succeeded
    if (!loading && !error) {
      const interval = setInterval(() => {
        refresh();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [refresh, loading, error]);

  if (loading && sessions.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Loading sessions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Error loading sessions: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" data-hotkey-scope={HOTKEY_SCOPES.SESSIONS}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Sessions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {sessions.length} total sessions
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
            <div><kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">R</kbd> Refresh</div>
            <div><kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">?</kbd> Toggle shortcuts</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No sessions found
        </div>
      )}
    </div>
  );
}
