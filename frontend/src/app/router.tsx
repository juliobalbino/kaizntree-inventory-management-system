import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../shared/components/layout/AppShell';
import { ProtectedRoute, RoleRoute } from '../shared/components/layout/ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ProfilePage } from '../features/auth/pages/ProfilePage';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { AdminOrganizationsPage } from '../features/admin/pages/AdminOrganizationsPage';
import { MembersPage } from '../features/members/pages/MembersPage';
import { OrganizationSettingsPage } from '../features/organizations/pages/OrganizationSettingsPage';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { ProductDetailPage } from '../features/products/pages/ProductDetailPage';
import { SuppliersPage } from '../features/suppliers/pages/SuppliersPage';

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
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },

          { path: 'dashboard', element: <Placeholder title="Dashboard" /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'products/:id', element: <ProductDetailPage /> },
          { path: 'suppliers', element: <SuppliersPage /> },
          { path: 'customers', element: <Placeholder title="Customers" /> },
          { path: 'purchases', element: <Placeholder title="Purchases" /> },
          { path: 'purchases/new', element: <Placeholder title="New Purchase Order" /> },
          { path: 'sales', element: <Placeholder title="Sales" /> },
          { path: 'sales/new', element: <Placeholder title="New Sales Order" /> },

          {
            path: 'admin',
            element: <RoleRoute allowedRoles={['admin']} />,
            children: [
              { path: 'organizations', element: <AdminOrganizationsPage /> },
              { path: 'users', element: <AdminUsersPage /> },
            ],
          },

          { path: 'settings/profile', element: <ProfilePage /> },
          {
            path: 'settings',
            element: <RoleRoute allowedRoles={['owner']} />,
            children: [
              { path: 'members', element: <MembersPage /> },
              { path: 'organization', element: <OrganizationSettingsPage /> },
            ],
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
