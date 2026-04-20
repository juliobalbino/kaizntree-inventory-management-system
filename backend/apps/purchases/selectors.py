from django.shortcuts import get_object_or_404

from .models import PurchaseOrder


def get_orders_for_user(user):
    return PurchaseOrder.objects.filter(user=user).order_by("-created_at")


def get_order_by_id(user, order_id):
    return get_object_or_404(PurchaseOrder, id=order_id, user=user)
