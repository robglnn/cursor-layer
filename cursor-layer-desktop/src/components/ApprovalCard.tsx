import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { UnifiedApprovalRequest } from '../types/ui';
import { formatTimestamp } from '../utils/formatting';

interface ApprovalCardProps {
  approval: UnifiedApprovalRequest;
  onApprove: (approvalId: string, comment?: string) => Promise<void>;
  onDeny: (approvalId: string, comment: string) => Promise<void>;
}

export default function ApprovalCard({ approval, onApprove, onDeny }: ApprovalCardProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [comment, setComment] = useState('');

  const handleApprove = async () => {
    setIsResolving(true);
    try {
      await onApprove(approval.id, comment || undefined);
      setComment('');
    } catch (error) {
      // Error already handled in hook with toast
    } finally {
      setIsResolving(false);
    }
  };

  const handleDeny = async () => {
    if (!comment.trim()) {
      return; // Validation handled in hook
    }
    setIsResolving(true);
    try {
      await onDeny(approval.id, comment);
      setComment('');
    } catch (error) {
      // Error already handled in hook with toast
    } finally {
      setIsResolving(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    approved: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    denied: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {approval.title}
            </h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${statusColors[approval.status]}`}
            >
              {approval.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTimestamp(approval.createdAt)}</span>
            </div>
            {approval.sessionQuery && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span className="truncate max-w-xs">{approval.sessionQuery}</span>
              </div>
            )}
          </div>
          {approval.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {approval.description}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tool Input:
        </label>
        <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
          {approval.parameters
            ? JSON.stringify(approval.parameters, null, 2)
            : approval.tool || 'N/A'}
        </pre>
      </div>

      {approval.status === 'pending' && (
        <div className="space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment (required for denial)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={isResolving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={handleDeny}
              disabled={isResolving || !comment.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Deny
            </button>
          </div>
        </div>
      )}

      {approval.status !== 'pending' && approval.comment && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Comment:</strong> {approval.comment}
          </p>
          {approval.respondedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Resolved: {formatTimestamp(approval.respondedAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
