from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.selectors import get_product_by_id

from .models import Stock
from .selectors import get_stock_for_product
from .serializers import StockCreateSerializer, StockRemoveSerializer, StockSerializer
from .services import add_stock_manually, remove_stock_manually


class StockListCreateView(ListCreateAPIView):
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["product__name", "product__sku", "source"]
    ordering_fields = ["created_at", "quantity", "source"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StockCreateSerializer
        return StockSerializer

    def get_queryset(self):
        org = self.request.user.organization
        product_id = self.request.query_params.get("product")
        date_after = self.request.query_params.get("date_after")
        date_before = self.request.query_params.get("date_before")

        if product_id:
            product = get_product_by_id(org, product_id)
            qs = get_stock_for_product(product)
        else:
            qs = Stock.objects.filter(product__org=org).order_by("-created_at")

        if date_after:
            qs = qs.filter(created_at__date__gte=date_after)
        if date_before:
            qs = qs.filter(created_at__date__lte=date_before)

        return qs

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
            Stock, id=self.kwargs["pk"], product__org=self.request.user.organization
        )


class StockRemoveView(APIView):
    """POST /stock/{product_id}/remove/ — create a negative manual stock entry."""

    def post(self, request, product_id):
        product = get_product_by_id(request.user.organization, product_id)
        serializer = StockRemoveSerializer(data=request.data, context={"request": request, "product": product})
        serializer.is_valid(raise_exception=True)
        stock = remove_stock_manually(
            product=product,
            quantity=serializer.validated_data["quantity"],
        )
        return Response(StockSerializer(stock).data, status=status.HTTP_201_CREATED)
