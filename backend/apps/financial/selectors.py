from decimal import Decimal

from django.db.models import DecimalField, ExpressionWrapper, F, OuterRef, Subquery, Sum
from django.db.models.functions import Coalesce

from apps.products.models import Product
from apps.purchases.models import PurchaseOrderItem
from apps.sales.models import SalesOrderItem

from .services import calculate_profit_margin

_DECIMAL_FIELD = DecimalField(max_digits=20, decimal_places=4)
_ZERO = Decimal("0")


def _cost_subquery():
    return Coalesce(
        Subquery(
            PurchaseOrderItem.objects.filter(
                product=OuterRef("pk"),
                order__status="confirmed",
            )
            .values("product")
            .annotate(total=Sum(ExpressionWrapper(F("unit_cost") * F("quantity"), output_field=_DECIMAL_FIELD)))
            .values("total"),
            output_field=_DECIMAL_FIELD,
        ),
        _ZERO,
        output_field=_DECIMAL_FIELD,
    )


def _revenue_subquery():
    return Coalesce(
        Subquery(
            SalesOrderItem.objects.filter(
                product=OuterRef("pk"),
                order__status="confirmed",
            )
            .values("product")
            .annotate(total=Sum(ExpressionWrapper(F("unit_price") * F("quantity"), output_field=_DECIMAL_FIELD)))
            .values("total"),
            output_field=_DECIMAL_FIELD,
        ),
        _ZERO,
        output_field=_DECIMAL_FIELD,
    )


def get_financial_summary(org) -> dict:
    cost_agg = (
        PurchaseOrderItem.objects.filter(order__org=org, order__status="confirmed")
        .aggregate(total=Sum(ExpressionWrapper(F("unit_cost") * F("quantity"), output_field=_DECIMAL_FIELD)))
    )
    revenue_agg = (
        SalesOrderItem.objects.filter(order__org=org, order__status="confirmed")
        .aggregate(total=Sum(ExpressionWrapper(F("unit_price") * F("quantity"), output_field=_DECIMAL_FIELD)))
    )

    total_cost = cost_agg["total"] or _ZERO
    total_revenue = revenue_agg["total"] or _ZERO
    profit = total_revenue - total_cost

    return {
        "total_cost": total_cost,
        "total_revenue": total_revenue,
        "profit": profit,
        "margin": calculate_profit_margin(total_cost, total_revenue),
    }


def get_per_product_financials(org) -> list:
    products = (
        Product.objects.filter(org=org)
        .annotate(total_cost=_cost_subquery(), total_revenue=_revenue_subquery())
        .order_by("name")
    )

    result = []
    for p in products:
        profit = p.total_revenue - p.total_cost
        result.append(
            {
                "product_id": p.id,
                "product_name": p.name,
                "product_sku": p.sku,
                "total_cost": p.total_cost,
                "total_revenue": p.total_revenue,
                "profit": profit,
                "margin": calculate_profit_margin(p.total_cost, p.total_revenue),
            }
        )

    return result
