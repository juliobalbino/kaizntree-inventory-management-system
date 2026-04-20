from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

from .models import Product


def create_product(org, data: dict) -> Product:
    try:
        return Product.objects.create(org=org, **data)
    except IntegrityError:
        raise ValidationError({"sku": "A product with this SKU already exists."})


def update_product(product: Product, data: dict) -> Product:
    for field, value in data.items():
        setattr(product, field, value)
    product.save()
    return product


def delete_product(product: Product) -> None:
    product.delete()
