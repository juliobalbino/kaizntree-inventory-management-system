from django.conf import settings
from django.db import models

from common.models import BaseModel


class PurchaseOrder(BaseModel):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="purchase_orders")
    supplier = models.ForeignKey("suppliers.Supplier", null=True, blank=True, on_delete=models.SET_NULL, related_name="purchase_orders")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    notes = models.TextField(blank=True, default="")

    def __str__(self):
        return f"PurchaseOrder #{self.id} — {self.status}"


class PurchaseOrderItem(BaseModel):
    order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="purchase_items")
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x{self.quantity} @ {self.unit_cost}"
