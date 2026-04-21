import type { ReactNode, ComponentType } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBuilding,
  IconLayoutDashboard,
  IconLogout,
  IconPackage,
  IconSettings,
  IconShoppingCart,
  IconTag,
  IconTruck,
  IconUser,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Logo } from './Logo';
import { useCurrentUser, useLogout } from '../../features/auth/hooks';

interface NavItemProps {
  icon: ComponentType<{ size?: number; stroke?: number }>;
  label: string;
  to: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, to, active, onClick }: NavItemProps) {
  return (
    <NavLink
      component={Link}
      to={to}
      label={label}
      leftSection={<Icon size={17} stroke={1.8} />}
      active={active}
      onClick={onClick}
      styles={{ root: { borderRadius: 6, fontWeight: 500, fontSize: 14 } }}
    />
  );
}

function SectionLabel({ children, mt }: { children: ReactNode; mt?: string | number }) {
  return (
    <Text
      size="xs"
      fw={600}
      c="dimmed"
      tt="uppercase"
      px={12}
      pb={4}
      mt={mt}
      style={{ letterSpacing: '0.1em' }}
    >
      {children}
    </Text>
  );
}

export function Layout() {
  const [opened, { close }] = useDisclosure();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const location = useLocation();

  const role = user?.role;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  return (
    <AppShell
      navbar={{ width: 232, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding={0}
    >
      <AppShell.Navbar style={{ display: 'flex', flexDirection: 'column' }}>
        <Group
          p="lg"
          style={{ borderBottom: '1px solid var(--mantine-color-gray-2)', flexShrink: 0 }}
        >
          <Logo />
        </Group>

        <ScrollArea flex={1} p="sm" type="never">
          <Stack gap={2}>
            {role === 'admin' ? (
              <>
                <SectionLabel>Admin</SectionLabel>
                <NavItem
                  icon={IconBuilding}
                  label="Organizations"
                  to="/admin/organizations"
                  active={isActive('/admin/organizations')}
                  onClick={close}
                />
                <NavItem
                  icon={IconUser}
                  label="Users"
                  to="/admin/users"
                  active={isActive('/admin/users')}
                  onClick={close}
                />
              </>
            ) : (
              <>
                <SectionLabel>Workspace</SectionLabel>
                <NavItem icon={IconLayoutDashboard} label="Dashboard" to="/dashboard" active={isActive('/dashboard')} onClick={close} />
                <NavItem icon={IconPackage} label="Products" to="/products" active={isActive('/products')} onClick={close} />
                <NavItem icon={IconTruck} label="Suppliers" to="/suppliers" active={isActive('/suppliers')} onClick={close} />
                <NavItem icon={IconUsers} label="Customers" to="/customers" active={isActive('/customers')} onClick={close} />
                <NavItem icon={IconShoppingCart} label="Purchases" to="/purchases" active={isActive('/purchases')} onClick={close} />
                <NavItem icon={IconTag} label="Sales" to="/sales" active={isActive('/sales')} onClick={close} />

                {role === 'owner' && (
                  <>
                    <SectionLabel mt="lg">Settings</SectionLabel>
                    <NavItem icon={IconUsersGroup} label="Members" to="/settings/members" active={isActive('/settings/members')} onClick={close} />
                    <NavItem icon={IconBuilding} label="Organization" to="/settings/organization" active={isActive('/settings/organization')} onClick={close} />
                  </>
                )}
              </>
            )}

            <SectionLabel mt="lg">Account</SectionLabel>
            <NavItem
              icon={IconSettings}
              label="Profile"
              to="/settings/profile"
              active={isActive('/settings/profile')}
              onClick={close}
            />
          </Stack>
        </ScrollArea>

        <Group
          p="sm"
          gap="sm"
          style={{ borderTop: '1px solid var(--mantine-color-gray-2)', flexShrink: 0 }}
        >
          <Avatar size={32} radius="xl" color="grape" variant="filled">
            {initials}
          </Avatar>
          <Box flex={1} style={{ overflow: 'hidden', minWidth: 0 }}>
            <Text size="sm" fw={500} truncate>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {user?.current_organization?.name ?? 'No organization'}
            </Text>
          </Box>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={logout} title="Log out">
            <IconLogout size={16} />
          </ActionIcon>
        </Group>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: 'var(--mantine-color-gray-0)' }}>
        <Box maw={1200} mx="auto" px="xl" py="xl">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
