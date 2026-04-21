from django.shortcuts import get_object_or_404

from .models import User


def get_all_users():
    return User.objects.filter(is_admin=False).order_by("email")


def get_users_for_org(org):
    return User.objects.filter(organization=org, is_admin=False).order_by("email")


def get_user_by_id(user_id, org=None):
    if org:
        return get_object_or_404(User, id=user_id, organization=org, is_admin=False)
    return get_object_or_404(User, id=user_id, is_admin=False)
