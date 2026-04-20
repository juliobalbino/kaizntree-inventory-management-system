from django.shortcuts import get_object_or_404

from .models import Customer


def get_customers_for_user(user):
    return Customer.objects.filter(user=user).order_by("name")


def get_customer_by_id(user, customer_id):
    return get_object_or_404(Customer, id=customer_id, user=user)
