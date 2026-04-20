from django.shortcuts import get_object_or_404

from .models import Supplier


def get_suppliers_for_org(org):
    return Supplier.objects.filter(org=org).order_by("name")


def get_supplier_by_id(org, supplier_id):
    return get_object_or_404(Supplier, id=supplier_id, org=org)
