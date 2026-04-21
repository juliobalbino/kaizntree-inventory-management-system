from django.conf import settings
from django.db import models

from common.models import BaseModel


class Organization(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True)

    def __str__(self):
        return self.name



