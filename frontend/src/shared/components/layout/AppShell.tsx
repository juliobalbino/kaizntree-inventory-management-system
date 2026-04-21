import { Outlet } from 'react-router-dom';
import { AppShell as MantineAppShell, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navbar } from './Navbar';

export function AppShell() {
  const [opened, { close }] = useDisclosure();

  return (
    <MantineAppShell
      navbar={{ width: 232, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding={0}
    >
      <Navbar close={close} />

      <MantineAppShell.Main style={{ background: 'var(--mantine-color-gray-0)' }}>
        <Box maw={1200} mx="auto" px="xl" py="xl">
          <Outlet />
        </Box>
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
