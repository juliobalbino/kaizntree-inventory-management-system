from django.shortcuts import get_object_or_404

from .models import Supplier


def get_suppliers_for_user(user):
    return Supplier.objects.filter(user=user).order_by("name")


def get_supplier_by_id(user, supplier_id):
    return get_object_or_404(Supplier, id=supplier_id, user=user)
