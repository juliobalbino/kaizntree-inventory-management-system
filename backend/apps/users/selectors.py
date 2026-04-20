from django.shortcuts import get_object_or_404

from .models import User


def get_all_users():
    return User.objects.filter(is_admin=False).order_by("email")


def get_user_by_id(user_id):
    return get_object_or_404(User, id=user_id, is_admin=False)
