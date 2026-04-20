from django.urls import path

from .api import CustomerDetailView, CustomerListCreateView

urlpatterns = [
    path("", CustomerListCreateView.as_view(), name="customer-list-create"),
    path("<uuid:pk>/", CustomerDetailView.as_view(), name="customer-detail"),
]
