import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Anchor,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useDisclosure } from '@mantine/hooks';
import { z } from 'zod';
import { useDeleteProduct, useProduct, useUpdateProduct } from '../hooks/useProducts';
import { useStockForProduct, useCreateStock, useRemoveStock } from '../../stock/hooks/useStock';
import { useProductFinancials } from '../../financial/hooks/useFinancial';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import type { ProductPayload, ProductUnit } from '../model/types';
import type { StockEntry } from '../../stock/model/types';

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'L', label: 'L' },
  { value: 'mL', label: 'mL' },
  { value: 'unit', label: 'unit' },
];

const editSchema = z.object({
  name: z.string().min(1, 'Required'),
  sku: z.string().min(1, 'Required'),
  unit: z.enum(['kg', 'g', 'L', 'mL', 'unit'], { error: 'Required' }),
  description: z.string().optional(),
  unit_cost: z.number().positive('Must be positive').nullable().optional(),
  unit_price: z.number().positive('Must be positive').nullable().optional(),
});

const SOURCE_COLORS: Record<string, string> = {
  manual: 'gray',
  purchase_order: 'blue',
  sales_order: 'red',
};

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Manual',
  purchase_order: 'Purchase Order',
  sales_order: 'Sales Order',
};

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure();
  const [stockOpened, { open: openStock, close: closeStock }] = useDisclosure();
  const [removeOpened, { open: openRemove, close: closeRemove }] = useDisclosure();
  const [editing, setEditing] = useState(false);

  const { data: product, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct(id!);
  const deleteProduct = useDeleteProduct();

  const [stockPage, setStockPage] = useState(1);
  const [stockPageSize, setStockPageSize] = useState(20);
  const [dateAfter, setDateAfter] = useState('');
  const [dateBefore, setDateBefore] = useState('');
  const [stockSortField, setStockSortField] = useState('created_at');
  const [stockSortDirection, setStockSortDirection] = useState<'asc' | 'desc'>('desc');

  const { data: stockData, isLoading: isLoadingStock } = useStockForProduct(id, {
    page: stockPage,
    page_size: stockPageSize,
    date_after: dateAfter || undefined,
    date_before: dateBefore || undefined,
    ordering: stockSortDirection === 'desc' ? `-${stockSortField}` : stockSortField,
  });

  const createStock = useCreateStock();
  const removeStock = useRemoveStock(id!);
  const { data: productFinancials } = useProductFinancials();

  const form = useForm({
    initialValues: {
      name: '',
      sku: '',
      unit: 'unit' as ProductUnit,
      description: '',
      unit_cost: null as number | null,
      unit_price: null as number | null,
    },
    validate: zodResolver(editSchema),
  });

  const stockForm = useForm({
    initialValues: { quantity: 1 },
    validate: { quantity: (v) => (v > 0 ? null : 'Must be greater than 0') },
  });

  const removeStockForm = useForm({
    initialValues: { quantity: 1 },
    validate: { quantity: (v) => (v > 0 ? null : 'Must be greater than 0') },
  });

  useEffect(() => {
    if (product) {
      form.setValues({
        name: product.name,
        sku: product.sku,
        unit: product.unit,
        description: product.description ?? '',
        unit_cost: product.unit_cost ? Number(product.unit_cost) : null,
        unit_price: product.unit_price ? Number(product.unit_price) : null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const handleSubmit = form.onSubmit((values) => {
    updateProduct.mutate(values as ProductPayload, { onSuccess: () => setEditing(false) });
  });

  const handleDelete = () => {
    deleteProduct.mutate(id!, { onSuccess: () => navigate('/products') });
  };

  const handleAddStock = stockForm.onSubmit((values) => {
    createStock.mutate(
      { product: id!, quantity: values.quantity },
      { onSuccess: closeStock },
    );
  });

  const handleRemoveStock = removeStockForm.onSubmit((values) => {
    if (values.quantity > totalStock) {
      removeStockForm.setFieldError(
        'quantity',
        `Cannot remove ${values.quantity}. Only ${totalStock} ${product?.unit ?? ''} available.`
      );
      return;
    }
    removeStock.mutate(values.quantity, {
      onSuccess: closeRemove,
      onError: (error: unknown) => {
        const msg = isAxiosError(error) ? error.response?.data?.detail : 'Could not remove stock.';
        removeStockForm.setFieldError('quantity', msg ?? 'Could not remove stock.');
      },
    });
  });

  const stockEntries = stockData?.results ?? [];
  const totalStock = Number(product?.stock_total ?? 0);
  const financial = productFinancials?.find((p) => p.product_id === id);

  const stockColumns: Column<StockEntry>[] = [
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (entry) => <Text size="sm" ff="monospace">{formatDate(entry.created_at)}</Text>,
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: (entry) => (
        <Badge variant="light" color={SOURCE_COLORS[entry.source] ?? 'gray'} size="sm">
          {SOURCE_LABELS[entry.source] ?? entry.source}
        </Badge>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (entry) => {
        if (!entry.reference) return <Text size="sm" c="dimmed">—</Text>;
        const short = `#${entry.reference.toString().slice(0, 8).toUpperCase()}`;
        if (entry.source === 'purchase_order') {
          return (
            <Anchor size="sm" ff="monospace" onClick={() => navigate(`/purchases/${entry.reference}`)}>
              {short}
            </Anchor>
          );
        }
        if (entry.source === 'sales_order') {
          return (
            <Anchor size="sm" ff="monospace" onClick={() => navigate(`/sales/${entry.reference}`)}>
              {short}
            </Anchor>
          );
        }
        return <Text size="sm" ff="monospace" c="dimmed">{short}</Text>;
      },
    },
    {
      key: 'quantity',
      header: 'Quantity',
      sortable: true,
      align: 'right',
      render: (entry) => {
        const qty = Number(entry.quantity);
        return (
          <Text size="sm" fw={500} ff="monospace" c={qty >= 0 ? 'green' : 'red'}>
            {qty > 0 ? '+' : ''}{qty} {product?.unit}
          </Text>
        );
      },
    },
  ];

  if (isLoading) return <Text c="dimmed">Loading...</Text>;
  if (!product) return <Text c="dimmed">Product not found.</Text>;

  return (
    <>
      <Stack gap="xs" mb="xl">
        <Breadcrumbs>
          <Anchor size="sm" onClick={() => navigate('/products')}>Products</Anchor>
          <Text size="sm" c="dimmed">{product.sku}</Text>
        </Breadcrumbs>
        <Group justify="space-between" align="center">
          <Title order={2} style={{ fontSize: 22, fontWeight: 600 }}>{product.name}</Title>
          <Group gap="xs">
            <Button variant="default" size="sm" onClick={() => setEditing((v) => !v)}>
              {editing ? 'Cancel Edit' : 'Edit'}
            </Button>
            <Button size="sm" color="red" variant="light" onClick={openRemove} disabled={totalStock <= 0}>
              Remove Stock
            </Button>
            <Button size="sm" onClick={openStock}>Add Stock</Button>
          </Group>
        </Group>
      </Stack>

      <Stack gap="lg">
        <SimpleGrid cols={3}>
          <Card withBorder radius="md" p="lg">
            <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb="sm">Product Info</Text>
            {editing ? (
              <form onSubmit={handleSubmit}>
                <Stack gap="sm">
                  <TextInput label="Name" required size="sm" {...form.getInputProps('name')} />
                  <TextInput label="SKU" required size="sm" {...form.getInputProps('sku')} />
                  <Select label="Unit" data={UNIT_OPTIONS} required size="sm" {...form.getInputProps('unit')} />
                  <Textarea label="Description" autosize minRows={2} size="sm" {...form.getInputProps('description')} />
                  <Group grow>
                    <NumberInput
                      label="Unit Cost"
                      leftSection="$"
                      min={0}
                      decimalScale={2}
                      size="sm"
                      {...form.getInputProps('unit_cost')}
                    />
                    <NumberInput
                      label="Unit Price"
                      leftSection="$"
                      min={0}
                      decimalScale={2}
                      size="sm"
                      {...form.getInputProps('unit_price')}
                    />
                  </Group>
                  <Group justify="flex-end" mt="xs">
                    <Button color="red" variant="subtle" size="xs" onClick={openDelete}>Delete</Button>
                    <Button type="submit" size="xs" loading={updateProduct.isPending}>Save</Button>
                  </Group>
                </Stack>
              </form>
            ) : (
              <Stack gap="sm">
                {product.description && (
                  <Text size="sm" c="dimmed">{product.description}</Text>
                )}
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">SKU</Text>
                  <Text size="sm" ff="monospace">{product.sku}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Unit</Text>
                  <Badge variant="light" color="gray" size="sm">{product.unit}</Badge>
                </Group>
                {product.unit_cost != null && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Unit Cost</Text>
                    <Text size="sm" ff="monospace">{formatCurrency(product.unit_cost)}</Text>
                  </Group>
                )}
                {product.unit_price != null && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Unit Price</Text>
                    <Text size="sm" ff="monospace" fw={500}>{formatCurrency(product.unit_price)}</Text>
                  </Group>
                )}
              </Stack>
            )}
          </Card>

          <Card withBorder radius="md" p="lg">
            <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb="sm">Current Stock</Text>
            <Group align="baseline" gap="xs">
              <Text size="xl" fw={700} ff="monospace" style={{ fontSize: 28 }}>
                {totalStock.toLocaleString()}
              </Text>
              <Text size="sm" c="dimmed">{product.unit}</Text>
            </Group>
            <Badge
              mt="xs"
              color={totalStock <= 0 ? 'red' : 'green'}
              variant="light"
            >
              {totalStock <= 0 ? 'Out of stock' : 'In stock'}
            </Badge>
            <Divider mt="md" mb="md" />
            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">Manual entries</Text>
                <Text size="xs" ff="monospace">
                  {stockEntries.filter((e) => e.source === 'manual').reduce((s, e) => s + Number(e.quantity), 0)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">From purchases</Text>
                <Text size="xs" ff="monospace">
                  {stockEntries.filter((e) => e.source === 'purchase_order').reduce((s, e) => s + Number(e.quantity), 0)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">From sales</Text>
                <Text size="xs" ff="monospace" c="red">
                  {stockEntries.filter((e) => e.source === 'sales_order').reduce((s, e) => s + Number(e.quantity), 0)}
                </Text>
              </Group>
            </Stack>
          </Card>

          <Card withBorder radius="md" p="lg">
            <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb="sm">Financials</Text>
            {financial ? (
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Revenue</Text>
                  <Text size="sm" fw={500} ff="monospace">{formatCurrency(financial.total_revenue)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Cost</Text>
                  <Text size="sm" ff="monospace">{formatCurrency(financial.total_cost)}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Profit</Text>
                  <Text
                    size="sm" fw={700} ff="monospace"
                    c={Number(financial.profit) >= 0 ? 'green' : 'red'}
                  >
                    {Number(financial.profit) >= 0 ? '+' : ''}{formatCurrency(financial.profit)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Margin</Text>
                  <Text
                    size="sm" fw={700} ff="monospace"
                    c={Number(financial.margin) >= 0 ? 'green' : 'red'}
                  >
                    {Number(financial.margin).toFixed(0)}%
                  </Text>
                </Group>
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">No confirmed orders yet.</Text>
            )}
          </Card>
        </SimpleGrid>

        <DataTable
          data={stockEntries}
          columns={stockColumns}
          totalCount={stockData?.count ?? 0}
          isLoading={isLoadingStock}
          page={stockPage}
          pageSize={stockPageSize}
          totalPages={Math.ceil((stockData?.count ?? 0) / stockPageSize)}
          onPageChange={setStockPage}
          onPageSizeChange={(size) => { setStockPageSize(size); setStockPage(1); }}
          hideSearch
          rightToolbar={
            <>
              <TextInput
                type="date"
                label="From"
                size="sm"
                value={dateAfter}
                onChange={(e) => { setDateAfter(e.currentTarget.value); setStockPage(1); }}
                style={{ width: 160 }}
              />
              <TextInput
                type="date"
                label="To"
                size="sm"
                value={dateBefore}
                onChange={(e) => { setDateBefore(e.currentTarget.value); setStockPage(1); }}
                style={{ width: 160 }}
              />
            </>
          }
          sortField={stockSortField}
          sortDirection={stockSortDirection}
          onSortChange={(field, dir) => { setStockSortField(field); setStockSortDirection(dir); }}
          emptyStateMessage="No stock entries yet."
        />
      </Stack>

      <Modal opened={deleteOpened} onClose={closeDelete} title="Delete Product">
        <Text>Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={closeDelete}>Cancel</Button>
          <Button color="red" loading={deleteProduct.isPending} onClick={handleDelete}>Delete</Button>
        </Group>
      </Modal>

      <Modal opened={stockOpened} onClose={closeStock} title="Add Stock">
        <form onSubmit={handleAddStock}>
          <Stack>
            <NumberInput
              label={`Quantity (${product.unit})`}
              min={0.001}
              step={1}
              decimalScale={3}
              required
              {...stockForm.getInputProps('quantity')}
            />
            <Group justify="flex-end">
              <Button variant="outline" onClick={closeStock}>Cancel</Button>
              <Button type="submit" loading={createStock.isPending}>Add</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={removeOpened} onClose={closeRemove} title="Remove Stock">
        <form onSubmit={handleRemoveStock}>
          <Stack>
            <Text size="sm" c="dimmed">
              Current stock: <strong>{totalStock.toLocaleString()} {product.unit}</strong>
            </Text>
            <NumberInput
              label={`Quantity to remove (${product.unit})`}
              description={`Available: ${totalStock} ${product.unit}`}
              min={0.001}
              step={1}
              decimalScale={3}
              required
              {...removeStockForm.getInputProps('quantity')}
            />
            <Group justify="flex-end">
              <Button variant="outline" onClick={closeRemove}>Cancel</Button>
              <Button type="submit" color="red" loading={removeStock.isPending}>Remove</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
