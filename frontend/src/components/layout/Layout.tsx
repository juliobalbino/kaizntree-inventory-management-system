import { Outlet } from 'react-router-dom';
import { AppShell, Burger, Group, Text, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const userRole = localStorage.getItem('user_role');

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
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
        {/* Links dinâmicos por Role */}
        {userRole === 'admin' ? (
          <>
            <NavLink label="Organizations" href="/admin/organizations" />
            <NavLink label="Users" href="/admin/users" />
          </>
        ) : (
          <>
            <NavLink label="Dashboard" href="/dashboard" />
            <NavLink label="Products" href="/products" />
            <NavLink label="Suppliers" href="/suppliers" />
            <NavLink label="Customers" href="/customers" />
            <NavLink label="Purchases" href="/purchases" />
            <NavLink label="Sales" href="/sales" />
          </>
        )}
        <div style={{ marginTop: 'auto' }}>
          <NavLink label="Profile" href="/settings/profile" />
          <NavLink 
            label="Logout" 
            color="red" 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }} 
          />
        </div>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
