import pytest
from apps.suppliers.selectors import get_suppliers_for_org, get_supplier_by_id
from django.http import Http404
from conftest import OrganizationFactory, SupplierFactory

@pytest.mark.django_db
class TestSupplierIsolation:
    def test_get_suppliers_for_org_only_returns_own(self):
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()
        
        SupplierFactory(org=org1, name="Supplier 1")
        SupplierFactory(org=org2, name="Supplier 2")
        
        results = get_suppliers_for_org(org1)
        assert results.count() == 1
        assert results[0].name == "Supplier 1"

    def test_get_supplier_by_id_prevents_cross_org_access(self):
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()
        
        s2 = SupplierFactory(org=org2)
        
        with pytest.raises(Http404):
            get_supplier_by_id(org1, s2.id)


@pytest.mark.django_db
class TestSupplierAPI:
    def test_list_suppliers(self, auth_client, organization):
        SupplierFactory(org=organization, name="A")
        SupplierFactory(org=organization, name="B")
        
        response = auth_client.get("/api/suppliers/")
        assert response.status_code == 200
        assert response.data["count"] == 2

    def test_create_supplier(self, auth_client):
        payload = {"name": "New Supplier", "email": "test@supplier.com"}
        response = auth_client.post("/api/suppliers/", payload)
        
        assert response.status_code == 201
        assert response.data["name"] == "New Supplier"

    def test_update_supplier(self, auth_client, organization):
        supplier = SupplierFactory(org=organization, name="Old Name")
        response = auth_client.patch(f"/api/suppliers/{supplier.id}/", {"name": "New Name"})
        
        assert response.status_code == 200
        assert response.data["name"] == "New Name"

    def test_delete_supplier(self, auth_client, organization):
        supplier = SupplierFactory(org=organization)
        response = auth_client.delete(f"/api/suppliers/{supplier.id}/")
        
        assert response.status_code == 204
