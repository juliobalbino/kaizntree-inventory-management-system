from django.urls import path

from .api import StockDetailView, StockListCreateView, StockRemoveView

urlpatterns = [
    path("", StockListCreateView.as_view(), name="stock-list-create"),
    path("<uuid:pk>/", StockDetailView.as_view(), name="stock-detail"),
    path("<uuid:product_id>/remove/", StockRemoveView.as_view(), name="stock-remove"),
]
