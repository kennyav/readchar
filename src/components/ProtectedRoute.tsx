import { Navigate, useLocation } from 'react-router-dom';
import { isAuthEnabled } from '@/lib/supabase';
import { useAuthOptional } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * When auth is enabled (Supabase env vars set), redirects to /login if not signed in.
 * When auth is disabled, renders children.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAuthOptional();
  const location = useLocation();

  if (!isAuthEnabled) return <>{children}</>;
  if (auth?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-game text-xl text-[#6C6C70]">Loading...</div>
      </div>
    );
  }
  if (!auth?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
