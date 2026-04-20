from django.shortcuts import get_object_or_404

from .models import SalesOrder


def get_orders_for_user(user):
    return SalesOrder.objects.filter(user=user).order_by("-created_at")


def get_order_by_id(user, order_id):
    return get_object_or_404(SalesOrder, id=order_id, user=user)
