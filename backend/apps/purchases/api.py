from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .selectors import get_order_by_id, get_orders_for_org
from .serializers import PurchaseOrderSerializer, PurchaseOrderWriteSerializer
from .services import cancel_purchase_order, confirm_purchase_order, create_purchase_order



class PurchaseOrderListCreateView(ListCreateAPIView):
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["id", "supplier__name", "created_by__first_name", "created_by__email", "notes"]
    ordering_fields = ["created_at", "status", "id"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PurchaseOrderWriteSerializer
        return PurchaseOrderSerializer

    def get_queryset(self):
        qs = get_orders_for_org(self.request.user.organization)
        
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
            
        date_from = self.request.query_params.get("date_from")
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
            
        date_to = self.request.query_params.get("date_to")
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
            
        return qs

    def create(self, request, *args, **kwargs):
        serializer = PurchaseOrderWriteSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = create_purchase_order(
            org=request.user.organization,
            data=serializer.validated_data,
            user=request.user,
        )
        return Response(PurchaseOrderSerializer(order).data, status=status.HTTP_201_CREATED)


class PurchaseOrderDetailView(RetrieveAPIView):
    serializer_class = PurchaseOrderSerializer

    def get_object(self):
        return get_order_by_id(self.request.user.organization, self.kwargs["pk"])


class ConfirmPurchaseOrderView(APIView):
    def post(self, request, pk):
        order = get_order_by_id(request.user.organization, pk)
        updated = confirm_purchase_order(order)
        return Response(PurchaseOrderSerializer(updated).data)


class CancelPurchaseOrderView(APIView):
    def post(self, request, pk):
        order = get_order_by_id(request.user.organization, pk)
        updated = cancel_purchase_order(order)
        return Response(PurchaseOrderSerializer(updated).data)
