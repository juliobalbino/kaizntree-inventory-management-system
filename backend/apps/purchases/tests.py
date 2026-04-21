import pytest
from decimal import Decimal
from conftest import (
    ProductFactory, SupplierFactory, 
    PurchaseOrderFactory, PurchaseOrderItemFactory
)
from apps.stock.selectors import get_total_stock

@pytest.mark.django_db
class TestPurchaseAPI:
    def test_list_purchase_orders(self, auth_client, organization):
        PurchaseOrderFactory(org=organization)
        PurchaseOrderFactory(org=organization)
        
        response = auth_client.get("/api/purchases/")
        assert response.status_code == 200
        assert response.data["count"] == 2

    def test_create_purchase_order(self, auth_client, organization):
        product = ProductFactory(org=organization)
        supplier = SupplierFactory(org=organization)
        
        payload = {
            "supplier": str(supplier.id),
            "notes": "Test PO",
            "items": [
                {
                    "product": str(product.id),
                    "quantity": "10",
                    "unit_cost": "100.00"
                }
            ]
        }
        
        response = auth_client.post("/api/purchases/", payload, format="json")
        assert response.status_code == 201
        assert response.data["status"] == "pending"
        assert len(response.data["items"]) == 1

    def test_confirm_purchase_order(self, auth_client, organization):
        product = ProductFactory(org=organization)
        po = PurchaseOrderFactory(org=organization, status="pending")
        PurchaseOrderItemFactory(order=po, product=product, quantity=Decimal("5"))
        
        # Initial stock should be 0 (factories might add some, but let's assume 0 for clean products)
        initial_stock = get_total_stock(product)
        
        response = auth_client.post(f"/api/purchases/{po.id}/confirm/")
        assert response.status_code == 200
        assert response.data["status"] == "confirmed"
        
        assert get_total_stock(product) == initial_stock + Decimal("5")

    def test_cancel_purchase_order(self, auth_client, organization):
        po = PurchaseOrderFactory(org=organization, status="pending")
        response = auth_client.post(f"/api/purchases/{po.id}/cancel/")
        
        assert response.status_code == 200
        assert response.data["status"] == "cancelled"
