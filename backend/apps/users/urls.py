from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .api import AdminUserDetailView, AdminUserListCreateView, ChangePasswordView, MeView

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("me/change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
]

admin_urlpatterns = [
    path("users/", AdminUserListCreateView.as_view(), name="admin-user-list-create"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
]
