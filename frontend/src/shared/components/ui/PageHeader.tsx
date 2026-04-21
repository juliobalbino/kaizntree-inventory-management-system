import type { ReactNode } from 'react';
import { Box, Button, Group, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface PageHeaderAction {
  label: string;
  onClick: () => void;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: PageHeaderAction;
  actions?: ReactNode;
}

export function PageHeader({ title, description, action, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" mb="xl">
      <Box>
        <Title order={1} style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>
          {title}
        </Title>
        {description && (
          <Text size="sm" c="dimmed" mt={4}>
            {description}
          </Text>
        )}
      </Box>

      <Group gap="xs" style={{ flexShrink: 0 }}>
        {actions}
        {action && (
          <Button leftSection={<IconPlus size={14} />} onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </Group>
    </Group>
  );
}
