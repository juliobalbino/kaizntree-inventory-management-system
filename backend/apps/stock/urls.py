from django.urls import path

from .api import StockDetailView, StockListCreateView

urlpatterns = [
    path("", StockListCreateView.as_view(), name="stock-list-create"),
    path("<uuid:pk>/", StockDetailView.as_view(), name="stock-detail"),
]
