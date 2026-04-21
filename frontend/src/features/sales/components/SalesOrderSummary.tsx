import { Badge, Card, Divider, Group, Stack, Table, Text, Title } from '@mantine/core';
import { formatCurrency, formatDate } from '../../../lib/utils';
import type { SalesOrder } from '../model/types';

interface SalesOrderSummaryProps {
  order: SalesOrder;
  title?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'yellow',
  confirmed: 'green',
  cancelled: 'red',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

export function SalesOrderSummary({ order, title = 'Order Summary' }: SalesOrderSummaryProps) {
  const orderTotal = order.items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
    0,
  );

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={5}>{title}</Title>
          <Badge color={STATUS_COLORS[order.status]} variant="light">
            {STATUS_LABELS[order.status]}
          </Badge>
        </Group>
        <Divider />

        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Order #</Text>
            <Text size="sm" ff="monospace">#{order.id.slice(0, 8).toUpperCase()}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Customer</Text>
            <Text size="sm">{order.customer?.name ?? '—'}</Text>
          </Group>
          {order.created_by && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Created by</Text>
              <Text size="sm">{order.created_by.first_name || order.created_by.email}</Text>
            </Group>
          )}
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Date</Text>
            <Text size="sm">{formatDate(order.created_at)}</Text>
          </Group>
        </Stack>

        {order.notes && (
          <>
            <Divider />
            <Stack gap={4}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">Notes</Text>
              <Text size="sm">{order.notes}</Text>
            </Stack>
          </>
        )}

        <Divider />
        <Table verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Product</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Qty</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Unit Price</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {order.items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>{item.product.name}</Text>
                  <Text size="xs" c="dimmed" ff="monospace">{item.product.sku}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text size="sm" ff="monospace">{Number(item.quantity)} {item.product.unit}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text size="sm" ff="monospace">{formatCurrency(item.unit_price)}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text size="sm" fw={500} ff="monospace">
                    {formatCurrency(Number(item.quantity) * Number(item.unit_price))}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Divider />
        <Group justify="space-between">
          <Text fw={600}>Total Revenue</Text>
          <Text fw={700} ff="monospace" size="lg">{formatCurrency(orderTotal)}</Text>
        </Group>
      </Stack>
    </Card>
  );
}
