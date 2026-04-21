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
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import { PurchasesPage } from '../features/purchases/pages/PurchasesPage';
import { CreatePurchasePage } from '../features/purchases/pages/CreatePurchasePage';
import { PurchaseOrderDetailPage } from '../features/purchases/pages/PurchaseOrderDetailPage';
import { SalesPage } from '../features/sales/pages/SalesPage';
import { CreateSalePage } from '../features/sales/pages/CreateSalePage';
import { SalesOrderDetailPage } from '../features/sales/pages/SalesOrderDetailPage';

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
          { path: 'customers', element: <CustomersPage /> },
          { path: 'purchases', element: <PurchasesPage /> },
          { path: 'purchases/new', element: <CreatePurchasePage /> },
          { path: 'purchases/:id', element: <PurchaseOrderDetailPage /> },
          { path: 'sales', element: <SalesPage /> },
          { path: 'sales/new', element: <CreateSalePage /> },
          { path: 'sales/:id', element: <SalesOrderDetailPage /> },

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
