from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .selectors import get_order_by_id, get_orders_for_org
from .serializers import PurchaseOrderSerializer, PurchaseOrderWriteSerializer
from .services import cancel_purchase_order, confirm_purchase_order, create_purchase_order


class PurchaseOrderListCreateView(ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == "POST":
            return PurchaseOrderWriteSerializer
        return PurchaseOrderSerializer

    def get_queryset(self):
        return get_orders_for_org(self.request.user.organization)

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
