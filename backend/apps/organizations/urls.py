from django.urls import path

from .api import MemberDetailView, MemberListCreateView, OrganizationDetailView, OrganizationListCreateView

urlpatterns = [
    path("", OrganizationListCreateView.as_view(), name="organization-list-create"),
    path("<uuid:pk>/", OrganizationDetailView.as_view(), name="organization-detail"),
    path("<uuid:pk>/members/", MemberListCreateView.as_view(), name="member-list-create"),
    path("<uuid:pk>/members/<uuid:user_id>/", MemberDetailView.as_view(), name="member-detail"),
]
