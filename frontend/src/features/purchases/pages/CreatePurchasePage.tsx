import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { IconPlus, IconTrash, IconCheck } from '@tabler/icons-react';
import { useCreatePurchaseOrder, useConfirmPurchaseOrder } from '../hooks/usePurchases';
import { useSuppliers } from '../../suppliers/hooks/useSuppliers';
import { useProducts } from '../../products/hooks/useProducts';
import { formatCurrency } from '../../../lib/utils';
import type { PurchaseOrder } from '../model/types';
import { PurchaseOrderSummary } from '../components/PurchaseOrderSummary';

interface ItemRow {
  product: string;
  quantity: number | string;
  unit_cost: number | string;
}

const emptyItem = (): ItemRow => ({ product: '', quantity: '', unit_cost: '' });

function itemTotal(item: ItemRow): number {
  const qty = Number(item.quantity);
  const cost = Number(item.unit_cost);
  return isNaN(qty) || isNaN(cost) ? 0 : qty * cost;
}

export function CreatePurchasePage() {
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemRow[]>([emptyItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdOrder, setCreatedOrder] = useState<PurchaseOrder | null>(null);

  const { data: suppliersData } = useSuppliers({ page_size: 100 });
  const { data: productsData } = useProducts({ page_size: 100 });
  const createOrder = useCreatePurchaseOrder();
  const confirmOrder = useConfirmPurchaseOrder();

  const supplierOptions = (suppliersData?.results ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const productOptions = (productsData?.results ?? []).map((p) => ({
    value: p.id,
    label: `${p.name} (${p.sku})`,
  }));

  const handleProductChange = (index: number, productId: string | null) => {
    const updated = [...items];
    updated[index] = { ...updated[index], product: productId ?? '' };
    if (productId) {
      const product = productsData?.results.find((p) => p.id === productId);
      if (product?.unit_cost) {
        updated[index].unit_cost = Number(product.unit_cost);
      }
    }
    setItems(updated);
  };

  const handleFieldChange = (index: number, field: keyof ItemRow, value: number | string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    items.forEach((item, i) => {
      if (!item.product) newErrors[`${i}.product`] = 'Select a product';
      const qty = Number(item.quantity);
      if (!item.quantity || isNaN(qty) || qty <= 0) newErrors[`${i}.quantity`] = 'Must be > 0';
      const cost = Number(item.unit_cost);
      if (!item.unit_cost || isNaN(cost) || cost <= 0) newErrors[`${i}.unit_cost`] = 'Must be > 0';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createOrder.mutate(
      {
        supplier: supplier || null,
        notes,
        items: items.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
          unit_cost: Number(item.unit_cost),
        })),
      },
      {
        onSuccess: (order) => setCreatedOrder(order),
      },
    );
  };

  const handleConfirm = () => {
    if (!createdOrder) return;
    confirmOrder.mutate(createdOrder.id, {
      onSuccess: () => navigate('/purchases'),
    });
  };

  const totalCost = items.reduce((sum, item) => sum + itemTotal(item), 0);

  if (createdOrder) {
    return (
      <Stack gap="lg" maw={680}>
        <Breadcrumbs>
          <Anchor size="sm" onClick={() => navigate('/purchases')}>Purchase Orders</Anchor>
          <Text size="sm" c="dimmed">Order Created</Text>
        </Breadcrumbs>

        <Alert color="green" title="Order created successfully!" icon={<IconCheck size={16} />}>
          The purchase order has been saved. Confirm it to add stock.
        </Alert>

        <PurchaseOrderSummary order={createdOrder} />

        <Group>
          <Button variant="default" onClick={() => navigate('/purchases')}>
            Back to Orders
          </Button>
          <Button color="green" loading={confirmOrder.isPending} onClick={handleConfirm}>
            Confirm Order
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="lg" maw={780}>
      <Breadcrumbs>
        <Anchor size="sm" onClick={() => navigate('/purchases')}>Purchase Orders</Anchor>
        <Text size="sm" c="dimmed">New Order</Text>
      </Breadcrumbs>

      <Title order={2} style={{ fontSize: 22, fontWeight: 600 }}>New Purchase Order</Title>

      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Title order={5}>Order Details</Title>
          <Divider />
          <Select
            label="Supplier"
            placeholder="Select a supplier (optional)"
            data={supplierOptions}
            value={supplier}
            onChange={setSupplier}
            clearable
            searchable
          />
          <Textarea
            label="Notes"
            placeholder="Internal notes for this order..."
            autosize
            minRows={2}
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
          />
        </Stack>
      </Card>

      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={5}>Items</Title>
            <Text size="sm" c="dimmed">
              Estimated total: <strong>{formatCurrency(totalCost)}</strong>
            </Text>
          </Group>
          <Divider />

          <Stack gap="xs">
            {items.map((item, index) => (
              <Group key={index} align="flex-start" wrap="nowrap" gap="sm">
                <Select
                  placeholder="Select product"
                  data={productOptions}
                  value={item.product || null}
                  onChange={(val) => handleProductChange(index, val)}
                  searchable
                  style={{ flex: 2 }}
                  error={errors[`${index}.product`]}
                />
                <NumberInput
                  placeholder="Qty"
                  min={0.001}
                  decimalScale={3}
                  value={item.quantity as number}
                  onChange={(val) => handleFieldChange(index, 'quantity', val)}
                  style={{ width: 100 }}
                  error={errors[`${index}.quantity`]}
                />
                <NumberInput
                  placeholder="Unit cost"
                  leftSection="$"
                  min={0.01}
                  decimalScale={2}
                  value={item.unit_cost as number}
                  onChange={(val) => handleFieldChange(index, 'unit_cost', val)}
                  style={{ width: 140 }}
                  error={errors[`${index}.unit_cost`]}
                />
                <Button
                  variant="subtle"
                  color="red"
                  size="sm"
                  px="xs"
                  mt={1}
                  disabled={items.length === 1}
                  onClick={() => removeItem(index)}
                >
                  <IconTrash size={16} />
                </Button>
              </Group>
            ))}
          </Stack>

          <Button
            variant="subtle"
            leftSection={<IconPlus size={14} />}
            onClick={addItem}
            style={{ alignSelf: 'flex-start' }}
          >
            Add Item
          </Button>
        </Stack>
      </Card>

      <Group>
        <Button variant="default" onClick={() => navigate('/purchases')}>
          Cancel
        </Button>
        <Button loading={createOrder.isPending} onClick={handleSubmit}>
          Create Order
        </Button>
      </Group>
    </Stack>
  );
}
