from django.db.models import Sum

from .models import Stock


def get_stock_for_product(product):
    return Stock.objects.filter(product=product).order_by("-created_at")


def get_total_stock(product):
    result = Stock.objects.filter(product=product).aggregate(total=Sum("quantity"))
    return result["total"] or 0
