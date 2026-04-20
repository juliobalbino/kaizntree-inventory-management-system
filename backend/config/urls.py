from django.contrib import admin
from django.urls import path, include

from apps.organizations.urls import admin_urlpatterns as org_admin_urls
from apps.users.urls import admin_urlpatterns as user_admin_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/organizations/", include("apps.organizations.urls")),
    path("api/products/", include("apps.products.urls")),
    path("api/stock/", include("apps.stock.urls")),
    path("api/suppliers/", include("apps.suppliers.urls")),
    path("api/customers/", include("apps.customers.urls")),
    path("api/purchases/", include("apps.purchases.urls")),
    path("api/sales/", include("apps.sales.urls")),
    path("api/financial/", include("apps.financial.urls")),
    path("api/admin/", include(user_admin_urls + org_admin_urls)),
]
