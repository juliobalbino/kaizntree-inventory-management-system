from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response

from .selectors import get_product_by_id, get_products_for_org
from .serializers import ProductSerializer
from .services import create_product, delete_product, update_product


class ProductListCreateView(ListCreateAPIView):
    serializer_class = ProductSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "sku"]
    ordering_fields = ["name", "sku", "unit", "stock_total"]
    ordering = ["name"]

    def get_queryset(self):
        qs = get_products_for_org(self.request.user.organization)
        unit = self.request.query_params.get("unit")
        if unit:
            qs = qs.filter(unit=unit)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = create_product(org=request.user.organization, data=serializer.validated_data)
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


class ProductDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    http_method_names = ["get", "patch", "delete"]

    def get_object(self):
        return get_product_by_id(self.request.user.organization, self.kwargs["pk"])

    def update(self, request, *args, **kwargs):
        product = self.get_object()
        serializer = self.get_serializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = update_product(product, serializer.validated_data)
        return Response(ProductSerializer(updated).data)

    def destroy(self, request, *args, **kwargs):
        delete_product(self.get_object())
        return Response(status=status.HTTP_204_NO_CONTENT)
