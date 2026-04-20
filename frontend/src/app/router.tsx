import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute, RoleRoute } from '../components/layout/RouteGuards';
import { LoginPage } from '../pages/login/LoginPage';

const Placeholder = ({ title }: { title: string }) => (
  <div>
    <h1>{title}</h1>
    <p>Página em construção...</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },

          { path: 'dashboard', element: <Placeholder title="Dashboard" /> },
          { path: 'products', element: <Placeholder title="Products" /> },
          { path: 'suppliers', element: <Placeholder title="Suppliers" /> },
          { path: 'customers', element: <Placeholder title="Customers" /> },
          { path: 'purchases', element: <Placeholder title="Purchases" /> },
          { path: 'sales', element: <Placeholder title="Sales" /> },

          {
            path: 'admin',
            element: <RoleRoute allowedRoles={['admin']} />,
            children: [
              { path: 'organizations', element: <Placeholder title="Admin: Organizations" /> },
              { path: 'users', element: <Placeholder title="Admin: Users" /> },
            ],
          },

          { path: 'settings/profile', element: <Placeholder title="Profile" /> },
          {
            path: 'settings/members',
            element: <RoleRoute allowedRoles={['owner']} />,
            children: [{ index: true, element: <Placeholder title="Manage Members" /> }]
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
