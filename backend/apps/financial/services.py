from decimal import Decimal


def calculate_profit_margin(cost: Decimal, revenue: Decimal) -> Decimal:
    if revenue <= 0:
        return Decimal("0")
    return ((revenue - cost) / revenue * 100).quantize(Decimal("0.0001"))
