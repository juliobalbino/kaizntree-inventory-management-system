from rest_framework import serializers


class FinancialSummarySerializer(serializers.Serializer):
    total_cost = serializers.DecimalField(max_digits=20, decimal_places=2)
    total_revenue = serializers.DecimalField(max_digits=20, decimal_places=2)
    profit = serializers.DecimalField(max_digits=20, decimal_places=2)
    margin = serializers.DecimalField(max_digits=10, decimal_places=2)


class ProductFinancialSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    product_name = serializers.CharField()
    product_sku = serializers.CharField()
    total_cost = serializers.DecimalField(max_digits=20, decimal_places=2)
    total_revenue = serializers.DecimalField(max_digits=20, decimal_places=2)
    profit = serializers.DecimalField(max_digits=20, decimal_places=2)
    margin = serializers.DecimalField(max_digits=10, decimal_places=2)
