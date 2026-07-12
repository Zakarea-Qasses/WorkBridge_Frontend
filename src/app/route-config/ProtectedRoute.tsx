import { Navigate, useLocation } from 'react-router';
import { AppLoader } from '@/app/components/shared';
import {
  getAccountStatusPath,
  getDashboardPathForUser,
  useAuth,
} from '@/app/providers/AuthProvider';
import type { WorkBridgeUser } from '@/app/api/pages/auth/session';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: WorkBridgeUser['role'][];
  allowAccountStatus?: boolean;
}

export function ProtectedRoute({
  children,
  roles,
  allowAccountStatus = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { initializing, token, user, isEmailVerified } = useAuth();

  if (initializing) {
    return <AppLoader />;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  const statusPath = getAccountStatusPath(user);
  if (!allowAccountStatus && statusPath) {
    return <Navigate to={statusPath} replace />;
  }

  if (roles?.length && (!user || !roles.includes(user.role))) {
    return (
      <Navigate
        to={getDashboardPathForUser(user)}
        state={{ message: 'ليس لديك صلاحية للوصول إلى هذه الصفحة' }}
        replace
      />
    );
  }

  return children;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { initializing, token, user, isEmailVerified } = useAuth();

  if (initializing) {
    return <AppLoader />;
  }

  if (!token || !user) {
    return children;
  }

  if (!isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (token && user) {
    const statusPath = getAccountStatusPath(user);
    return <Navigate to={statusPath || getDashboardPathForUser(user)} replace />;
  }

  return children;
}

export function RoleRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: WorkBridgeUser['role'][];
}) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}
