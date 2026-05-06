import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../ui/LoadingSpinner';
import { LogIn, UserPlus, Lock } from 'lucide-react';

function LoginWall() {
  const location = useLocation();
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <section className="max-w-sm w-full text-center">
        <section className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </section>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Sign in to continue
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          This page is for registered travelers. Create a free account or sign in to access it.
        </p>
        <section className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/register"
            state={{ from: location.pathname }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Create Free Account
          </Link>
          <Link
            to="/login"
            state={{ from: location.pathname }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </section>
      </section>
    </section>
  );
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <LoginWall />;
  return children;
}