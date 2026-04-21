import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Group, Select, Text, TextInput } from '@mantine/core';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import { useSalesOrders } from '../hooks/useSales';
import { formatDate } from '../../../lib/utils';
import type { SalesOrder } from '../model/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'yellow',
  confirmed: 'green',
  cancelled: 'red',
};

export function SalesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [status, setStatus] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: paginated, isLoading } = useSalesOrders({
    page,
    page_size: pageSize,
    search: search || undefined,
    ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
    status: status || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const columns: Column<SalesOrder>[] = [
    {
      key: 'id',
      header: 'Order #',
      sortable: true,
      render: (order) => (
        <Text size="sm" ff="monospace" c="dimmed">
          #{order.id.slice(0, 8).toUpperCase()}
        </Text>
      ),
    },
    {
      key: 'customer__name',
      header: 'Customer',
      sortable: true,
      render: (order) => <Text size="sm">{order.customer?.name ?? '—'}</Text>,
    },
    {
      key: 'items',
      header: 'Items',
      render: (order) => (
        <Text size="sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Text>
      ),
    },
    {
      key: 'created_by',
      header: 'Created by',
      render: (order) => (
        <Text size="sm" c="dimmed">
          {order.created_by ? (order.created_by.first_name || order.created_by.email) : '—'}
        </Text>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (order) => <Text size="sm">{formatDate(order.created_at)}</Text>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (order) => (
        <Badge color={STATUS_COLORS[order.status] ?? 'gray'} variant="light" size="sm">
          {order.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (order) => (
        <Group gap="xs" justify="flex-end">
          <Button
            size="xs"
            variant="default"
            onClick={(e) => { e.stopPropagation(); navigate(`/sales/${order.id}`); }}
          >
            View
          </Button>
        </Group>
      ),
    },
  ];

  const filters = (
    <Group gap="xs">
      <Select
        placeholder="Status"
        data={[
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
        value={status}
        onChange={(val) => { setStatus(val); setPage(1); }}
        clearable
        size="xs"
        style={{ width: 120 }}
      />
      <Group gap={4}>
        <Text size="xs" c="dimmed">From:</Text>
        <TextInput
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.currentTarget.value); setPage(1); }}
          size="xs"
          style={{ width: 130 }}
        />
      </Group>
      <Group gap={4}>
        <Text size="xs" c="dimmed">To:</Text>
        <TextInput
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.currentTarget.value); setPage(1); }}
          size="xs"
          style={{ width: 130 }}
        />
      </Group>
    </Group>
  );

  return (
    <>
      <PageHeader
        title="Sales Orders"
        description="Manage outgoing stock to customers."
        action={{ label: 'New Order', onClick: () => navigate('/sales/new') }}
      />

      <DataTable
        data={paginated?.results ?? []}
        columns={columns}
        totalCount={paginated?.count ?? 0}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={Math.ceil((paginated?.count ?? 0) / pageSize)}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onSearch={(s) => { setSearch(s); setPage(1); }}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={(field, dir) => { setSortField(field); setSortDirection(dir); }}
        searchPlaceholder="Order #, Customer..."
        rightToolbar={filters}
        onRowClick={(order) => navigate(`/sales/${order.id}`)}
      />
    </>
  );
}
