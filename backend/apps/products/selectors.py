from decimal import Decimal

from django.db.models import DecimalField, Sum
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404

from .models import Product


def get_products_for_org(org):
    return Product.objects.filter(org=org).annotate(
        stock_total=Coalesce(
            Sum("stock_entries__quantity"),
            Decimal("0"),
            output_field=DecimalField(max_digits=12, decimal_places=3),
        )
    ).order_by("name")


def get_product_by_id(org, product_id):
    return get_object_or_404(
        Product.objects.filter(org=org).annotate(
            stock_total=Coalesce(
                Sum("stock_entries__quantity"),
                Decimal("0"),
                output_field=DecimalField(max_digits=12, decimal_places=3),
            )
        ),
        id=product_id,
    )
