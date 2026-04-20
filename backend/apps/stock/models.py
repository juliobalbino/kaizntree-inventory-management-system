from django.db import models

from common.models import BaseModel


class Stock(BaseModel):
    SOURCE_CHOICES = [
        ("manual", "Manual"),
        ("purchase_order", "Purchase Order"),
        ("sales_order", "Sales Order"),
    ]

    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="stock_entries")
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    reference = models.UUIDField(null=True, blank=True)

    def __str__(self):
        return f"{self.product.name} — {self.quantity} ({self.source})"
