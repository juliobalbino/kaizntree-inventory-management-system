from django.shortcuts import get_object_or_404

from apps.users.models import User
from .models import Organization


def get_organizations_for_user(user):
    if user.organization_id:
        return Organization.objects.filter(id=user.organization_id)
    return Organization.objects.none()


def get_organization_by_id(user, org_id):
    if str(user.organization_id) != str(org_id):
        from django.http import Http404
        raise Http404("Organization not found or access denied")
    return get_object_or_404(Organization, id=org_id)


def is_organization_owner(user, org) -> bool:
    return user.organization_id == org.id and user.role == "owner"


def get_members_for_organization(org):
    return User.objects.filter(organization=org).order_by("email")


def get_membership_by_user_id(org, user_id):
    return get_object_or_404(
        User,
        organization=org,
        id=user_id,
    )


def get_all_organizations():
    return Organization.objects.all().order_by("name")


def get_organization_by_id_admin(org_id):
    return get_object_or_404(Organization, id=org_id)
