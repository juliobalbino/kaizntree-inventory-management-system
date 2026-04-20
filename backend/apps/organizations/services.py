import uuid

from django.db import transaction
from django.utils.text import slugify

from apps.users.models import User
from common.exceptions import BusinessRuleViolation

from .models import Organization, OrganizationMembership


def _generate_slug(name: str) -> str:
    base = slugify(name) or "org"
    return f"{base}-{str(uuid.uuid4())[:8]}"


def create_organization(name: str, user) -> Organization:
    slug = _generate_slug(name)
    with transaction.atomic():
        org = Organization.objects.create(name=name, slug=slug)
        OrganizationMembership.objects.create(user=user, organization=org, role="owner")
        user.current_organization = org
        user.save(update_fields=["current_organization"])
    return org


def update_organization(org: Organization, data: dict) -> Organization:
    for field, value in data.items():
        setattr(org, field, value)
    org.save()
    return org


def add_member_to_organization(org: Organization, data: dict) -> OrganizationMembership:
    email = data["email"]
    role = data.get("role", "member")

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "first_name": data.get("first_name", ""),
            "last_name": data.get("last_name", ""),
        },
    )
    if created:
        user.set_password(data["password"])
        user.save(update_fields=["password"])

    if OrganizationMembership.objects.filter(user=user, organization=org).exists():
        raise BusinessRuleViolation("User is already a member of this organization.")

    with transaction.atomic():
        membership = OrganizationMembership.objects.create(
            user=user, organization=org, role=role
        )
        if user.current_organization_id is None:
            user.current_organization = org
            user.save(update_fields=["current_organization"])

    return membership


def update_member_role(membership: OrganizationMembership, role: str) -> OrganizationMembership:
    if (
        membership.role == "owner"
        and role == "member"
        and OrganizationMembership.objects.filter(
            organization=membership.organization, role="owner"
        ).count()
        <= 1
    ):
        raise BusinessRuleViolation("Cannot remove the last owner of the organization.")

    membership.role = role
    membership.save(update_fields=["role", "updated_at"])
    return membership


def remove_member(membership: OrganizationMembership) -> None:
    if (
        membership.role == "owner"
        and OrganizationMembership.objects.filter(
            organization=membership.organization, role="owner"
        ).count()
        <= 1
    ):
        raise BusinessRuleViolation("Cannot remove the last owner of the organization.")

    user = membership.user
    org = membership.organization
    membership.delete()

    if user.current_organization_id == org.id:
        next_org = Organization.objects.filter(memberships__user=user).first()
        user.current_organization = next_org
        user.save(update_fields=["current_organization"])
