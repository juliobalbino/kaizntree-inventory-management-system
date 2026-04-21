from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    stock_total = serializers.SerializerMethodField()

    def get_stock_total(self, obj):
        return getattr(obj, "stock_total", None)

    class Meta:
        model = Product
        fields = ["id", "name", "description", "sku", "unit", "unit_cost", "unit_price", "stock_total", "created_at", "updated_at"]
        read_only_fields = ["id", "stock_total", "created_at", "updated_at"]
