from .models import Supplier


def create_supplier(org, data: dict) -> Supplier:
    return Supplier.objects.create(org=org, **data)


def update_supplier(supplier: Supplier, data: dict) -> Supplier:
    for field, value in data.items():
        setattr(supplier, field, value)
    supplier.save()
    return supplier


def delete_supplier(supplier: Supplier) -> None:
    supplier.delete()
