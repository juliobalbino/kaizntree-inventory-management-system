import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Group,
  Pagination,
  Select,
  Table,
  TextInput,
  UnstyledButton,
  Center,
  Text,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  totalCount: number;
  isLoading: boolean;
  page: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  emptyStateMessage?: string;
  totalPages: number;
  rightToolbar?: React.ReactNode;
  hideSearch?: boolean;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  totalCount,
  isLoading,
  page,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  onSearch,
  searchPlaceholder = 'Search...',
  sortField,
  sortDirection,
  onSortChange,
  emptyStateMessage = 'No records found.',
  totalPages,
  rightToolbar,
  hideSearch = false,
  onRowClick,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    onSearchRef.current?.(debouncedSearch);
  }, [debouncedSearch]);

  const handleSort = (field: string) => {
    if (!onSortChange) return;
    if (sortField === field) {
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  const Th = ({ children, reversed, sorted, onSort, sortable, align }: any) => {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
    return (
      <Table.Th style={{ textAlign: align ?? 'left' }}>
        {sortable ? (
          <UnstyledButton onClick={onSort} style={{ width: '100%', padding: '8px 0' }}>
            <Group justify={align === 'right' ? 'flex-end' : 'space-between'} wrap="nowrap">
              <Text fw={600} size="sm">{children}</Text>
              <Center>
                <Icon size={14} stroke={1.5} />
              </Center>
            </Group>
          </UnstyledButton>
        ) : (
          <Text fw={600} size="sm" style={{ padding: '8px 0' }}>
            {children}
          </Text>
        )}
      </Table.Th>
    );
  };

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      {(!hideSearch || rightToolbar) && (
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            {!hideSearch && (
              <TextInput
                placeholder={searchPlaceholder}
                leftSection={<IconSearch size={16} />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.currentTarget.value)}
                style={{ width: 280 }}
              />
            )}
            {rightToolbar && <Group gap="sm">{rightToolbar}</Group>}
          </Group>
        </Card.Section>
      )}

      <Card.Section>
        {isLoading ? (
          <Center p="xl">
            <Text c="dimmed">Loading...</Text>
          </Center>
        ) : data.length === 0 ? (
          <EmptyState message={emptyStateMessage} />
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {columns.map((col) => (
                  <Th
                    key={col.key}
                    sorted={sortField === col.key}
                    reversed={sortDirection === 'asc'}
                    onSort={() => handleSort(col.key)}
                    sortable={col.sortable}
                    align={col.align}
                  >
                    {col.header}
                  </Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((item) => (
                <Table.Tr
                  key={item.id}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  style={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {columns.map((col) => (
                    <Table.Td key={`${item.id}-${col.key}`} style={{ textAlign: col.align ?? 'left' }}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card.Section>

      {totalPages > 0 && (
        <Card.Section withBorder inheritPadding py="sm">
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Total items: {totalCount}
            </Text>
            <Group>
              <Text size="sm">Items per page:</Text>
              <Select
                data={['20', '50', '100']}
                value={pageSize.toString()}
                onChange={(val) => onPageSizeChange?.(Number(val))}
                style={{ width: 80 }}
                size="sm"
              />
              <Pagination total={totalPages} value={page} onChange={onPageChange} />
            </Group>
          </Group>
        </Card.Section>
      )}
    </Card>
  );
}
