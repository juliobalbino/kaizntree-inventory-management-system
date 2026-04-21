from django.urls import path

from .api import FinancialSummaryView, FinancialTimelineView, ProductFinancialView

urlpatterns = [
    path("summary/", FinancialSummaryView.as_view(), name="financial-summary"),
    path("products/", ProductFinancialView.as_view(), name="financial-products"),
    path("timeline/", FinancialTimelineView.as_view(), name="financial-timeline"),
]
