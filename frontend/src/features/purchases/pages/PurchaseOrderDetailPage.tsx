import { useNavigate, useParams } from 'react-router-dom';
import {
  Anchor,
  Breadcrumbs,
  Button,
  Group,
  Modal,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePurchaseOrder, useConfirmPurchaseOrder, useCancelPurchaseOrder } from '../hooks/usePurchases';
import { PurchaseOrderSummary } from '../components/PurchaseOrderSummary';

export function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cancelOpened, { open: openCancel, close: closeCancel }] = useDisclosure();

  const { data: order, isLoading } = usePurchaseOrder(id);
  const confirmOrder = useConfirmPurchaseOrder();
  const cancelOrder = useCancelPurchaseOrder();

  if (isLoading) return <Text c="dimmed">Loading...</Text>;
  if (!order) return <Text c="dimmed">Purchase order not found.</Text>;

  const orderNum = order.id.slice(0, 8).toUpperCase();
  const isPending = order.status === 'pending';

  return (
    <>
      <Stack gap="lg" maw={680}>
        <Breadcrumbs>
          <Anchor size="sm" onClick={() => navigate('/purchases')}>Purchases</Anchor>
          <Text size="sm" c="dimmed">#{orderNum}</Text>
        </Breadcrumbs>

        <PurchaseOrderSummary order={order} title={`Purchase Order #${orderNum}`} />

        <Group>
          <Button variant="default" onClick={() => navigate('/purchases')}>
            Back to Purchases
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

      <Modal opened={cancelOpened} onClose={closeCancel} title="Cancel Purchase Order" centered>
        <Text size="sm">
          Are you sure you want to cancel order <strong>#{orderNum}</strong>? This cannot be undone.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={closeCancel}>Back</Button>
          <Button
            color="red"
            loading={cancelOrder.isPending}
            onClick={() => cancelOrder.mutate(order.id, { onSuccess: () => navigate('/purchases') })}
          >
            Cancel Order
          </Button>
        </Group>
      </Modal>
    </>
  );
}
