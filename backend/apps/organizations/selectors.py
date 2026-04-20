from django.shortcuts import get_object_or_404

from apps.users.models import User

from .models import Organization, OrganizationMembership


def get_organizations_for_user(user):
    return Organization.objects.filter(memberships__user=user).order_by("name")


def get_organization_by_id(user, org_id):
    return get_object_or_404(Organization, id=org_id, memberships__user=user)


def is_organization_owner(user, org) -> bool:
    return OrganizationMembership.objects.filter(
        user=user, organization=org, role="owner"
    ).exists()


def get_members_for_organization(org):
    return OrganizationMembership.objects.filter(
        organization=org
    ).select_related("user").order_by("user__email")


def get_membership_by_user_id(org, user_id):
    return get_object_or_404(
        OrganizationMembership,
        organization=org,
        user_id=user_id,
    )


def get_all_organizations():
    return Organization.objects.all().order_by("name")


def get_organization_by_id_admin(org_id):
    return get_object_or_404(Organization, id=org_id)
