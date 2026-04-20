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
  // Nota: Em uma app real, pegaríamos a role do context/query do userLogado
  // Para a configuração inicial, pegamos do localStorage ou mostramos o erro
  const userRole = localStorage.getItem('user_role'); // admin | owner | member

  if (!allowedRoles.includes(userRole || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
