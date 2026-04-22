# Inventory Management System — Plan

## Objective
Build a production-quality inventory management application for Food & Beverages CPG brands with a Django backend and React frontend. Covers all mandatory requirements: products, stock, purchase/sales orders, financial tracking, authentication, and role-based access control.

---

## Scope

### Mandatory Features
- Product registration (name, description, SKU, unit, unit_cost, unit_price)
- Stock management (append-only log)
- Stock input via:
  - Manual entry
  - Purchase order confirmation
- Product sales via sales orders (decrements stock)
- Financial tracking:
  - Total cost (purchase orders + manual stock)
  - Total revenue
  - Profit
  - Margin (%)
  - Timeline breakdown (day/month/year)
- JWT Authentication
- Organization-based data isolation (not per-user)
- Role-based access: Admin / Owner / Member

---

## Architecture

- **Backend:** Django 6 + DRF + drf-spectacular (OpenAPI)
- **Frontend:** React 18 + Vite + TypeScript + Mantine v7 + TanStack Query + Tailwind CSS
- **Database:** PostgreSQL
- **Auth:** JWT via djangorestframework-simplejwt
- **Containerization:** Docker + Docker Compose
- **Testing:** pytest + pytest-django + factory-boy

---

## User Roles

| Role | Description |
|---|---|
| `is_admin=True` | Admin — CRUD users/orgs only; no access to business data |
| `role="owner"` | Owner — full business data access + member management |
| `role="member"` | Member — full business data access within their org |

---

## Models

### `common.BaseModel`
```
id          UUID (PK, default=uuid4)
created_at  datetime (auto)
updated_at  datetime (auto)
```

### `users.User` (extends AbstractUser)
```
email           EmailField (unique, USERNAME_FIELD)
is_admin        boolean (default=False)
organization    FK → Organization (null=True, SET_NULL)
role            choices: owner | member (null=True)
```

### `organizations.Organization`
```
name    str(255)
slug    SlugField(100), unique (auto-generated from name)
```

### `products.Product`
```
org         FK → Organization
name        str(255)
description text (blank allowed)
sku         str(100), unique per org (unique_together: org + sku)
unit        choices: kg | g | L | mL | unit
unit_cost   Decimal(12,2), nullable
unit_price  Decimal(12,2), nullable
```

### `stock.Stock`
```
product     FK → Product
quantity    Decimal(12,3)  # negative for deductions
source      choices: manual | purchase_order | sales_order
reference   UUID (nullable — FK to related order)
```

### `suppliers.Supplier`
```
org         FK → Organization
name        str(255)
email       str(254), optional
phone       str(20), optional
address     text, optional
notes       text, optional
```

### `customers.Customer`
```
org         FK → Organization
name        str(255)
email       str(254), optional
phone       str(20), optional
address     text, optional
notes       text, optional
```

### `purchases.PurchaseOrder`
```
org         FK → Organization
supplier    FK → Supplier (null=True, blank=True, SET_NULL)
created_by  FK → User (null=True, SET_NULL)
status      choices: pending | confirmed | cancelled (default: pending)
notes       text (blank allowed)
```

### `purchases.PurchaseOrderItem`
```
order       FK → PurchaseOrder
product     FK → Product
quantity    Decimal(12,3)
unit_cost   Decimal(12,2)
```

### `sales.SalesOrder`
```
org         FK → Organization
customer    FK → Customer (null=True, blank=True, SET_NULL)
created_by  FK → User (null=True, SET_NULL)
status      choices: pending | confirmed | cancelled (default: pending)
notes       text (blank allowed)
```

### `sales.SalesOrderItem`
```
order       FK → SalesOrder
product     FK → Product
quantity    Decimal(12,3)
unit_price  Decimal(12,2)
```

> `financial` has no models — its selectors aggregate from purchases, sales, and stock.

---

## Business Rules

- **Admin only creates users/orgs:** No public registration. Only admin can create new users and organizations.
- **Admin creates owners:** When admin creates an org, they specify the owner user.
- **Admin cannot access business data:** Admin sees only Users and Organizations pages.
- **Owner CRUD of members:** `owner` role can create, update, and delete `member` users within their org.
- **No member without org:** A member user cannot be created without an existing organization.
- **Self-edit only:** Users can only update their own profile (`first_name`, `last_name`) and password.
- **Owner scoped to org:** Owners can only manage users in their own organization.
- **Shared org domains:** All domain data belongs to `Organization`. All members share and CRUD the same data.
- **Order creator audit:** `PurchaseOrder` and `SalesOrder` record `created_by`.
- **Org-scoped CRUD:** Users can only CRUD data from their active organization.
- **Confirming a PurchaseOrder** → creates `Stock` entries (source=`purchase_order`) per item.
- **Confirming a SalesOrder** → creates negative `Stock` entries (source=`sales_order`); raises 400 if insufficient stock.
- **Cancelling an order** → reverts confirmed status back to `cancelled`; stock changes are reversed.
- **Negative stock is impossible:** `deduct_stock` raises an exception when quantity > available.
- **Financial cost includes manual stock:** `total_cost` = purchase order costs + manual stock entries priced at `product.unit_cost`.
- **`HasActiveOrganization`** permission class blocks all domain endpoints when `organization` is null.

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login/` | Returns access + refresh JWT tokens |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Get current user + org + role |
| PATCH | `/api/auth/me/` | Update profile (`first_name`, `last_name`) |
| POST | `/api/auth/me/change-password/` | Change own password (`old_password` + `new_password`) |

### Admin — Users (admin only)
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/users/` | List all non-admin users (paginated) |
| POST | `/api/admin/users/` | Create user |
| GET | `/api/admin/users/{id}/` | User detail |
| PATCH | `/api/admin/users/{id}/` | Update user |
| DELETE | `/api/admin/users/{id}/` | Delete user |

### Admin — Organizations (admin only)
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/organizations/` | List all organizations (paginated) |
| POST | `/api/admin/organizations/` | Create org (name + owner_email) |
| GET | `/api/admin/organizations/{id}/` | Org detail |
| PATCH | `/api/admin/organizations/{id}/` | Update org name |
| DELETE | `/api/admin/organizations/{id}/` | Delete org |

### Organizations
| Method | Path | Description |
|---|---|---|
| GET | `/api/organizations/` | List user's organization |
| GET | `/api/organizations/{id}/` | Org detail |
| PATCH | `/api/organizations/{id}/` | Update org name (owner only) |
| GET | `/api/organizations/{id}/members/` | List org members (owner only) |
| POST | `/api/organizations/{id}/members/` | Add member (owner only) |
| GET | `/api/organizations/{id}/members/{user_id}/` | Member detail |
| PATCH | `/api/organizations/{id}/members/{user_id}/` | Update member role |
| DELETE | `/api/organizations/{id}/members/{user_id}/` | Remove member |

### Products
| Method | Path | Description |
|---|---|---|
| GET | `/api/products/` | List org's products (paginated) |
| POST | `/api/products/` | Create product |
| GET | `/api/products/{id}/` | Product detail |
| PATCH | `/api/products/{id}/` | Update product |
| DELETE | `/api/products/{id}/` | Delete product |

### Stock
| Method | Path | Description |
|---|---|---|
| GET | `/api/stock/` | List stock entries (paginated) |
| POST | `/api/stock/` | Add stock manually |
| GET | `/api/stock/{id}/` | Stock entry detail |
| POST | `/api/stock/{product_id}/remove/` | Create negative manual stock entry |

### Suppliers
| Method | Path | Description |
|---|---|---|
| GET | `/api/suppliers/` | List org's suppliers (paginated) |
| POST | `/api/suppliers/` | Create supplier |
| GET | `/api/suppliers/{id}/` | Supplier detail |
| PATCH | `/api/suppliers/{id}/` | Update supplier |
| DELETE | `/api/suppliers/{id}/` | Delete supplier |

### Customers
| Method | Path | Description |
|---|---|---|
| GET | `/api/customers/` | List org's customers (paginated) |
| POST | `/api/customers/` | Create customer |
| GET | `/api/customers/{id}/` | Customer detail |
| PATCH | `/api/customers/{id}/` | Update customer |
| DELETE | `/api/customers/{id}/` | Delete customer |

### Purchase Orders
| Method | Path | Description |
|---|---|---|
| GET | `/api/purchases/` | List purchase orders (paginated) |
| POST | `/api/purchases/` | Create purchase order (with items) |
| GET | `/api/purchases/{id}/` | Order detail |
| POST | `/api/purchases/{id}/confirm/` | Confirm → triggers stock creation |
| POST | `/api/purchases/{id}/cancel/` | Cancel order |

### Sales Orders
| Method | Path | Description |
|---|---|---|
| GET | `/api/sales/` | List sales orders (paginated) |
| POST | `/api/sales/` | Create sales order (with items) |
| GET | `/api/sales/{id}/` | Order detail |
| POST | `/api/sales/{id}/confirm/` | Confirm → decrements stock |
| POST | `/api/sales/{id}/cancel/` | Cancel order |

### Financial
| Method | Path | Description |
|---|---|---|
| GET | `/api/financial/summary/` | Total cost, revenue, profit, margin |
| GET | `/api/financial/products/` | Per-product financial breakdown |
| GET | `/api/financial/timeline/` | Revenue/cost/profit grouped by day/month/year |

> OpenAPI schema: `GET /api/schema/` · Swagger UI: `GET /api/docs/` · ReDoc: `GET /api/redoc/`

---

## Financial Calculations

```
total_cost    = Σ (unit_cost × quantity) from confirmed PurchaseOrderItems
              + Σ (quantity × product.unit_cost) from manual Stock entries (quantity > 0)
total_revenue = Σ (unit_price × quantity) from confirmed SalesOrderItems
profit        = total_revenue − total_cost
margin        = (profit / total_cost) × 100  — if total_cost > 0, else 0
```

---

## Backend File Structure

```
backend/
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── apps/
│   ├── users/         # User model, auth endpoints, admin user CRUD
│   ├── organizations/ # Organization model, member management, admin org CRUD
│   ├── products/      # Product CRUD
│   ├── stock/         # Stock entries (append-only)
│   ├── suppliers/     # Supplier CRUD
│   ├── customers/     # Customer CRUD
│   ├── purchases/     # PurchaseOrder + PurchaseOrderItem
│   ├── sales/         # SalesOrder + SalesOrderItem
│   └── financial/     # No models — selectors only (summary, products, timeline)
├── common/
│   ├── models.py      # BaseModel (UUID PK, created_at, updated_at)
│   ├── permissions.py # IsAdmin, IsOrganizationOwner, HasActiveOrganization
│   └── exceptions.py
├── conftest.py
├── pytest.ini
├── requirements.txt
├── Dockerfile
└── entrypoint.sh
```

Each app follows: `models → services → selectors → serializers → api → urls`

---

## Frontend Screens

### Role-Based Navbar

**Admin:** Organizations · Users · Profile · Logout

**Owner:** Dashboard · Products · Suppliers · Customers · Purchases · Sales · Members · Organization · Profile · Logout

**Member:** Dashboard · Products · Suppliers · Customers · Purchases · Sales · Profile · Logout

### Pages

| Path | Role | Description |
|---|---|---|
| `/login` | All | JWT login form |
| `/dashboard` | Owner + Member | Financial summary cards + per-product table |
| `/products` | Owner + Member | Product list + create modal |
| `/products/:id` | Owner + Member | Product detail, stock history, financial summary |
| `/suppliers` | Owner + Member | Supplier list + create/edit/delete |
| `/customers` | Owner + Member | Customer list + create/edit/delete |
| `/purchases` | Owner + Member | Purchase order list |
| `/purchases/new` | Owner + Member | Create purchase order + confirm flow |
| `/sales` | Owner + Member | Sales order list |
| `/sales/new` | Owner + Member | Create sales order + confirm flow |
| `/settings/members` | Owner | Member list + add/edit/remove |
| `/settings/organization` | Owner | Edit org name, view slug |
| `/settings/profile` | All | Edit name, change password |
| `/admin/organizations` | Admin | Admin org CRUD |
| `/admin/users` | Admin | Admin user CRUD |

---

## Tests

- Purchase order confirm creates stock entries
- Sales order confirm decrements stock
- Sales confirm with qty > available stock → 400
- Profit/margin calculation matches expected values
- Organization data isolation (User A cannot access Org B data)
- Supplier/customer isolation per organization

Run: `pytest --tb=short`
