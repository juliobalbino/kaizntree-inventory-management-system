import pytest
from rest_framework.test import APIClient
from apps.organizations.models import Organization
from apps.users.models import User
import factory
from factory.django import DjangoModelFactory
from decimal import Decimal

from apps.products.models import Product
from apps.suppliers.models import Supplier
from apps.customers.models import Customer
from apps.purchases.models import PurchaseOrder, PurchaseOrderItem
from apps.sales.models import SalesOrder, SalesOrderItem

# --- Factories ---

class OrganizationFactory(DjangoModelFactory):
    class Meta:
        model = Organization
    name = factory.Faker("company")
    slug = factory.Faker("slug")

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
    email = factory.Faker("email")
    organization = factory.SubFactory(OrganizationFactory)
    role = "owner"
    is_admin = False

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        password = extracted or "password123"
        self.set_password(password)

class ProductFactory(DjangoModelFactory):
    class Meta:
        model = Product
    org = factory.SubFactory(OrganizationFactory)
    name = factory.Faker("word")
    sku = factory.Sequence(lambda n: f"SKU-{n}")
    unit = "unit"
    unit_cost = Decimal("10.00")
    unit_price = Decimal("20.00")

class SupplierFactory(DjangoModelFactory):
    class Meta:
        model = Supplier
    org = factory.SubFactory(OrganizationFactory)
    name = factory.Faker("company")

class CustomerFactory(DjangoModelFactory):
    class Meta:
        model = Customer
    org = factory.SubFactory(OrganizationFactory)
    name = factory.Faker("name")

class PurchaseOrderFactory(DjangoModelFactory):
    class Meta:
        model = PurchaseOrder
    org = factory.SubFactory(OrganizationFactory)
    supplier = factory.SubFactory(SupplierFactory, org=factory.SelfAttribute("..org"))
    status = "pending"

class PurchaseOrderItemFactory(DjangoModelFactory):
    class Meta:
        model = PurchaseOrderItem
    order = factory.SubFactory(PurchaseOrderFactory)
    product = factory.SubFactory(ProductFactory, org=factory.SelfAttribute("..order.org"))
    quantity = Decimal("5")
    unit_cost = Decimal("10.00")

class SalesOrderFactory(DjangoModelFactory):
    class Meta:
        model = SalesOrder
    org = factory.SubFactory(OrganizationFactory)
    customer = factory.SubFactory(CustomerFactory, org=factory.SelfAttribute("..org"))
    status = "pending"

class SalesOrderItemFactory(DjangoModelFactory):
    class Meta:
        model = SalesOrderItem
    order = factory.SubFactory(SalesOrderFactory)
    product = factory.SubFactory(ProductFactory, org=factory.SelfAttribute("..order.org"))
    quantity = Decimal("2")
    unit_price = Decimal("25.00")

from apps.stock.models import Stock

class StockFactory(DjangoModelFactory):
    class Meta:
        model = Stock
    product = factory.SubFactory(ProductFactory)
    quantity = Decimal("10")
    source = "manual"

# --- Fixtures ---

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def organization():
    return OrganizationFactory()

@pytest.fixture
def user(organization):
    return UserFactory(organization=organization)

@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client

@pytest.fixture
def other_organization():
    return OrganizationFactory()

@pytest.fixture
def other_user(other_organization):
    return UserFactory(organization=other_organization)
