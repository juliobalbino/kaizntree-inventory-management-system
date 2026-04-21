from decimal import Decimal

from rest_framework import serializers

from apps.products.models import Product
from apps.suppliers.models import Supplier

from .models import PurchaseOrder, PurchaseOrderItem


class PurchaseOrderItemWriteSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.none())
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3, min_value=Decimal("0.001"))
    unit_cost = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and hasattr(request.user, 'organization') and request.user.organization:
            fields["product"].queryset = Product.objects.filter(org=request.user.organization)
        return fields


class PurchaseOrderWriteSerializer(serializers.Serializer):
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.none(), required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    items = PurchaseOrderItemWriteSerializer(many=True, min_length=1)

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and hasattr(request.user, 'organization') and request.user.organization:
            fields["supplier"].queryset = Supplier.objects.filter(org=request.user.organization)
        return fields


class PurchaseOrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = ["id", "product", "quantity", "unit_cost"]


class CreatedBySerializer(serializers.Serializer):
    id = serializers.UUIDField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemReadSerializer(many=True, read_only=True)
    created_by = CreatedBySerializer(read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ["id", "supplier", "created_by", "status", "notes", "items", "created_at", "updated_at"]
        read_only_fields = ["id", "status", "created_by", "created_at", "updated_at"]
