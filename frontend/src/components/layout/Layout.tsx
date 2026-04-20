import { Outlet, Link, useLocation } from 'react-router-dom';
import { AppShell, Burger, Group, Text, NavLink, Stack, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useCurrentUser, useLogout } from '../../features/auth/hooks';

export function Layout() {
  const [opened, { toggle, close }] = useDisclosure();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const location = useLocation();

  const role = user?.role;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleNavClick = () => close();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text size="xl" fw={700}>Kaizntree</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack justify="space-between" h="100%">
          <Stack gap={4}>
            {role === 'admin' ? (
              <>
                <NavLink
                  component={Link}
                  to="/admin/organizations"
                  label="Organizations"
                  active={isActive('/admin/organizations')}
                  onClick={handleNavClick}
                />
                <NavLink
                  component={Link}
                  to="/admin/users"
                  label="Users"
                  active={isActive('/admin/users')}
                  onClick={handleNavClick}
                />
              </>
            ) : (
              <>
                <NavLink
                  component={Link}
                  to="/dashboard"
                  label="Dashboard"
                  active={isActive('/dashboard')}
                  onClick={handleNavClick}
                />
                <NavLink
                  component={Link}
                  to="/products"
                  label="Products"
                  active={isActive('/products')}
                  onClick={handleNavClick}
                />
                <NavLink
                  component={Link}
                  to="/suppliers"
                  label="Suppliers"
                  active={isActive('/suppliers')}
                  onClick={handleNavClick}
                />
                <NavLink
                  component={Link}
                  to="/customers"
                  label="Customers"
                  active={isActive('/customers')}
                  onClick={handleNavClick}
                />
                <NavLink
                  component={Link}
                  to="/purchases"
                  label="Purchases"
                  active={isActive('/purchases')}
                  onClick={handleNavClick}
                />
                <NavLink
                  component={Link}
                  to="/sales"
                  label="Sales"
                  active={isActive('/sales')}
                  onClick={handleNavClick}
                />
                {role === 'owner' && (
                  <>
                    <Divider my="xs" />
                    <NavLink
                      component={Link}
                      to="/settings/members"
                      label="Members"
                      active={isActive('/settings/members')}
                      onClick={handleNavClick}
                    />
                    <NavLink
                      component={Link}
                      to="/settings/organization"
                      label="Organization"
                      active={isActive('/settings/organization')}
                      onClick={handleNavClick}
                    />
                  </>
                )}
              </>
            )}
          </Stack>

          <Stack gap={4}>
            <Divider my="xs" />
            <NavLink
              component={Link}
              to="/settings/profile"
              label="Profile"
              active={isActive('/settings/profile')}
              onClick={handleNavClick}
            />
            <NavLink
              label="Logout"
              c="red"
              onClick={logout}
            />
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
