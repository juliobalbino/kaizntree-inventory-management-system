from decimal import Decimal


def calculate_profit_margin(cost: Decimal, revenue: Decimal) -> Decimal:
    if cost <= 0:
        return Decimal("0")
    return ((revenue - cost) / cost * 100).quantize(Decimal("0.01"))
