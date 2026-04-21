import pytest
from decimal import Decimal
from apps.stock.services import add_stock_manually, remove_stock_manually, deduct_stock
from apps.stock.selectors import get_total_stock
from common.exceptions import InsufficientStockError
from conftest import ProductFactory

@pytest.mark.django_db
class TestStockServices:
    def test_add_stock_manually(self):
        product = ProductFactory()
        add_stock_manually(product, Decimal("10.5"))
        assert get_total_stock(product) == Decimal("10.5")

    def test_remove_stock_manually_success(self):
        product = ProductFactory()
        add_stock_manually(product, Decimal("20"))
        remove_stock_manually(product, Decimal("5"))
        assert get_total_stock(product) == Decimal("15")

    def test_remove_stock_manually_insufficient(self):
        product = ProductFactory()
        add_stock_manually(product, Decimal("10"))
        
        with pytest.raises(InsufficientStockError):
            remove_stock_manually(product, Decimal("11"))

    def test_deduct_stock_insufficient(self):
        product = ProductFactory()
        # No stock added
        with pytest.raises(InsufficientStockError):
            deduct_stock(product, Decimal("1"))


@pytest.mark.django_db
class TestStockAPI:
    def test_list_stock_entries(self, auth_client, organization):
        product = ProductFactory(org=organization)
        add_stock_manually(product, Decimal("10"))
        
        response = auth_client.get("/api/stock/")
        assert response.status_code == 200
        assert response.data["count"] >= 1

    def test_add_stock_api(self, auth_client, organization):
        product = ProductFactory(org=organization)
        payload = {"product": str(product.id), "quantity": "25.5"}
        
        response = auth_client.post("/api/stock/", payload)
        assert response.status_code == 201
        assert Decimal(response.data["quantity"]) == Decimal("25.5")

    def test_remove_stock_api(self, auth_client, organization):
        product = ProductFactory(org=organization)
        add_stock_manually(product, Decimal("100"))
        
        payload = {"quantity": "30"}
        response = auth_client.post(f"/api/stock/{product.id}/remove/", payload)
        
        assert response.status_code == 201
        assert Decimal(response.data["quantity"]) == Decimal("-30")
        assert get_total_stock(product) == Decimal("70")
