import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from '../../../lib/zod-resolver';
import { z } from 'zod';
import { IconPlus, IconTrash, IconCheck } from '@tabler/icons-react';
import { useCreatePurchaseOrder, useConfirmPurchaseOrder } from '../hooks/usePurchases';
import { useSuppliers } from '../../suppliers/hooks/useSuppliers';
import { useProducts } from '../../products/hooks/useProducts';
import { formatCurrency } from '../../../lib/utils';
import type { PurchaseOrder } from '../model/types';
import { PurchaseOrderSummary } from '../components/PurchaseOrderSummary';

const purchaseSchema = z.object({
  supplier: z.string().nullable().refine((val) => !!val, 'Please select a supplier'),
  notes: z.string(),
  items: z.array(z.object({
    product: z.string().min(1, 'Required'),
    quantity: z.number().positive('Must be > 0'),
    unit_cost: z.number().positive('Must be > 0'),
  })).min(1, 'Add at least one item'),
});

type PurchaseValues = z.infer<typeof purchaseSchema>;

export function CreatePurchasePage() {
  const navigate = useNavigate();
  const [createdOrder, setCreatedOrder] = useState<PurchaseOrder | null>(null);

  const { data: suppliersData } = useSuppliers({ page_size: 100 });
  const { data: productsData } = useProducts({ page_size: 100 });
  const createOrder = useCreatePurchaseOrder();
  const confirmOrder = useConfirmPurchaseOrder();

  const form = useForm<PurchaseValues>({
    initialValues: {
      supplier: null,
      notes: '',
      items: [{ product: '', quantity: 1, unit_cost: 0.01 }],
    },
    validate: zodResolver(purchaseSchema),
  });

  const supplierOptions = (suppliersData?.results ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const productOptions = (productsData?.results ?? []).map((p) => ({
    value: p.id,
    label: `${p.name} (${p.sku})`,
  }));

  const handleProductChange = (index: number, productId: string | null) => {
    form.setFieldValue(`items.${index}.product`, productId ?? '');
    if (productId) {
      const product = productsData?.results.find((p) => p.id === productId);
      if (product?.unit_cost) {
        form.setFieldValue(`items.${index}.unit_cost`, Number(product.unit_cost));
      }
    }
  };

  const handleSubmit = (values: PurchaseValues) => {
    createOrder.mutate(
      {
        supplier: values.supplier,
        notes: values.notes,
        items: values.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
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

  const itemTotal = (item: PurchaseValues['items'][0]) => item.quantity * item.unit_cost;
  const totalCost = form.values.items.reduce((sum, item) => sum + itemTotal(item), 0);

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
    <form onSubmit={form.onSubmit(handleSubmit)}>
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
              placeholder="Select a supplier"
              data={supplierOptions}
              searchable
              clearable
              {...form.getInputProps('supplier')}
            />
            <Textarea
              label="Notes"
              placeholder="Internal notes for this order..."
              autosize
              minRows={2}
              {...form.getInputProps('notes')}
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
              {form.values.items.map((_, index) => (
                <Group key={index} align="flex-start" wrap="nowrap" gap="sm">
                  <Select
                    placeholder="Select product"
                    data={productOptions}
                    searchable
                    style={{ flex: 2 }}
                    {...form.getInputProps(`items.${index}.product`)}
                    onChange={(val) => handleProductChange(index, val)}
                  />
                  <NumberInput
                    placeholder="Qty"
                    min={0.001}
                    decimalScale={3}
                    style={{ width: 100 }}
                    {...form.getInputProps(`items.${index}.quantity`)}
                  />
                  <NumberInput
                    placeholder="Unit cost"
                    leftSection="$"
                    min={0.01}
                    decimalScale={2}
                    style={{ width: 140 }}
                    {...form.getInputProps(`items.${index}.unit_cost`)}
                  />
                  <Button
                    variant="subtle"
                    color="red"
                    size="sm"
                    px="xs"
                    mt={1}
                    disabled={form.values.items.length === 1}
                    onClick={() => form.removeListItem('items', index)}
                  >
                    <IconTrash size={16} />
                  </Button>
                </Group>
              ))}
            </Stack>

            <Button
              variant="subtle"
              leftSection={<IconPlus size={14} />}
              onClick={() => form.insertListItem('items', { product: '', quantity: 1, unit_cost: 0.01 })}
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
          <Button type="submit" loading={createOrder.isPending}>
            Create Order
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
