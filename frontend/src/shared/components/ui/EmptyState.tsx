import type { ComponentType } from 'react';
import { Box, Button, Stack, Text } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

interface EmptyStateProps {
  icon?: ComponentType<{ size?: number; stroke?: number }>;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon = IconInbox,
  title,
  message = 'No items found.',
  action,
}: EmptyStateProps) {
  return (
    <Stack align="center" py={64} px="md" gap="sm">
      <Box
        w={48}
        h={48}
        style={{
          borderRadius: '50%',
          background: 'var(--mantine-color-gray-1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--mantine-color-gray-6)',
        }}
      >
        <Icon size={22} stroke={1.6} />
      </Box>
      {title && (
        <Text size="md" fw={600}>
          {title}
        </Text>
      )}
      <Text size="sm" c="dimmed" ta="center" maw={384}>
        {message}
      </Text>
      {action && (
        <Button mt={4} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Stack>
  );
}
