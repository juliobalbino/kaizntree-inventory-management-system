import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Center,
  Group,
  Pagination,
  Table,
  Text,
} from '@mantine/core';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { usePurchaseOrders } from '../hooks/usePurchases';
import { formatDate } from '../../../lib/utils';
import type { PurchaseOrder } from '../model/types';

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<string, string> = {
  pending: 'yellow',
  confirmed: 'green',
};

export function PurchasesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: paginated, isLoading } = usePurchaseOrders({ page, page_size: PAGE_SIZE });

  const orders = paginated?.results ?? [];
  const totalCount = paginated?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Purchase Orders"
        description="Manage incoming stock from suppliers."
        action={{ label: 'New Order', onClick: () => navigate('/purchases/new') }}
      />

      <Card shadow="sm" radius="md" withBorder padding={0}>
        <Card.Section>
          {isLoading ? (
            <Center p="xl"><Text c="dimmed">Loading...</Text></Center>
          ) : orders.length === 0 ? (
            <Center p="xl"><Text c="dimmed">No purchase orders yet.</Text></Center>
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order #</Table.Th>
                  <Table.Th>Supplier</Table.Th>
                  <Table.Th>Items</Table.Th>
                  <Table.Th>Created by</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th style={{ width: 140 }} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {orders.map((order: PurchaseOrder) => (
                  <Table.Tr key={order.id}>
                    <Table.Td>
                      <Text size="sm" ff="monospace" c="dimmed">
                        #{order.id.slice(0, 8)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{order.supplier?.name ?? '—'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {order.created_by
                          ? `${order.created_by.first_name || order.created_by.email}`
                          : '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(order.created_at)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={STATUS_COLORS[order.status] ?? 'gray'}
                        variant="light"
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <Button
                          size="xs"
                          variant="default"
                          onClick={() => navigate(`/purchases/${order.id}`)}
                        >
                          View
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card.Section>

        {totalPages > 1 && (
          <Card.Section withBorder p="sm">
            <Group justify="flex-end">
              <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
            </Group>
          </Card.Section>
        )}
      </Card>
    </>
  );
}
