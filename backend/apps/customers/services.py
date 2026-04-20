from .models import Customer


def create_customer(org, data: dict) -> Customer:
    return Customer.objects.create(org=org, **data)


def update_customer(customer: Customer, data: dict) -> Customer:
    for field, value in data.items():
        setattr(customer, field, value)
    customer.save()
    return customer


def delete_customer(customer: Customer) -> None:
    customer.delete()
