from django.shortcuts import get_object_or_404

from .models import Customer


def get_customers_for_org(org):
    return Customer.objects.filter(org=org).order_by("name")


def get_customer_by_id(org, customer_id):
    return get_object_or_404(Customer, id=customer_id, org=org)
