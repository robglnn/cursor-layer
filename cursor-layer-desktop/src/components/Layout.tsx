import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, History } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cursor Layer
          </h1>
        </div>
        <nav className="px-4 space-y-2">
          <Link
            to="/approvals"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/approvals' || location.pathname === '/'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Approvals</span>
          </Link>
          <Link
            to="/sessions"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/sessions'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <History className="w-5 h-5" />
            <span>Sessions</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

