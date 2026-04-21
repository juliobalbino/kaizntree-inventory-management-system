import pytest
from decimal import Decimal
from conftest import (
    ProductFactory, CustomerFactory, 
    SalesOrderFactory, SalesOrderItemFactory,
    StockFactory
)
from apps.stock.selectors import get_total_stock

@pytest.mark.django_db
class TestSalesAPI:
    def test_list_sales_orders(self, auth_client, organization):
        SalesOrderFactory(org=organization)
        SalesOrderFactory(org=organization)
        
        response = auth_client.get("/api/sales/")
        assert response.status_code == 200
        assert response.data["count"] == 2

    def test_create_sales_order(self, auth_client, organization):
        product = ProductFactory(org=organization)
        customer = CustomerFactory(org=organization)
        
        payload = {
            "customer": str(customer.id),
            "notes": "Test SO",
            "items": [
                {
                    "product": str(product.id),
                    "quantity": "5",
                    "unit_price": "150.00"
                }
            ]
        }
        
        response = auth_client.post("/api/sales/", payload, format="json")
        assert response.status_code == 201
        assert response.data["status"] == "pending"
        assert len(response.data["items"]) == 1

    def test_confirm_sales_order_deducts_stock(self, auth_client, organization):
        product = ProductFactory(org=organization)
        # Add stock so we can confirm
        StockFactory(product=product, quantity=Decimal("10"))
        
        so = SalesOrderFactory(org=organization, status="pending")
        SalesOrderItemFactory(order=so, product=product, quantity=Decimal("3"))
        
        response = auth_client.post(f"/api/sales/{so.id}/confirm/")
        assert response.status_code == 200
        assert response.data["status"] == "confirmed"
        
        assert get_total_stock(product) == Decimal("7")

    def test_cancel_sales_order(self, auth_client, organization):
        so = SalesOrderFactory(org=organization, status="pending")
        response = auth_client.post(f"/api/sales/{so.id}/cancel/")
        
        assert response.status_code == 200
        assert response.data["status"] == "cancelled"
