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
import { useCreateSalesOrder, useConfirmSalesOrder } from '../hooks/useSales';
import { useCustomers } from '../../customers/hooks/useCustomers';
import { useProducts } from '../../products/hooks/useProducts';
import { formatCurrency } from '../../../lib/utils';
import type { SalesOrder } from '../model/types';
import { SalesOrderSummary } from '../components/SalesOrderSummary';

const saleSchema = z.object({
  customer: z.string().nullable().refine((val) => !!val, 'Please select a customer'),
  notes: z.string(),
  items: z.array(z.object({
    product: z.string().min(1, 'Required'),
    quantity: z.number().positive('Must be > 0'),
    unit_price: z.number().positive('Must be > 0'),
  })).min(1, 'Add at least one item'),
});

type SaleValues = z.infer<typeof saleSchema>;

export function CreateSalePage() {
  const navigate = useNavigate();
  const [createdOrder, setCreatedOrder] = useState<SalesOrder | null>(null);

  const { data: customersData } = useCustomers({ page_size: 100 });
  const { data: productsData } = useProducts({ page_size: 100 });
  const createOrder = useCreateSalesOrder();
  const confirmOrder = useConfirmSalesOrder();

  const productMap = Object.fromEntries(
    (productsData?.results ?? []).map((p) => [p.id, p]),
  );

  const form = useForm<SaleValues>({
    initialValues: {
      customer: null,
      notes: '',
      items: [{ product: '', quantity: 1, unit_price: 0.01 }],
    },
    validate: (values) => {
      // First, get Zod errors
      const zodErrors = zodResolver(saleSchema)(values);
      
      // Then, add custom stock check
      const errors: Record<string, React.ReactNode> = { ...(zodErrors as Record<string, React.ReactNode>) };
      
      values.items.forEach((item, index) => {
        if (item.product && item.quantity > 0) {
          const product = productMap[item.product];
          const available = Number(product?.stock_total ?? 0);
          if (item.quantity > available) {
            errors[`items.${index}.quantity`] = `Only ${available} available`;
          }
        }
      });
      
      return errors;
    },
  });

  const customerOptions = (customersData?.results ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const productOptions = (productsData?.results ?? []).map((p) => ({
    value: p.id,
    label: `${p.name} (${p.sku})`,
  }));

  const handleProductChange = (index: number, productId: string | null) => {
    form.setFieldValue(`items.${index}.product`, productId ?? '');
    if (productId) {
      const product = productMap[productId];
      if (product?.unit_price) {
        form.setFieldValue(`items.${index}.unit_price`, Number(product.unit_price));
      }
    }
  };

  const handleSubmit = (values: SaleValues) => {
    createOrder.mutate(
      {
        customer: values.customer,
        notes: values.notes,
        items: values.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      },
      { onSuccess: (order) => setCreatedOrder(order) },
    );
  };

  const handleConfirm = () => {
    if (!createdOrder) return;
    confirmOrder.mutate(createdOrder.id, {
      onSuccess: () => navigate('/sales'),
    });
  };

  const itemTotal = (item: SaleValues['items'][0]) => item.quantity * item.unit_price;
  const totalRevenue = form.values.items.reduce((sum, item) => sum + itemTotal(item), 0);

  if (createdOrder) {
    return (
      <Stack gap="lg" maw={680}>
        <Breadcrumbs>
          <Anchor size="sm" onClick={() => navigate('/sales')}>Sales Orders</Anchor>
          <Text size="sm" c="dimmed">Order Created</Text>
        </Breadcrumbs>

        <Alert color="green" title="Order created successfully!" icon={<IconCheck size={16} />}>
          The sales order has been saved. Confirm it to deduct stock.
        </Alert>

        <SalesOrderSummary order={createdOrder} />

        <Group>
          <Button variant="default" onClick={() => navigate('/sales')}>
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
          <Anchor size="sm" onClick={() => navigate('/sales')}>Sales Orders</Anchor>
          <Text size="sm" c="dimmed">New Order</Text>
        </Breadcrumbs>

        <Title order={2} style={{ fontSize: 22, fontWeight: 600 }}>New Sales Order</Title>

        <Card withBorder radius="md" p="lg">
          <Stack gap="md">
            <Title order={5}>Order Details</Title>
            <Divider />
            <Select
              label="Customer"
              placeholder="Select a customer"
              data={customerOptions}
              searchable
              clearable
              {...form.getInputProps('customer')}
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
                Estimated revenue: <strong>{formatCurrency(totalRevenue)}</strong>
              </Text>
            </Group>
            <Divider />

            <Stack gap="sm">
              {form.values.items.map((item, index) => {
                const selectedProduct = item.product ? productMap[item.product] : null;
                const availableStock = selectedProduct ? Number(selectedProduct.stock_total ?? 0) : null;

                return (
                  <Stack key={index} gap={4}>
                    <Group align="flex-start" wrap="nowrap" gap="sm">
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
                        placeholder="Unit price"
                        leftSection="$"
                        min={0.01}
                        decimalScale={2}
                        style={{ width: 140 }}
                        {...form.getInputProps(`items.${index}.unit_price`)}
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
                    {availableStock !== null && (
                      <Text size="xs" c={availableStock <= 0 ? 'red' : 'dimmed'} pl={4}>
                        {availableStock <= 0
                          ? 'Out of stock'
                          : `${availableStock.toLocaleString()} ${selectedProduct!.unit} available`}
                      </Text>
                    )}
                  </Stack>
                );
              })}
            </Stack>

            <Button
              variant="subtle"
              leftSection={<IconPlus size={14} />}
              onClick={() => form.insertListItem('items', { product: '', quantity: 1, unit_price: 0.01 })}
              style={{ alignSelf: 'flex-start' }}
            >
              Add Item
            </Button>
          </Stack>
        </Card>

        <Group>
          <Button variant="default" onClick={() => navigate('/sales')}>
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
