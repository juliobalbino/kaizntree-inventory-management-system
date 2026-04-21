from django.urls import path

from .api import CancelPurchaseOrderView, ConfirmPurchaseOrderView, PurchaseOrderDetailView, PurchaseOrderListCreateView

urlpatterns = [
    path("", PurchaseOrderListCreateView.as_view(), name="purchase-list-create"),
    path("<uuid:pk>/", PurchaseOrderDetailView.as_view(), name="purchase-detail"),
    path("<uuid:pk>/confirm/", ConfirmPurchaseOrderView.as_view(), name="purchase-confirm"),
    path("<uuid:pk>/cancel/", CancelPurchaseOrderView.as_view(), name="purchase-cancel"),
]
