from django.conf import settings
from django.db import models

from common.models import BaseModel


class Product(BaseModel):
    UNIT_CHOICES = [
        ("kg", "kg"),
        ("g", "g"),
        ("L", "L"),
        ("mL", "mL"),
        ("unit", "unit"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    sku = models.CharField(max_length=100)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)

    class Meta:
        unique_together = ("user", "sku")

    def __str__(self):
        return self.name
