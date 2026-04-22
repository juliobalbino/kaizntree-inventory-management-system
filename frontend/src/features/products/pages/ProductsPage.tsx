import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useDisclosure } from '@mantine/hooks';
import { IconPackage } from '@tabler/icons-react';
import { z } from 'zod';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import { useCreateProduct, useProducts } from '../hooks/useProducts';
import type { Product } from '../model/types';

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'L', label: 'L' },
  { value: 'mL', label: 'mL' },
  { value: 'unit', label: 'unit' },
];

const createSchema = z.object({
  name: z.string().min(1, 'Required'),
  sku: z.string().min(1, 'Required'),
  unit: z.enum(['kg', 'g', 'L', 'mL', 'unit'], { error: 'Required' }),
  description: z.string().optional(),
  unit_cost: z.number().min(0, 'Must be 0 or more').nullable().optional(),
  unit_price: z.number().min(0, 'Must be 0 or more').nullable().optional(),
});

type CreateValues = z.infer<typeof createSchema>;



function StockBadge({ qty }: { qty: number }) {
  if (qty <= 0) return <Badge color="red" variant="light" size="sm">Out of stock</Badge>;
  return <Badge color="green" variant="light" size="sm">In stock</Badge>;
}

export function ProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [opened, { open, close }] = useDisclosure();

  const { data: paginated, isLoading } = useProducts({
    page,
    page_size: pageSize,
    search: search || undefined,
    unit: unitFilter || undefined,
    ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
  });
  const createProduct = useCreateProduct();

  const form = useForm<CreateValues>({
    initialValues: { name: '', sku: '', unit: 'unit', description: '', unit_cost: null, unit_price: null },
    validate: zodResolver(createSchema),
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleUnitFilter = (value: string | null) => {
    setUnitFilter(value);
    setPage(1);
  };

  const handleSubmit = form.onSubmit((values) => {
    createProduct.mutate(values, {
      onSuccess: () => {
        close();
        form.reset();
      },
    });
  });

  const products = paginated?.results ?? [];
  const totalCount = paginated?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (p) => (
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size="md" variant="light" color="gray" radius="sm">
            <IconPackage size={14} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={500}>{p.name}</Text>
            {p.description && (
              <Text size="xs" c="dimmed" lineClamp={1} maw={320}>{p.description}</Text>
            )}
          </div>
        </Group>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      sortable: true,
      render: (p) => <Text size="xs" c="dimmed" ff="monospace">{p.sku}</Text>,
    },
    {
      key: 'unit',
      header: 'Unit',
      sortable: true,
      render: (p) => <Badge variant="light" color="gray" size="sm">{p.unit}</Badge>,
    },
    {
      key: 'stock_total',
      header: 'Current Stock',
      sortable: true,
      align: 'right',
      render: (p) => (
        <Text size="sm" fw={500} ff="monospace">
          {Number(p.stock_total ?? 0).toLocaleString()}
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <StockBadge qty={Number(p.stock_total ?? 0)} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description={`Your catalog — ${totalCount} SKUs`}
        action={{ label: 'New Product', onClick: open }}
      />

      <DataTable
        data={products}
        columns={columns}
        totalCount={totalCount}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onSearch={handleSearch}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={(field, dir) => { setSortField(field); setSortDirection(dir); }}
        onRowClick={(p) => navigate(`/products/${p.id}`)}
        rightToolbar={
          <Select
            placeholder="All units"
            data={UNIT_OPTIONS}
            value={unitFilter}
            onChange={handleUnitFilter}
            clearable
            size="sm"
            style={{ width: 140 }}
          />
        }
      />

      <Modal opened={opened} onClose={close} title="New Product">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput label="Name" placeholder="e.g. Habanero Mango Hot Sauce" required {...form.getInputProps('name')} />
            <Group grow>
              <TextInput
                label="SKU"
                placeholder="HS-HMG-150"
                description="Must be unique in your catalog"
                required
                {...form.getInputProps('sku')}
              />
              <Select label="Unit" data={UNIT_OPTIONS} required {...form.getInputProps('unit')} />
            </Group>
            <Textarea
              label="Description"
              placeholder="Short description to show on orders and invoices."
              autosize
              minRows={3}
              {...form.getInputProps('description')}
            />
            <Group grow>
              <NumberInput
                label="Unit Cost"
                placeholder="2.85"
                leftSection="$"
                min={0}
                decimalScale={2}
                {...form.getInputProps('unit_cost')}
              />
              <NumberInput
                label="Unit Price"
                placeholder="9.50"
                leftSection="$"
                min={0}
                decimalScale={2}
                {...form.getInputProps('unit_price')}
              />
            </Group>
            <Group justify="flex-end" mt="xs">
              <Button variant="outline" onClick={close}>Cancel</Button>
              <Button type="submit" loading={createProduct.isPending}>Save</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
