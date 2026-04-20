from decimal import Decimal

from rest_framework import serializers

from apps.customers.models import Customer
from apps.products.models import Product

from .models import SalesOrder, SalesOrderItem


class SalesOrderItemWriteSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.none())
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3, min_value=Decimal("0.001"))
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and request.user.current_organization:
            fields["product"].queryset = Product.objects.filter(org=request.user.current_organization)
        return fields


class SalesOrderWriteSerializer(serializers.Serializer):
    customer = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.none(), required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    items = SalesOrderItemWriteSerializer(many=True, min_length=1)

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and request.user.current_organization:
            fields["customer"].queryset = Customer.objects.filter(org=request.user.current_organization)
        return fields


class SalesOrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesOrderItem
        fields = ["id", "product", "quantity", "unit_price"]


class CreatedBySerializer(serializers.Serializer):
    id = serializers.UUIDField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


class SalesOrderSerializer(serializers.ModelSerializer):
    items = SalesOrderItemReadSerializer(many=True, read_only=True)
    created_by = CreatedBySerializer(read_only=True)

    class Meta:
        model = SalesOrder
        fields = ["id", "customer", "created_by", "status", "notes", "items", "created_at", "updated_at"]
        read_only_fields = ["id", "status", "created_by", "created_at", "updated_at"]
