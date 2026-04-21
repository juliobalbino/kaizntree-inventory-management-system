from decimal import Decimal

from common.exceptions import InsufficientStockError

from .models import Stock
from .selectors import get_total_stock


def add_stock_manually(product, quantity: Decimal) -> Stock:
    return Stock.objects.create(product=product, quantity=quantity, source="manual")


def remove_stock_manually(product, quantity: Decimal) -> Stock:
    current = get_total_stock(product)
    if quantity > current:
        raise InsufficientStockError(
            detail=f"Cannot remove {quantity}. Only {current} {product.unit} available in stock."
        )
    return Stock.objects.create(product=product, quantity=-quantity, source="manual")


def add_stock_from_purchase(product, quantity: Decimal, reference) -> Stock:
    return Stock.objects.create(product=product, quantity=quantity, source="purchase_order", reference=reference)


def deduct_stock(product, quantity: Decimal, reference=None) -> Stock:
    current = get_total_stock(product)
    if current < quantity:
        raise InsufficientStockError()
    return Stock.objects.create(product=product, quantity=-quantity, source="sales_order", reference=reference)
