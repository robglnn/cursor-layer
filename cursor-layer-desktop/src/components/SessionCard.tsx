import { Clock, DollarSign, FileText } from 'lucide-react';
import { SessionSummary } from '../types/ui';
import { formatTimestamp } from '../utils/formatting';

interface SessionCardProps {
  session: SessionSummary;
}

export default function SessionCard({ session }: SessionCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {session.query || 'Untitled Session'}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTimestamp(session.lastActivityAt)}</span>
            </div>
            {session.cost && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>{session.cost}</span>
              </div>
            )}
            {session.duration && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{session.duration}</span>
              </div>
            )}
          </div>
        </div>
        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {session.status}
        </span>
      </div>
      <div className="text-xs text-gray-500 font-mono">
        ID: {session.id}
      </div>
    </div>
  );
}
