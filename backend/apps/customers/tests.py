import pytest
from apps.customers.selectors import get_customers_for_org, get_customer_by_id
from django.http import Http404
from conftest import OrganizationFactory, CustomerFactory

@pytest.mark.django_db
class TestCustomerIsolation:
    def test_get_customers_for_org_only_returns_own(self):
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()
        
        CustomerFactory(org=org1, name="Customer 1")
        CustomerFactory(org=org2, name="Customer 2")
        
        results = get_customers_for_org(org1)
        assert results.count() == 1
        assert results[0].name == "Customer 1"

    def test_get_customer_by_id_prevents_cross_org_access(self):
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()
        
        c2 = CustomerFactory(org=org2)
        
        with pytest.raises(Http404):
            get_customer_by_id(org1, c2.id)


@pytest.mark.django_db
class TestCustomerAPI:
    def test_list_customers(self, auth_client, organization):
        CustomerFactory(org=organization, name="C1")
        CustomerFactory(org=organization, name="C2")
        
        response = auth_client.get("/api/customers/")
        assert response.status_code == 200
        assert response.data["count"] == 2

    def test_create_customer(self, auth_client):
        payload = {"name": "New Customer", "email": "test@customer.com"}
        response = auth_client.post("/api/customers/", payload)
        
        assert response.status_code == 201
        assert response.data["name"] == "New Customer"

    def test_update_customer(self, auth_client, organization):
        customer = CustomerFactory(org=organization, name="Old Name")
        response = auth_client.patch(f"/api/customers/{customer.id}/", {"name": "New Name"})
        
        assert response.status_code == 200
        assert response.data["name"] == "New Name"

    def test_delete_customer(self, auth_client, organization):
        customer = CustomerFactory(org=organization)
        response = auth_client.delete(f"/api/customers/{customer.id}/")
        
        assert response.status_code == 204
