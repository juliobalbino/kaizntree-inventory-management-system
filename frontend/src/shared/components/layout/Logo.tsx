import { Group, Image } from '@mantine/core';
import logoUrl from '../../../assets/logo.png';

export function Logo() {
  return (
    <Group gap={8} align="center" style={{ flexShrink: 0 }}>
      <Image src={logoUrl} h={40} w="auto" fit="contain" alt="IM Logo" />
    </Group>
  );
}
