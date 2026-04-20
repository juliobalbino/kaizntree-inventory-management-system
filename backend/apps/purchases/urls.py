from django.urls import path

from .api import ConfirmPurchaseOrderView, PurchaseOrderDetailView, PurchaseOrderListCreateView

urlpatterns = [
    path("", PurchaseOrderListCreateView.as_view(), name="purchase-list-create"),
    path("<uuid:pk>/", PurchaseOrderDetailView.as_view(), name="purchase-detail"),
    path("<uuid:pk>/confirm/", ConfirmPurchaseOrderView.as_view(), name="purchase-confirm"),
]
