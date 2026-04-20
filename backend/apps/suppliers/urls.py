from django.urls import path

from .api import SupplierDetailView, SupplierListCreateView

urlpatterns = [
    path("", SupplierListCreateView.as_view(), name="supplier-list-create"),
    path("<uuid:pk>/", SupplierDetailView.as_view(), name="supplier-detail"),
]
