import random
from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.organizations.models import Organization
from apps.products.models import Product
from apps.suppliers.models import Supplier
from apps.customers.models import Customer
from apps.purchases.models import PurchaseOrder, PurchaseOrderItem
from apps.sales.models import SalesOrder, SalesOrderItem
from apps.purchases.services import confirm_purchase_order
from apps.sales.services import confirm_sales_order

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with test data'

    def handle(self, *args, **options):
        self.stdout.write('Starting data seeding...')

        drink_items = [
            ('Arabica Special Coffee', 'KG', 25.00, 45.00),
            ('Imported Green Tea', 'unit', 12.00, 25.00),
            ('Orange Juice 1L', 'L', 6.00, 12.00),
            ('IPA Beer 500ml', 'mL', 8.00, 18.00),
            ('Reserve Red Wine', 'unit', 40.00, 95.00),
            ('Premium Mineral Water', 'mL', 1.00, 4.00),
            ('Craft Soda', 'unit', 4.00, 10.00),
            ('Natural Energy Drink', 'unit', 6.00, 15.00),
            ('Fruit Kombucha', 'unit', 8.00, 18.00),
            ('Premium Gin', 'unit', 50.00, 130.00),
        ]

        snack_items = [
            ('Natural Sandwich', 'unit', 8.00, 18.00),
            ('Mixed Nuts', 'g', 12.00, 28.00),
            ('Fit Cereal Bar', 'unit', 2.00, 6.00),
            ('Vanilla Cookie', 'unit', 4.00, 10.00),
            ('Craft Potato Chips', 'unit', 6.00, 14.00),
            ('70% Cocoa Chocolate', 'unit', 7.00, 16.00),
            ('Cassava Biscuit', 'unit', 3.00, 8.00),
            ('Brie Cheese 200g', 'unit', 18.00, 42.00),
            ('Parma Ham 100g', 'g', 12.00, 32.00),
            ('Red Berry Jam', 'unit', 10.00, 24.00),
        ]

        orgs_data = [
            ('Gourmet Delights', 'gourmet-delights', snack_items),
            ('Premium Beverages', 'premium-beverages', drink_items),
        ]

        for org_name, org_slug, items_list in orgs_data:
            org, created = Organization.objects.get_or_create(slug=org_slug, defaults={'name': org_name})
            if created:
                self.stdout.write(self.style.SUCCESS(f'Organization created: {org_name}'))
            
            users_info = [
                (f'owner@{org_slug}.com', 'owner', 'Owner'),
                (f'member@{org_slug}.com', 'member', 'Member'),
            ]
            
            org_users = []
            for email, role, first_name in users_info:
                user, u_created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'first_name': first_name,
                        'last_name': 'Test',
                        'role': role,
                        'organization': org,
                        'is_active': True
                    }
                )
                if u_created:
                    user.set_password('password123')
                    user.save()
                    self.stdout.write(f'  User created: {email} (Password: password123)')
                org_users.append(user)

            owner = org_users[0]

            suppliers = []
            for i in range(1, 3):
                supplier, s_created = Supplier.objects.get_or_create(
                    org=org,
                    name=f'Supplier {i} of {org_slug}',
                    defaults={'email': f'contact@supplier{i}.{org_slug}.com', 'phone': f'1199999000{i}'}
                )
                suppliers.append(supplier)

            customers = []
            for i in range(1, 3):
                customer, c_created = Customer.objects.get_or_create(
                    org=org,
                    name=f'Customer {i} of {org_slug}',
                    defaults={'email': f'customer{i}@gmail.com', 'phone': f'1188888000{i}'}
                )
                customers.append(customer)

            products = []
            for i, (p_name, p_unit, p_cost, p_price) in enumerate(items_list):
                product, p_created = Product.objects.get_or_create(
                    org=org,
                    sku=f'{org_slug[:3].upper()}-{str(i+1).zfill(3)}',
                    defaults={
                        'name': p_name,
                        'unit': p_unit.lower(),
                        'unit_cost': Decimal(str(p_cost)),
                        'unit_price': Decimal(str(p_price))
                    }
                )
                products.append(product)

            if not PurchaseOrder.objects.filter(org=org).exists():
                for i in range(3):
                    date = timezone.now() - timedelta(days=i+10)
                    po = PurchaseOrder.objects.create(
                        org=org,
                        supplier=random.choice(suppliers),
                        created_by=owner,
                        status='pending'
                    )
                    PurchaseOrder.objects.filter(id=po.id).update(created_at=date)
                    
                    for p in products:
                        PurchaseOrderItem.objects.create(
                            order=po,
                            product=p,
                            quantity=Decimal("50.00"),
                            unit_cost=p.unit_cost
                        )
                    
                    confirm_purchase_order(po)
                    self.stdout.write(f'  PO #{po.id} confirmed for {org_name}')

            if not SalesOrder.objects.filter(org=org).exists():
                for i in range(3):
                    date = timezone.now() - timedelta(days=i)
                    so = SalesOrder.objects.create(
                        org=org,
                        customer=random.choice(customers),
                        created_by=owner,
                        status='pending'
                    )
                    SalesOrder.objects.filter(id=so.id).update(created_at=date)
                    
                    for idx, p in enumerate(products):
                        if idx < 7:
                            qty = random.randint(35, 45)
                        else:
                            qty = random.randint(1, 3)
                            
                        SalesOrderItem.objects.create(
                            order=so,
                            product=p,
                            quantity=Decimal(str(qty)),
                            unit_price=p.unit_price
                        )
                    
                    confirm_sales_order(so)
                    self.stdout.write(f'  SO #{so.id} confirmed for {org_name}')

        self.stdout.write(self.style.SUCCESS('Seeding finished successfully!'))
