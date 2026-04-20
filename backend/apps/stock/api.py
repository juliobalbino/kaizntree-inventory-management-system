from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response

from apps.products.selectors import get_product_by_id

from .models import Stock
from .selectors import get_stock_for_product
from .serializers import StockCreateSerializer, StockSerializer
from .services import add_stock_manually


class StockListCreateView(ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == "POST":
            return StockCreateSerializer
        return StockSerializer

    def get_queryset(self):
        org = self.request.user.current_organization
        product_id = self.request.query_params.get("product")
        if product_id:
            product = get_product_by_id(org, product_id)
            return get_stock_for_product(product)
        return Stock.objects.filter(product__org=org).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = StockCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        stock = add_stock_manually(
            product=serializer.validated_data["product"],
            quantity=serializer.validated_data["quantity"],
        )
        return Response(StockSerializer(stock).data, status=status.HTTP_201_CREATED)


class StockDetailView(RetrieveAPIView):
    serializer_class = StockSerializer

    def get_object(self):
        return get_object_or_404(
            Stock, id=self.kwargs["pk"], product__org=self.request.user.current_organization
        )
