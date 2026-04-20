from django.db import transaction

from apps.stock.services import deduct_stock
from common.exceptions import BusinessRuleViolation

from .models import SalesOrder, SalesOrderItem


def create_sales_order(user, data: dict) -> SalesOrder:
    items_data = data.pop("items")
    with transaction.atomic():
        order = SalesOrder.objects.create(user=user, **data)
        for item in items_data:
            SalesOrderItem.objects.create(order=order, **item)
    return order


def confirm_sales_order(order: SalesOrder) -> SalesOrder:
    if order.status == "confirmed":
        raise BusinessRuleViolation("Order is already confirmed.")
    with transaction.atomic():
        for item in order.items.select_related("product").all():
            deduct_stock(
                product=item.product,
                quantity=item.quantity,
                reference=order.id,
            )
        order.status = "confirmed"
        order.save(update_fields=["status", "updated_at"])
    return order
