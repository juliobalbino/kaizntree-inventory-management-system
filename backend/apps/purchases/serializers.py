from decimal import Decimal

from rest_framework import serializers

from apps.products.models import Product

from .models import PurchaseOrder, PurchaseOrderItem


class PurchaseOrderItemWriteSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.none())
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3, min_value=Decimal("0.001"))
    unit_cost = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request:
            fields["product"].queryset = Product.objects.filter(user=request.user)
        return fields


class PurchaseOrderWriteSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    items = PurchaseOrderItemWriteSerializer(many=True, min_length=1)


class PurchaseOrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = ["id", "product", "quantity", "unit_cost"]


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ["id", "status", "notes", "items", "created_at", "updated_at"]
        read_only_fields = ["id", "status", "created_at", "updated_at"]
