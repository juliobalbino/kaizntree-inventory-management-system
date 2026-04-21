from decimal import Decimal

from rest_framework import serializers

from apps.products.models import Product

from .models import Stock


class StockCreateSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.none())
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3, min_value=Decimal("0.001"))

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and hasattr(request.user, 'organization') and request.user.organization:
            fields["product"].queryset = Product.objects.filter(org=request.user.organization)
        return fields


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ["id", "product", "quantity", "source", "reference", "created_at"]
        read_only_fields = ["id", "source", "reference", "created_at"]
