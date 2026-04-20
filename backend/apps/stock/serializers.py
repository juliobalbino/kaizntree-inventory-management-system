from decimal import Decimal

from rest_framework import serializers

from apps.products.models import Product

from .models import Stock


class StockCreateSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.none())
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3, min_value=Decimal("0.001"))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if "request" in self.context:
            self.fields["product"].queryset = Product.objects.filter(user=self.context["request"].user)


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ["id", "product", "quantity", "source", "reference", "created_at"]
        read_only_fields = ["id", "source", "reference", "created_at"]
