from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/products/", include("apps.products.urls")),
    path("api/stock/", include("apps.stock.urls")),
    path("api/purchases/", include("apps.purchases.urls")),
    path("api/sales/", include("apps.sales.urls")),
    path("api/financial/", include("apps.financial.urls")),
]
