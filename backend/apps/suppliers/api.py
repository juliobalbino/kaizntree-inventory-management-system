from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response

from .selectors import get_supplier_by_id, get_suppliers_for_user
from .serializers import SupplierSerializer
from .services import create_supplier, delete_supplier, update_supplier


class SupplierListCreateView(ListCreateAPIView):
    serializer_class = SupplierSerializer

    def get_queryset(self):
        return get_suppliers_for_user(self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        supplier = create_supplier(user=request.user, data=serializer.validated_data)
        return Response(SupplierSerializer(supplier).data, status=status.HTTP_201_CREATED)


class SupplierDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = SupplierSerializer
    http_method_names = ["get", "patch", "delete"]

    def get_object(self):
        return get_supplier_by_id(self.request.user, self.kwargs["pk"])

    def update(self, request, *args, **kwargs):
        supplier = self.get_object()
        serializer = self.get_serializer(supplier, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = update_supplier(supplier, serializer.validated_data)
        return Response(SupplierSerializer(updated).data)

    def destroy(self, request, *args, **kwargs):
        delete_supplier(self.get_object())
        return Response(status=status.HTTP_204_NO_CONTENT)
