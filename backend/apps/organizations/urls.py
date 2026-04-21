from django.urls import path

from .api import (
    AdminOrganizationDetailView,
    AdminOrganizationListCreateView,
    MemberDetailView,
    MemberListCreateView,
    OrganizationDetailView,
    OrganizationListView,
)

urlpatterns = [
    path("", OrganizationListView.as_view(), name="organization-list"),
    path("<uuid:pk>/", OrganizationDetailView.as_view(), name="organization-detail"),
    path("<uuid:pk>/members/", MemberListCreateView.as_view(), name="member-list-create"),
    path("<uuid:pk>/members/<int:user_id>/", MemberDetailView.as_view(), name="member-detail"),
]

admin_urlpatterns = [
    path("organizations/", AdminOrganizationListCreateView.as_view(), name="admin-org-list-create"),
    path("organizations/<uuid:pk>/", AdminOrganizationDetailView.as_view(), name="admin-org-detail"),
]
