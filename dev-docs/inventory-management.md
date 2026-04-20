# Kaizntree — Inventory Management System
## Development Plan

> **Project Type:** WEB (Full-Stack)  
> **Agents:** `backend-specialist` → `frontend-specialist`  
> **Stack:** Django + DRF + PostgreSQL | React + Mantine + TanStack Query + Tailwind

---

## Overview

Build a production-quality inventory management application for Food & Beverages CPG brands. Users can register products, manage stock, create purchase/sales orders, and visualize financial data. Each user sees only their own data.

The plan follows the documented structures:
- **Backend:** `django-structure.md` — domain-based apps with `models → services → selectors → api`
- **Frontend:** `estrutura_frontend_react_plano_simplificado.md` — `pages → features → components → lib`

---

## ✅ Requirement Coverage Check

| Requirement | Covered | Where |
|---|---|---|
| Register products (name, description, SKU, unit) | ✅ | `apps/products` |
| Units: kg, g, L, mL, unit | ✅ | `Product.unit` choices |
| Stock manually added | ✅ | `POST /api/stock/` |
| Stock via purchase order | ✅ | `apps/purchases` creates stock |
| Sales orders (qty + unit price) | ✅ | `apps/sales` |
| Unique stock identifier | ✅ | `Stock.id` UUID |
| Financial: total bought/sold | ✅ | `apps/financial` selectors |
| Profit & margin calculation | ✅ | `apps/financial` services |
| User isolation (own data only) | ✅ | `IsOwner` permission + filter by `user` |
| Authentication | ✅ | JWT via SimpleJWT |
| React + TanStack Query + Mantine + Tailwind | ✅ | Frontend stack |
| Tests (pytest) — optional/desirable | ✅ | Step 15 |
| Docker | ✅ | Step 16 |
| README + API docs | ✅ | Step 17 |

---

## Success Criteria

- [ ] User can register, login, and see only their own data
- [ ] Products can be created with all 5 unit types
- [ ] Stock can be added manually or via purchase order
- [ ] Sales order decrements stock; no negative stock allowed
- [ ] Dashboard shows revenue, cost, profit, margin per product and globally
- [ ] All API endpoints return proper HTTP status codes
- [ ] Frontend communicates exclusively with the Django API

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Backend framework | Django 5 + DRF | Required by challenge |
| Auth | `djangorestframework-simplejwt` | Stateless JWT, easy FE integration |
| Database | PostgreSQL | Required by challenge |
| Frontend | React 18 + Vite + TypeScript | Required by challenge |
| UI components | Mantine v7 | Required by challenge |
| Data fetching | TanStack Query v5 | Required by challenge |
| Styling | Tailwind CSS v3 | Required by challenge |
| HTTP client | Axios | Works well with interceptors for JWT |
| Containerization | Docker + Docker Compose | Desirable requirement |
| Testing | pytest + pytest-django | Desirable requirement |

---

## File Structure

### Backend

```
backend/
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/
│   ├── users/
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── serializers.py
│   │   ├── api.py
│   │   └── urls.py
│   │
│   ├── products/
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── selectors.py
│   │   ├── serializers.py
│   │   ├── api.py
│   │   └── urls.py
│   │
│   ├── stock/
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── selectors.py
│   │   ├── serializers.py
│   │   ├── api.py
│   │   └── urls.py
│   │
│   ├── purchases/
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── selectors.py
│   │   ├── serializers.py
│   │   ├── api.py
│   │   └── urls.py
│   │
│   ├── sales/
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── selectors.py
│   │   ├── serializers.py
│   │   ├── api.py
│   │   └── urls.py
│   │
│   └── financial/
│       ├── services.py
│       ├── selectors.py
│       ├── serializers.py
│       ├── api.py
│       └── urls.py
│
├── common/
│   ├── models.py        # BaseModel: id (UUID), created_at, updated_at
│   ├── permissions.py   # IsOwner
│   └── exceptions.py
│
├── manage.py
├── requirements.txt
├── .env.example
└── Dockerfile
```

### Frontend

```
frontend/
├── src/
│   ├── app/
│   │   ├── providers.tsx     # MantineProvider + QueryClientProvider
│   │   └── router.tsx        # React Router routes
│   │
│   ├── pages/
│   │   ├── login/
│   │   │   └── LoginPage.tsx
│   │   ├── products/
│   │   │   ├── ProductsPage.tsx
│   │   │   └── ProductDetailPage.tsx
│   │   ├── purchases/
│   │   │   ├── PurchasesPage.tsx
│   │   │   └── CreatePurchasePage.tsx
│   │   ├── sales/
│   │   │   ├── SalesPage.tsx
│   │   │   └── CreateSalePage.tsx
│   │   └── dashboard/
│   │       └── DashboardPage.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   ├── products/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   ├── stock/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   ├── purchases/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   ├── sales/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   └── dashboard/
│   │       ├── api.ts
│   │       ├── hooks.ts
│   │       └── types.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx       # Mantine AppShell wrapper
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── ui/
│   │   │   ├── PageHeader.tsx
│   │   │   └── EmptyState.tsx
│   │   └── forms/
│   │       └── FormField.tsx
│   │
│   ├── lib/
│   │   ├── api-client.ts      # Axios instance + JWT interceptor
│   │   ├── query-client.ts    # TanStack QueryClient config
│   │   └── utils.ts           # formatCurrency, formatDate
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── main.tsx
│   └── App.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## Database Models

### `common.BaseModel`
```
id          UUID (PK, default=uuid4)
created_at  datetime (auto)
updated_at  datetime (auto)
```

### `users.User` (extends AbstractUser)
```
email       (unique, used as USERNAME_FIELD)
```

### `products.Product`
```
user        FK → User
name        str(255)
description text
sku         str(100), unique per user
unit        choices: kg | g | L | mL | unit
```

### `stock.Stock`
```
product     FK → Product
quantity    Decimal
source      choices: manual | purchase_order
reference   UUID (FK → PurchaseOrder, nullable)
```

### `purchases.PurchaseOrder`
```
user        FK → User
status      choices: pending | confirmed
notes       text (optional)
```

### `purchases.PurchaseOrderItem`
```
order       FK → PurchaseOrder
product     FK → Product
quantity    Decimal
unit_cost   Decimal (cost per unit)
```

### `sales.SalesOrder`
```
user        FK → User
status      choices: pending | confirmed
notes       text (optional)
```

### `sales.SalesOrderItem`
```
order       FK → SalesOrder
product     FK → Product
quantity    Decimal
unit_price  Decimal (price per unit)
```

> **Business Rules:**
> - Confirming a `PurchaseOrder` → creates `Stock` entries per item
> - Confirming a `SalesOrder` → decrements stock; raises error if insufficient
> - `financial` has no models — its selectors aggregate from the other apps

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login/` | Returns access + refresh tokens |
| POST | `/api/auth/refresh/` | Refresh access token |
| POST | `/api/auth/register/` | Register new user |

### Products
| Method | Path | Description |
|---|---|---|
| GET | `/api/products/` | List user's products |
| POST | `/api/products/` | Create product |
| GET | `/api/products/{id}/` | Product detail |
| PATCH | `/api/products/{id}/` | Update product |
| DELETE | `/api/products/{id}/` | Delete product |

### Stock
| Method | Path | Description |
|---|---|---|
| GET | `/api/stock/` | List stock entries |
| POST | `/api/stock/` | Add stock manually |
| GET | `/api/stock/{id}/` | Stock entry detail |

### Purchase Orders
| Method | Path | Description |
|---|---|---|
| GET | `/api/purchases/` | List purchase orders |
| POST | `/api/purchases/` | Create purchase order (with items) |
| GET | `/api/purchases/{id}/` | Order detail |
| POST | `/api/purchases/{id}/confirm/` | Confirm → triggers stock creation |

### Sales Orders
| Method | Path | Description |
|---|---|---|
| GET | `/api/sales/` | List sales orders |
| POST | `/api/sales/` | Create sales order (with items) |
| GET | `/api/sales/{id}/` | Order detail |
| POST | `/api/sales/{id}/confirm/` | Confirm → decrements stock |

### Financial Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/api/financial/summary/` | Total revenue, total cost, profit, margin |
| GET | `/api/financial/products/` | Per-product financial breakdown |

---

## UI Screens

### 1. Login Page (`/login`)
- `Mantine TextInput` + `PasswordInput` + `Button`
- On success → store JWT in `localStorage`, redirect to `/dashboard`

### 2. Products Page (`/products`)
- `Mantine Table` listing all products
- Columns: Name, SKU, Unit, Current Stock, Actions
- `Button` → opens `Modal` with form to create product

### 3. Product Detail Page (`/products/:id`)
- Product info card
- Stock history table (entries with source: manual / purchase)
- Financial summary for this product: cost, revenue, profit, margin

### 4. Purchase Orders Page (`/purchases`)
- Table of purchase orders with status badge
- `Button` → create new order (navigates to form)

### 5. Create Purchase Page (`/purchases/new`)
- Select product + quantity + unit_cost per line
- Add multiple items
- Submit → creates order
- Confirm button → triggers stock creation

### 6. Sales Orders Page (`/sales`)
- Table of sales orders with status badge
- `Button` → create new order

### 7. Create Sale Page (`/sales/new`)
- Select product + quantity + unit_price per line
- Shows current available stock per product
- Confirm button → decrements stock

### 8. Dashboard Page (`/dashboard`)
- `Mantine SimpleGrid` with stat cards:
  - Total Revenue
  - Total Cost
  - Profit
  - Profit Margin %
- `Mantine Table` with per-product breakdown

---

## Task Breakdown

### STEP 1 — Backend: Project Setup
**Agent:** `backend-specialist`

- [ ] Create `backend/` folder with Django project using `django-admin startproject config .`
- [ ] Install dependencies: `django`, `djangorestframework`, `djangorestframework-simplejwt`, `psycopg2-binary`, `python-decouple`, `django-cors-headers`
- [ ] Create `requirements.txt`
- [ ] Configure `settings.py`: PostgreSQL, CORS, JWT auth, installed apps
- [ ] Create `.env.example` with `DATABASE_URL`, `SECRET_KEY`, `DEBUG`
- [ ] Create `common/` app: `BaseModel`, `IsOwner` permission, `exceptions.py`

**INPUT:** empty folder  
**OUTPUT:** Django project running with `python manage.py runserver`  
**VERIFY:** `python manage.py check` returns no errors

---

### STEP 2 — Backend: Users App
**Agent:** `backend-specialist`

- [ ] Create `apps/users/` app
- [ ] `models.py`: Custom User extending `AbstractUser`, `email` as `USERNAME_FIELD`
- [ ] `AUTH_USER_MODEL = 'users.User'` in settings
- [ ] `serializers.py`: `RegisterSerializer`, `UserSerializer`
- [ ] `services.py`: `create_user(email, password)`
- [ ] `api.py`: `RegisterView` (CreateAPIView), JWT views via SimpleJWT
- [ ] `urls.py`: wire to `config/urls.py` under `/api/auth/`
- [ ] Run `makemigrations` + `migrate`

**INPUT:** Step 1 complete  
**OUTPUT:** `POST /api/auth/register/` and `POST /api/auth/login/` working  
**VERIFY:** Returns JWT tokens via `curl` or HTTPie

---

### STEP 3 — Backend: Products App
**Agent:** `backend-specialist`

- [ ] Create `apps/products/` app
- [ ] `models.py`: `Product` model (extends `BaseModel`)
- [ ] `serializers.py`: `ProductSerializer`
- [ ] `selectors.py`: `get_products_for_user(user)`, `get_product_by_id(user, id)`
- [ ] `services.py`: `create_product(user, data)`, `update_product(product, data)`, `delete_product(product)`
- [ ] `api.py`: `ProductListCreateView`, `ProductDetailView`
- [ ] `urls.py`: wired under `/api/products/`
- [ ] All views enforce `IsAuthenticated` + filter by `request.user`

**INPUT:** Step 2 complete  
**OUTPUT:** Full CRUD for `/api/products/`  
**VERIFY:** Can create and list products; unauthenticated request returns 401

---

### STEP 4 — Backend: Stock App
**Agent:** `backend-specialist`

- [ ] Create `apps/stock/` app
- [ ] `models.py`: `Stock` model (product, quantity, source, reference)
- [ ] `serializers.py`: `StockSerializer`
- [ ] `selectors.py`: `get_stock_for_product(product)`, `get_total_stock(product)`
- [ ] `services.py`: `add_stock_manually(product, quantity)`, `deduct_stock(product, quantity)` — raises exception if negative
- [ ] `api.py`: `StockListCreateView`, `StockDetailView`
- [ ] `urls.py`: wired under `/api/stock/`

**INPUT:** Step 3 complete  
**OUTPUT:** `POST /api/stock/` creates stock for authenticated user's product  
**VERIFY:** Stock deduction raises error when quantity > available

---

### STEP 5 — Backend: Purchases App
**Agent:** `backend-specialist`

- [ ] Create `apps/purchases/` app
- [ ] `models.py`: `PurchaseOrder`, `PurchaseOrderItem`
- [ ] `serializers.py`: `PurchaseOrderSerializer` (nested items write)
- [ ] `selectors.py`: `get_orders_for_user(user)`, `get_order_by_id(user, id)`
- [ ] `services.py`: 
  - `create_purchase_order(user, data)` — creates order + items in one transaction
  - `confirm_purchase_order(order)` — calls `stock.services.add_stock_manually()` for each item
- [ ] `api.py`: `PurchaseOrderListCreateView`, `PurchaseOrderDetailView`, `ConfirmPurchaseOrderView`
- [ ] `urls.py`: wired under `/api/purchases/`

**INPUT:** Step 4 complete  
**OUTPUT:** Creating and confirming a purchase order creates stock entries  
**VERIFY:** After confirm, `GET /api/stock/?product=X` shows new entries

---

### STEP 6 — Backend: Sales App
**Agent:** `backend-specialist`

- [ ] Create `apps/sales/` app
- [ ] `models.py`: `SalesOrder`, `SalesOrderItem`
- [ ] `serializers.py`: `SalesOrderSerializer` (nested items write)
- [ ] `selectors.py`: `get_orders_for_user(user)`, `get_order_by_id(user, id)`
- [ ] `services.py`:
  - `create_sales_order(user, data)` — creates order + items
  - `confirm_sales_order(order)` — calls `stock.services.deduct_stock()` for each item; wraps in atomic transaction
- [ ] `api.py`: `SalesOrderListCreateView`, `SalesOrderDetailView`, `ConfirmSalesOrderView`
- [ ] `urls.py`: wired under `/api/sales/`

**INPUT:** Step 5 complete  
**OUTPUT:** Confirming a sales order decrements stock; returns 400 if insufficient stock  
**VERIFY:** Selling more than available returns `{"error": "Insufficient stock"}`

---

### STEP 7 — Backend: Financial App
**Agent:** `backend-specialist`

- [ ] Create `apps/financial/` app (no models)
- [ ] `selectors.py`:
  - `get_financial_summary(user)` → `{total_cost, total_revenue, profit, margin}`
  - `get_per_product_financials(user)` → list with per-product breakdown
- [ ] `services.py`: `calculate_profit_margin(cost, revenue)` → margin %
- [ ] `serializers.py`: `FinancialSummarySerializer`, `ProductFinancialSerializer`
- [ ] `api.py`: `FinancialSummaryView`, `ProductFinancialView`
- [ ] `urls.py`: wired under `/api/financial/`

> Calculations:
> - `total_cost` = sum of `unit_cost * quantity` from confirmed `PurchaseOrderItem`s
> - `total_revenue` = sum of `unit_price * quantity` from confirmed `SalesOrderItem`s
> - `profit` = `total_revenue - total_cost`
> - `margin` = `profit / total_cost * 100` (if cost > 0)

**INPUT:** Steps 5 + 6 complete  
**OUTPUT:** `GET /api/financial/summary/` returns all 4 values  
**VERIFY:** Matches the example scenario: cost=$100, revenue=$1000, profit=$900, margin=900%

---

### STEP 8 — Frontend: Project Setup
**Agent:** `frontend-specialist`

- [ ] Create `frontend/` with `npm create vite@latest . -- --template react-ts`
- [ ] Install: `@mantine/core`, `@mantine/hooks`, `@tanstack/react-query`, `axios`, `react-router-dom`, `tailwindcss`
- [ ] Configure Tailwind (`tailwind.config.js`, `globals.css`)
- [ ] Configure Mantine (`MantineProvider`) in `app/providers.tsx`
- [ ] Configure TanStack Query (`QueryClientProvider`) in `app/providers.tsx`
- [ ] Set up `lib/api-client.ts`: Axios instance with base URL + JWT request interceptor + 401 refresh/logout interceptor
- [ ] Set up `lib/query-client.ts`: QueryClient with sensible defaults (`staleTime: 1min`)
- [ ] Set up `app/router.tsx` with React Router v6 routes + `ProtectedRoute` wrapper

**INPUT:** Backend running on `:8000`  
**OUTPUT:** Vite dev server running on `:5173`, blank app with providers mounted  
**VERIFY:** `npm run dev` starts without errors

---

### STEP 9 — Frontend: Auth Feature + Login Page
**Agent:** `frontend-specialist`

- [ ] `features/auth/types.ts`: `LoginPayload`, `AuthTokens`, `User`
- [ ] `features/auth/api.ts`: `login(payload)`, `register(payload)`, `refreshToken()`
- [ ] `features/auth/hooks.ts`: `useLogin()` mutation, `useCurrentUser()` query
- [ ] `components/layout/ProtectedRoute.tsx`: redirects to `/login` if no token
- [ ] `pages/login/LoginPage.tsx`: Mantine form with `TextInput` (email) + `PasswordInput` + `Button`
  - On success: store tokens in `localStorage`, navigate to `/dashboard`

**INPUT:** Step 8 complete  
**OUTPUT:** Login page functional; token stored and used in subsequent requests  
**VERIFY:** Login with valid credentials redirects to dashboard; invalid shows error notification

---

### STEP 10 — Frontend: Layout + AppShell
**Agent:** `frontend-specialist`

- [ ] `components/layout/AppShell.tsx`: Mantine `AppShell` with navbar
- [ ] `components/layout/Navbar.tsx`: navigation links (Dashboard, Products, Purchases, Sales) + logout button
- [ ] `components/ui/PageHeader.tsx`: title + optional action button
- [ ] `components/ui/EmptyState.tsx`: icon + message for empty lists
- [ ] Wire all routes inside `AppShell` (excluding `/login`)

**INPUT:** Step 9 complete  
**OUTPUT:** Authenticated pages show sidebar navigation  
**VERIFY:** Clicking nav links changes active route without full page reload

---

### STEP 11 — Frontend: Products Feature
**Agent:** `frontend-specialist`

- [ ] `features/products/types.ts`: `Product`, `CreateProductPayload`
- [ ] `features/products/api.ts`: `fetchProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()`
- [ ] `features/products/hooks.ts`: `useProducts()`, `useCreateProduct()`, `useDeleteProduct()`
- [ ] `pages/products/ProductsPage.tsx`:
  - Mantine `Table` with columns: Name, SKU, Unit, Actions
  - `Button` → `Modal` with create product form (Mantine `useForm`)
- [ ] `pages/products/ProductDetailPage.tsx`:
  - Product info, current stock total, financial summary for this product

**INPUT:** Step 10 complete  
**OUTPUT:** Can create and list products  
**VERIFY:** Creating a product appears in the table immediately (query invalidation)

---

### STEP 12 — Frontend: Purchases Feature
**Agent:** `frontend-specialist`

- [ ] `features/purchases/types.ts`, `api.ts`, `hooks.ts`
- [ ] `pages/purchases/PurchasesPage.tsx`: Table of orders with `Badge` for status
- [ ] `pages/purchases/CreatePurchasePage.tsx`:
  - Dynamic item list: product select + quantity + unit_cost
  - Submit → creates order + shows confirm button
  - Confirm → `POST /api/purchases/:id/confirm/`

**INPUT:** Step 11 complete  
**OUTPUT:** Can create a purchase order and confirm it  
**VERIFY:** After confirm, stock is visible on Products page

---

### STEP 13 — Frontend: Sales Feature
**Agent:** `frontend-specialist`

- [ ] `features/sales/types.ts`, `api.ts`, `hooks.ts`
- [ ] `pages/sales/SalesPage.tsx`: table of sales orders
- [ ] `pages/sales/CreateSalePage.tsx`:
  - Dynamic item list: product select shows available stock
  - Submit + Confirm flow
  - Shows error notification if stock insufficient

**INPUT:** Step 12 complete  
**OUTPUT:** Can create and confirm a sales order  
**VERIFY:** Confirming a sale reduces stock; overselling shows error toast

---

### STEP 14 — Frontend: Dashboard
**Agent:** `frontend-specialist`

- [ ] `features/dashboard/types.ts`, `api.ts`, `hooks.ts`
- [ ] `pages/dashboard/DashboardPage.tsx`:
  - Mantine `SimpleGrid` with 4 stat cards: Revenue, Cost, Profit, Margin
  - Mantine `Table` with per-product financial breakdown
  - Currency formatted with `lib/utils.ts` → `formatCurrency()`

**INPUT:** Steps 7 + 13 complete  
**OUTPUT:** Dashboard shows correct financial aggregates  
**VERIFY:** Matches challenge example: buy 100 @ $1 + sell 100 @ $10 → margin 900%

---

### STEP 15 — Tests (pytest)
**Agent:** `backend-specialist`

- [ ] Install `pytest`, `pytest-django`, `factory_boy`
- [ ] `conftest.py` with fixtures: `user`, `product`, `authenticated_client`
- [ ] **Test: profit calculation** → assert `financial/summary` values match
- [ ] **Test: stock cannot go negative** → sales confirm with qty > stock → 400
- [ ] **Test: purchase confirm creates stock entries**
- [ ] **Test: user data isolation** → User A's products not visible to User B

**INPUT:** Steps 5–7 complete  
**OUTPUT:** `pytest` runs with ≥4 passing tests  
**VERIFY:** `pytest --tb=short` → all green

---

### STEP 16 — Docker
**Agent:** `backend-specialist`

- [ ] `backend/Dockerfile`: Python slim image, installs requirements, runs gunicorn
- [ ] `frontend/Dockerfile`: Node Alpine image, builds Vite, serves with nginx
- [ ] `docker-compose.yml` at project root: services `db`, `backend`, `frontend`
- [ ] `.env.example` with all required vars

**INPUT:** All previous steps complete  
**OUTPUT:** `docker-compose up` → all 3 services running  
**VERIFY:** `http://localhost` serves frontend; `http://localhost/api` serves backend

---

### STEP 17 — Documentation (README)
**Agent:** `backend-specialist` + `frontend-specialist`

- [ ] `README.md` at project root:
  - How to run locally (with and without Docker)
  - Environment variables reference
  - API endpoint table
  - Architecture decisions (services/selectors, JWT, append-only stock, computed financials)
  - How to run tests

**INPUT:** Step 16 complete  
**OUTPUT:** README.md complete  
**VERIFY:** A developer can run the project from scratch following only the README

---

## Phase X: Verification Checklist

### Backend
- [ ] `python manage.py check` → no errors
- [ ] `pytest` → all tests pass
- [ ] All endpoints return 401 for unauthenticated requests
- [ ] User B cannot access User A's data
- [ ] Negative stock is impossible
- [ ] Financial calculation matches the challenge example scenario

### Frontend
- [ ] `npm run build` → no TypeScript errors
- [ ] Login flow works end-to-end
- [ ] All pages load without console errors
- [ ] Dashboard numbers match what's expected

### Docker
- [ ] `docker-compose up --build` → all containers start cleanly

### Code Quality
- [ ] No code comments (as per requirements)
- [ ] All code in English
- [ ] No direct DB queries in views (services/selectors pattern respected)
- [ ] No raw `fetch` calls in components (all go through `features/*/api.ts`)

---

## Decisions to Explain in Interview

| Decision | Rationale |
|---|---|
| JWT over session auth | Stateless, simpler FE integration, standard for SPA+API |
| Services/Selectors pattern | Keeps views thin, business logic testable in isolation |
| Stock as append-only log | Immutable audit trail; deductions are negative entries or separate tracking |
| Financial computed on request | Always accurate; no sync issues; acceptable for this scale |
| Custom User model from day 1 | Django best practice; email as username |
| `docker-compose` with 3 services | Mirrors a real deployment; easy for the reviewer to run |
