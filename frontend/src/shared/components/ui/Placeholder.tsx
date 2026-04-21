import { Title, Text, Stack } from '@mantine/core';

interface PlaceholderProps {
  title: string;
}

export function Placeholder({ title }: PlaceholderProps) {
  return (
    <Stack gap="xs">
      <Title order={2}>{title}</Title>
      <Text c="dimmed">Page under construction...</Text>
    </Stack>
  );
}
