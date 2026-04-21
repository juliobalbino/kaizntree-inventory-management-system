from django.db import transaction

from apps.stock.services import deduct_stock
from common.exceptions import BusinessRuleViolation

from .models import SalesOrder, SalesOrderItem


def cancel_sales_order(order: SalesOrder) -> SalesOrder:
    if order.status == "confirmed":
        raise BusinessRuleViolation("Cannot cancel a confirmed order.")
    if order.status == "cancelled":
        raise BusinessRuleViolation("Order is already cancelled.")
    order.status = "cancelled"
    order.save(update_fields=["status", "updated_at"])
    return order


def create_sales_order(org, data: dict, user=None) -> SalesOrder:
    items_data = data.pop("items")
    with transaction.atomic():
        order = SalesOrder.objects.create(org=org, created_by=user, **data)
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
