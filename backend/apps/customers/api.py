from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response

from .selectors import get_customer_by_id, get_customers_for_org
from .serializers import CustomerSerializer
from .services import create_customer, delete_customer, update_customer


class CustomerListCreateView(ListCreateAPIView):
    serializer_class = CustomerSerializer

    def get_queryset(self):
        return get_customers_for_org(self.request.user.organization)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = create_customer(org=request.user.organization, data=serializer.validated_data)
        return Response(CustomerSerializer(customer).data, status=status.HTTP_201_CREATED)


class CustomerDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer
    http_method_names = ["get", "patch", "delete"]

    def get_object(self):
        return get_customer_by_id(self.request.user.organization, self.kwargs["pk"])

    def update(self, request, *args, **kwargs):
        customer = self.get_object()
        serializer = self.get_serializer(customer, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = update_customer(customer, serializer.validated_data)
        return Response(CustomerSerializer(updated).data)

    def destroy(self, request, *args, **kwargs):
        delete_customer(self.get_object())
        return Response(status=status.HTTP_204_NO_CONTENT)
