from django.shortcuts import get_object_or_404

from .models import Product


def get_products_for_user(user):
    return Product.objects.filter(user=user).order_by("name")


def get_product_by_id(user, product_id):
    return get_object_or_404(Product, id=product_id, user=user)
