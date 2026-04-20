from django.shortcuts import get_object_or_404

from .models import Product


def get_products_for_org(org):
    return Product.objects.filter(org=org).order_by("name")


def get_product_by_id(org, product_id):
    return get_object_or_404(Product, id=product_id, org=org)
