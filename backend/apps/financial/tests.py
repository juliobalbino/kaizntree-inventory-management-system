import pytest
from decimal import Decimal
from apps.financial.selectors import get_financial_summary, get_financial_timeline
from conftest import (
    OrganizationFactory, ProductFactory, 
    PurchaseOrderFactory, PurchaseOrderItemFactory,
    SalesOrderFactory, SalesOrderItemFactory
)

@pytest.mark.django_db
class TestFinancialSelectors:
    def test_get_financial_summary_calculation(self):
        org = OrganizationFactory()
        product = ProductFactory(org=org)
        
        # 1. Confirmed Purchase: Cost = 5 * 10 = 50
        po = PurchaseOrderFactory(org=org, status="confirmed")
        PurchaseOrderItemFactory(order=po, product=product, quantity=Decimal("5"), unit_cost=Decimal("10.00"))
        
        # 2. Confirmed Sale: Revenue = 2 * 30 = 60
        so = SalesOrderFactory(org=org, status="confirmed")
        SalesOrderItemFactory(order=so, product=product, quantity=Decimal("2"), unit_price=Decimal("30.00"))
        
        # 3. Pending orders (should be ignored)
        po_pending = PurchaseOrderFactory(org=org, status="pending")
        PurchaseOrderItemFactory(order=po_pending, product=product, quantity=Decimal("100"), unit_cost=Decimal("1.00"))
        
        summary = get_financial_summary(org)
        
        assert summary["total_revenue"] == Decimal("60.00")
        assert summary["total_cost"] == Decimal("50.00")
        assert summary["profit"] == Decimal("10.00")
        # margin = (10/60) * 100 = 16.6666...
        assert round(summary["margin"], 2) == Decimal("16.67")

    def test_get_financial_summary_with_product_filter(self):
        org = OrganizationFactory()
        p1 = ProductFactory(org=org)
        p2 = ProductFactory(org=org)
        
        # Sale for P1: 100
        so1 = SalesOrderFactory(org=org, status="confirmed")
        SalesOrderItemFactory(order=so1, product=p1, quantity=Decimal("1"), unit_price=Decimal("100.00"))
        
        # Sale for P2: 200
        so2 = SalesOrderFactory(org=org, status="confirmed")
        SalesOrderItemFactory(order=so2, product=p2, quantity=Decimal("1"), unit_price=Decimal("200.00"))
        
        # Summary for only P1
        summary = get_financial_summary(org, product_ids=[str(p1.id)])
        
        assert summary["total_revenue"] == Decimal("100.00")

    def test_get_financial_timeline_aggregation(self):
        org = OrganizationFactory()
        product = ProductFactory(org=org)
        
        # Create a sale in a confirmed order
        so = SalesOrderFactory(org=org, status="confirmed")
        SalesOrderItemFactory(order=so, product=product, quantity=Decimal("1"), unit_price=Decimal("50.00"))
        
        timeline = get_financial_timeline(org, group_by="month")
        
        assert len(timeline) > 0
        assert timeline[0]["revenue"] == Decimal("50.00")
        assert "profit" in timeline[0]
