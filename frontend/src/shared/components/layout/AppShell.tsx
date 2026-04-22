import { Outlet } from 'react-router-dom';
import { AppShell as MantineAppShell, Box, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navbar } from './Navbar';
import { Logo } from './Logo';

export function AppShell() {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <MantineAppShell
      header={{ height: { base: 60, sm: 0 } }}
      navbar={{ width: 232, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding={0}
    >
      <MantineAppShell.Header hiddenFrom="sm">
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} size="sm" />
          <Logo />
        </Group>
      </MantineAppShell.Header>

      <Navbar close={close} />

      <MantineAppShell.Main style={{ background: 'var(--mantine-color-gray-0)' }}>
        <Box maw={1200} mx="auto" px="xl" py="xl">
          <Outlet />
        </Box>
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
