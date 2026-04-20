from django.db import models

from common.models import BaseModel


class Customer(BaseModel):
    org = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="customers")
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    address = models.TextField(blank=True, default="")
    notes = models.TextField(blank=True, default="")

    def __str__(self):
        return self.name
