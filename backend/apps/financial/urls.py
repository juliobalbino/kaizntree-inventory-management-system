from django.urls import path

from .api import FinancialSummaryView, ProductFinancialView

urlpatterns = [
    path("summary/", FinancialSummaryView.as_view(), name="financial-summary"),
    path("products/", ProductFinancialView.as_view(), name="financial-products"),
]
