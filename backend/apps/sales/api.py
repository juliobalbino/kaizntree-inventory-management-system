from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .selectors import get_order_by_id, get_orders_for_org
from .serializers import SalesOrderSerializer, SalesOrderWriteSerializer
from .services import confirm_sales_order, create_sales_order


class SalesOrderListCreateView(ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == "POST":
            return SalesOrderWriteSerializer
        return SalesOrderSerializer

    def get_queryset(self):
        return get_orders_for_org(self.request.user.current_organization)

    def create(self, request, *args, **kwargs):
        serializer = SalesOrderWriteSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = create_sales_order(
            org=request.user.current_organization,
            data=serializer.validated_data,
            user=request.user,
        )
        return Response(SalesOrderSerializer(order).data, status=status.HTTP_201_CREATED)


class SalesOrderDetailView(RetrieveAPIView):
    serializer_class = SalesOrderSerializer

    def get_object(self):
        return get_order_by_id(self.request.user.current_organization, self.kwargs["pk"])


class ConfirmSalesOrderView(APIView):
    def post(self, request, pk):
        order = get_order_by_id(request.user.current_organization, pk)
        updated = confirm_sales_order(order)
        return Response(SalesOrderSerializer(updated).data)
