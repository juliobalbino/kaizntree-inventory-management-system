import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

interface RoleRouteProps {
  allowedRoles: string[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const userRole = localStorage.getItem('user_role');

  if (!allowedRoles.includes(userRole || '')) {
    if (userRole === 'admin') {
      return <Navigate to="/admin/organizations" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
