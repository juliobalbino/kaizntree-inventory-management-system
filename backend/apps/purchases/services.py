from django.db import transaction

from apps.stock.services import add_stock_from_purchase
from common.exceptions import BusinessRuleViolation

from .models import PurchaseOrder, PurchaseOrderItem


def create_purchase_order(org, data: dict, user=None) -> PurchaseOrder:
    items_data = data.pop("items")
    with transaction.atomic():
        order = PurchaseOrder.objects.create(org=org, created_by=user, **data)
        for item in items_data:
            PurchaseOrderItem.objects.create(order=order, **item)
    return order


def confirm_purchase_order(order: PurchaseOrder) -> PurchaseOrder:
    if order.status == "confirmed":
        raise BusinessRuleViolation("Order is already confirmed.")
    with transaction.atomic():
        for item in order.items.select_related("product").all():
            add_stock_from_purchase(
                product=item.product,
                quantity=item.quantity,
                reference=order.id,
            )
        order.status = "confirmed"
        order.save(update_fields=["status", "updated_at"])
    return order
