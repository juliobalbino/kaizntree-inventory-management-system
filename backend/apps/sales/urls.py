from django.urls import path

from .api import CancelSalesOrderView, ConfirmSalesOrderView, SalesOrderDetailView, SalesOrderListCreateView

urlpatterns = [
    path("", SalesOrderListCreateView.as_view(), name="sales-list-create"),
    path("<uuid:pk>/", SalesOrderDetailView.as_view(), name="sales-detail"),
    path("<uuid:pk>/confirm/", ConfirmSalesOrderView.as_view(), name="sales-confirm"),
    path("<uuid:pk>/cancel/", CancelSalesOrderView.as_view(), name="sales-cancel"),
]
