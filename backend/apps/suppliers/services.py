from .models import Supplier


def create_supplier(user, data: dict) -> Supplier:
    return Supplier.objects.create(user=user, **data)


def update_supplier(supplier: Supplier, data: dict) -> Supplier:
    for field, value in data.items():
        setattr(supplier, field, value)
    supplier.save()
    return supplier


def delete_supplier(supplier: Supplier) -> None:
    supplier.delete()
