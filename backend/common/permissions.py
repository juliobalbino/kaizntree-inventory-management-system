from rest_framework.permissions import BasePermission

from apps.organizations.models import OrganizationMembership


class HasActiveOrganization(BasePermission):
    message = "No active organization. Create or join an organization first."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.current_organization_id is not None
        )


class IsOrganizationOwner(BasePermission):
    message = "Only organization owners can perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        org_id = view.kwargs.get("pk") or view.kwargs.get("org_pk")
        if not org_id:
            return False
        return OrganizationMembership.objects.filter(
            user=request.user, organization_id=org_id, role="owner"
        ).exists()


class IsAdmin(BasePermission):
    message = "Only admin users can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_admin
        )
