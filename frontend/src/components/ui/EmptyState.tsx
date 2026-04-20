import { Stack, Text } from '@mantine/core';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No items found.' }: EmptyStateProps) {
  return (
    <Stack align="center" py="xl" gap="sm">
      <Text size="xl">📭</Text>
      <Text c="dimmed">{message}</Text>
    </Stack>
  );
}
