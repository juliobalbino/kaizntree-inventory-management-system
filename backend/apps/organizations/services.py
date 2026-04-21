import uuid

from django.db import transaction
from django.utils.text import slugify

from apps.users.models import User
from common.exceptions import BusinessRuleViolation

from .models import Organization


def _generate_slug(name: str) -> str:
    base = slugify(name) or "org"
    return f"{base}-{str(uuid.uuid4())[:8]}"


def create_organization(name: str, user) -> Organization:
    slug = _generate_slug(name)
    with transaction.atomic():
        org = Organization.objects.create(name=name, slug=slug)
        user.organization = org
        user.role = "owner"
        user.save(update_fields=["organization", "role"])
    return org


def create_organization_by_admin(name: str, owner_email: str) -> Organization:
    owner = User.objects.get(email=owner_email, is_admin=False)
    slug = _generate_slug(name)
    with transaction.atomic():
        org = Organization.objects.create(name=name, slug=slug)
        if owner.organization_id is None:
            owner.organization = org
            owner.role = "owner"
            owner.save(update_fields=["organization", "role"])
    return org


def update_organization(org: Organization, data: dict) -> Organization:
    for field, value in data.items():
        setattr(org, field, value)
    org.save()
    return org


def delete_organization(org: Organization) -> None:
    org.delete()


def add_member_to_organization(org: Organization, data: dict) -> User:
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

    if user.organization_id is not None:
        if user.organization_id == org.id:
            raise BusinessRuleViolation("User is already a member of this organization.")
        else:
            raise BusinessRuleViolation("User already belongs to another organization.")

    with transaction.atomic():
        user.organization = org
        user.role = role
        user.save(update_fields=["organization", "role"])

    return user


def update_member_role(user: User, role: str) -> User:
    if (
        user.role == "owner"
        and role == "member"
        and User.objects.filter(
            organization=user.organization, role="owner"
        ).count()
        <= 1
    ):
        raise BusinessRuleViolation("Cannot remove the last owner of the organization.")

    user.role = role
    user.save(update_fields=["role", "updated_at"])
    return user


def remove_member(user: User) -> None:
    if (
        user.role == "owner"
        and User.objects.filter(
            organization=user.organization, role="owner"
        ).count()
        <= 1
    ):
        raise BusinessRuleViolation("Cannot remove the last owner of the organization.")

    user.organization = None
    user.role = None
    user.save(update_fields=["organization", "role", "updated_at"])
