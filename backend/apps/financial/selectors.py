from decimal import Decimal

from django.db.models import DecimalField, ExpressionWrapper, F, OuterRef, Subquery, Sum
from django.db.models.functions import Coalesce, TruncDay, TruncMonth, TruncYear

from apps.products.models import Product
from apps.purchases.models import PurchaseOrderItem
from apps.sales.models import SalesOrderItem

from .services import calculate_profit_margin

_DECIMAL_FIELD = DecimalField(max_digits=20, decimal_places=4)
_ZERO = Decimal("0")


def _cost_subquery(date_from=None, date_to=None):
    qs = PurchaseOrderItem.objects.filter(
        product=OuterRef("pk"),
        order__status="confirmed",
    )
    if date_from:
        qs = qs.filter(order__created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(order__created_at__date__lte=date_to)
    return Coalesce(
        Subquery(
            qs.values("product")
            .annotate(total=Sum(ExpressionWrapper(F("unit_cost") * F("quantity"), output_field=_DECIMAL_FIELD)))
            .values("total"),
            output_field=_DECIMAL_FIELD,
        ),
        _ZERO,
        output_field=_DECIMAL_FIELD,
    )


def _revenue_subquery(date_from=None, date_to=None):
    qs = SalesOrderItem.objects.filter(
        product=OuterRef("pk"),
        order__status="confirmed",
    )
    if date_from:
        qs = qs.filter(order__created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(order__created_at__date__lte=date_to)
    return Coalesce(
        Subquery(
            qs.values("product")
            .annotate(total=Sum(ExpressionWrapper(F("unit_price") * F("quantity"), output_field=_DECIMAL_FIELD)))
            .values("total"),
            output_field=_DECIMAL_FIELD,
        ),
        _ZERO,
        output_field=_DECIMAL_FIELD,
    )


def _units_sold_subquery(date_from=None, date_to=None):
    qs = SalesOrderItem.objects.filter(
        product=OuterRef("pk"),
        order__status="confirmed",
    )
    if date_from:
        qs = qs.filter(order__created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(order__created_at__date__lte=date_to)
    return Coalesce(
        Subquery(
            qs.values("product")
            .annotate(total=Sum("quantity", output_field=_DECIMAL_FIELD))
            .values("total"),
            output_field=_DECIMAL_FIELD,
        ),
        _ZERO,
        output_field=_DECIMAL_FIELD,
    )


def get_financial_summary(org, date_from=None, date_to=None, product_ids=None) -> dict:
    cost_filters = {"order__org": org, "order__status": "confirmed"}
    revenue_filters = {"order__org": org, "order__status": "confirmed"}

    if date_from:
        cost_filters["order__created_at__date__gte"] = date_from
        revenue_filters["order__created_at__date__gte"] = date_from
    if date_to:
        cost_filters["order__created_at__date__lte"] = date_to
        revenue_filters["order__created_at__date__lte"] = date_to
    if product_ids:
        cost_filters["product_id__in"] = product_ids
        revenue_filters["product_id__in"] = product_ids

    cost_agg = (
        PurchaseOrderItem.objects.filter(**cost_filters)
        .aggregate(total=Sum(ExpressionWrapper(F("unit_cost") * F("quantity"), output_field=_DECIMAL_FIELD)))
    )
    revenue_agg = (
        SalesOrderItem.objects.filter(**revenue_filters)
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


def get_per_product_financials(org, date_from=None, date_to=None, product_ids=None) -> list:
    qs = Product.objects.filter(org=org)
    if product_ids:
        qs = qs.filter(id__in=product_ids)

    products = (
        qs.annotate(
            total_cost=_cost_subquery(date_from, date_to),
            total_revenue=_revenue_subquery(date_from, date_to),
            units_sold=_units_sold_subquery(date_from, date_to),
        )
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
                "units_sold": p.units_sold,
                "total_cost": p.total_cost,
                "total_revenue": p.total_revenue,
                "profit": profit,
                "margin": calculate_profit_margin(p.total_cost, p.total_revenue),
            }
        )

    return result


_TRUNC_MAP = {"day": TruncDay, "month": TruncMonth, "year": TruncYear}


def get_financial_timeline(org, group_by="month", date_from=None, date_to=None, product_ids=None) -> list:
    trunc_fn = _TRUNC_MAP.get(group_by, TruncMonth)

    revenue_qs = SalesOrderItem.objects.filter(order__org=org, order__status="confirmed")
    cost_qs = PurchaseOrderItem.objects.filter(order__org=org, order__status="confirmed")

    if date_from:
        revenue_qs = revenue_qs.filter(order__created_at__date__gte=date_from)
        cost_qs = cost_qs.filter(order__created_at__date__gte=date_from)
    if date_to:
        revenue_qs = revenue_qs.filter(order__created_at__date__lte=date_to)
        cost_qs = cost_qs.filter(order__created_at__date__lte=date_to)
    if product_ids:
        revenue_qs = revenue_qs.filter(product_id__in=product_ids)
        cost_qs = cost_qs.filter(product_id__in=product_ids)

    revenue_by_period = (
        revenue_qs.annotate(period=trunc_fn("order__created_at"))
        .values("period")
        .annotate(total=Sum(ExpressionWrapper(F("unit_price") * F("quantity"), output_field=_DECIMAL_FIELD)))
        .order_by("period")
    )
    cost_by_period = (
        cost_qs.annotate(period=trunc_fn("order__created_at"))
        .values("period")
        .annotate(total=Sum(ExpressionWrapper(F("unit_cost") * F("quantity"), output_field=_DECIMAL_FIELD)))
        .order_by("period")
    )

    revenue_dict = {r["period"]: r["total"] or _ZERO for r in revenue_by_period}
    cost_dict = {c["period"]: c["total"] or _ZERO for c in cost_by_period}

    fmt = {"day": "%Y-%m-%d", "month": "%Y-%m", "year": "%Y"}.get(group_by, "%Y-%m")
    all_periods = sorted(set(revenue_dict) | set(cost_dict))

    result = []
    for period in all_periods:
        revenue = revenue_dict.get(period, _ZERO)
        cost = cost_dict.get(period, _ZERO)
        profit = revenue - cost
        result.append(
            {
                "period": period.strftime(fmt),
                "revenue": revenue,
                "cost": cost,
                "profit": profit,
            }
        )

    return result
