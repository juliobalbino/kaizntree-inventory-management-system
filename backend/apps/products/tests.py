import pytest
from apps.products.selectors import get_products_for_org, get_product_by_id
from django.http import Http404
from conftest import OrganizationFactory, ProductFactory

@pytest.mark.django_db
class TestProductIsolation:
    def test_get_products_for_org_only_returns_own(self):
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()
        
        ProductFactory(org=org1, name="Product 1")
        ProductFactory(org=org2, name="Product 2")
        
        results = get_products_for_org(org1)
        assert results.count() == 1
        assert results[0].name == "Product 1"

    def test_get_product_by_id_prevents_cross_org_access(self):
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()
        
        p2 = ProductFactory(org=org2)
        
        with pytest.raises(Http404):
            get_product_by_id(org1, p2.id)


@pytest.mark.django_db
class TestProductAPI:
    def test_list_products(self, auth_client, organization):
        ProductFactory(org=organization, name="P1")
        ProductFactory(org=organization, name="P2")
        
        response = auth_client.get("/api/products/")
        assert response.status_code == 200
        assert response.data["count"] == 2

    def test_create_product(self, auth_client):
        payload = {
            "name": "New Product",
            "sku": "NEW-SKU",
            "unit": "kg",
            "unit_cost": "15.00",
            "unit_price": "25.00"
        }
        response = auth_client.post("/api/products/", payload)
        
        assert response.status_code == 201
        assert response.data["sku"] == "NEW-SKU"

    def test_update_product(self, auth_client, organization):
        product = ProductFactory(org=organization, sku="OLD-SKU")
        response = auth_client.patch(f"/api/products/{product.id}/", {"sku": "UPDATED-SKU"})
        
        assert response.status_code == 200
        assert response.data["sku"] == "UPDATED-SKU"

    def test_delete_product(self, auth_client, organization):
        product = ProductFactory(org=organization)
        response = auth_client.delete(f"/api/products/{product.id}/")
        
        assert response.status_code == 204
