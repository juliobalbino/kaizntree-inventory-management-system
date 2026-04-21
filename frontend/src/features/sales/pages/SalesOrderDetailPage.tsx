import { useNavigate, useParams } from 'react-router-dom';
import { Anchor, Breadcrumbs, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSalesOrder, useConfirmSalesOrder, useCancelSalesOrder } from '../hooks/useSales';
import { SalesOrderSummary } from '../components/SalesOrderSummary';

export function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cancelOpened, { open: openCancel, close: closeCancel }] = useDisclosure();

  const { data: order, isLoading } = useSalesOrder(id);
  const confirmOrder = useConfirmSalesOrder();
  const cancelOrder = useCancelSalesOrder();

  if (isLoading) return <Text c="dimmed">Loading...</Text>;
  if (!order) return <Text c="dimmed">Sales order not found.</Text>;

  const orderNum = order.id.slice(0, 8).toUpperCase();
  const isPending = order.status === 'pending';

  return (
    <>
      <Stack gap="lg" maw={680}>
        <Breadcrumbs>
          <Anchor size="sm" onClick={() => navigate('/sales')}>Sales</Anchor>
          <Text size="sm" c="dimmed">#{orderNum}</Text>
        </Breadcrumbs>

        <SalesOrderSummary order={order} title={`Sales Order #${orderNum}`} />

        <Group>
          <Button variant="default" onClick={() => navigate('/sales')}>
            Back to Sales
          </Button>
          {isPending && (
            <Group gap="xs" style={{ flex: 1, justifyContent: 'flex-end' }}>
              <Button color="red" variant="light" onClick={openCancel}>
                Cancel Order
              </Button>
              <Button
                color="green"
                loading={confirmOrder.isPending}
                onClick={() => confirmOrder.mutate(order.id)}
              >
                Confirm
              </Button>
            </Group>
          )}
        </Group>
      </Stack>

      <Modal opened={cancelOpened} onClose={closeCancel} title="Cancel Sales Order" centered>
        <Text size="sm">
          Are you sure you want to cancel order <strong>#{orderNum}</strong>? This cannot be undone.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={closeCancel}>Back</Button>
          <Button
            color="red"
            loading={cancelOrder.isPending}
            onClick={() => cancelOrder.mutate(order.id, { onSuccess: () => navigate('/sales') })}
          >
            Cancel Order
          </Button>
        </Group>
      </Modal>
    </>
  );
}
