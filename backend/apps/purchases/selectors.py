from django.shortcuts import get_object_or_404

from .models import PurchaseOrder


def get_orders_for_org(org):
    return PurchaseOrder.objects.filter(org=org).order_by("-created_at")


def get_order_by_id(org, order_id):
    return get_object_or_404(PurchaseOrder, id=order_id, org=org)
