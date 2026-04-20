from django.shortcuts import get_object_or_404

from .models import SalesOrder


def get_orders_for_org(org):
    return SalesOrder.objects.filter(org=org).order_by("-created_at")


def get_order_by_id(org, order_id):
    return get_object_or_404(SalesOrder, id=order_id, org=org)
