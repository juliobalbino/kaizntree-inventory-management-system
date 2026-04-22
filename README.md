# Inventory Management System

A full-stack inventory management application for Food & Beverages CPG brands, built with Django + React.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 6 + Django REST Framework |
| Auth | JWT via `djangorestframework-simplejwt` |
| Database | PostgreSQL 16 |
| API Docs | drf-spectacular (OpenAPI 3) |
| Frontend | React 19 + Vite + TypeScript |
| UI | Mantine v9 + Tailwind CSS v4 |
| Data fetching | TanStack Query v5 + Axios |
| Testing | pytest + pytest-django + factory-boy |
| Containers | Docker + Docker Compose |

---

## Project Structure

```
.
├── backend/               # Django API
├── frontend/              # React SPA
├── docker-compose.yml     # Production-like: db + backend + frontend
├── docker-compose.dev.yml # Dev only: db + pgAdmin
└── docs/                  # Architecture and planning docs
```

### Documentation

| File | Description |
|---|---|
| [docs/inventory_management_plan.md](docs/inventory_management_plan.md) | Full architecture plan: models, API endpoints, business rules, and frontend screens |
| [docs/take-home-challenge-inventory-management-system.md](docs/take-home-challenge-inventory-management-system.md) | Original challenge requirements |
| [docs/checklist.md](docs/checklist.md) | Feature completion checklist |
| [docs/seed-data-summary.md](docs/seed-data-summary.md) | Summary of demo data seeded on startup |

---

## Running without Docker (local development)

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16 running locally

### 1. Backend

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
# Linux/macOS
source .venv/bin/activate
# Windows
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Copy and configure the environment file:

```bash
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=inventory_management
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Admin user created on first run
INITIAL_ADMIN_EMAIL=admin@admin.com
INITIAL_ADMIN_PASSWORD=admin321
```

Run migrations and seed initial data:

```bash
python manage.py migrate
python manage.py setup_admin   # creates the admin user from .env
python manage.py seed_data     # populates demo orgs, products, and orders
```

Start the development server:

```bash
python manage.py runserver
```

API available at: `http://localhost:8000`

### 2. Frontend

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
# frontend/.env
VITE_API_URL=http://127.0.0.1:8000/api/
```

Start the dev server:

```bash
npm run dev
```

App available at: `http://localhost:5173`

### 3. (Optional) Database only via Docker

To run only PostgreSQL and pgAdmin without Docker for the app:

```bash
docker compose -f docker-compose.dev.yml up -d
```

| Service | URL |
|---|---|
| PostgreSQL | `localhost:5432` |
| pgAdmin | `http://localhost:5050` (admin@admin.com / admin) |

Then point `backend/.env` to `DB_HOST=localhost`.

---

## Running with Docker

### Prerequisites

- Docker 24+
- Docker Compose v2

### 1. Configure environment

Copy and edit the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Set the required values in `backend/.env`:

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=inventory_management
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=db          # must be "db" — the Docker service name
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000

INITIAL_ADMIN_EMAIL=admin@admin.com
INITIAL_ADMIN_PASSWORD=admin321
```

Create the frontend environment file:

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000/api/
```

> The `VITE_API_URL` is baked into the frontend build, so it must point to the backend URL that your browser can reach.

### 2. Build and start

If you keep your `.env` files separated inside their respective folders (`backend/.env` and `frontend/.env`), you must pass both to Docker Compose so it can interpolate all necessary build variables:

```bash
docker compose --env-file ./backend/.env --env-file ./frontend/.env up -d --build
```

The backend entrypoint automatically runs on startup:
1. Waits for PostgreSQL to be ready
2. `python manage.py migrate`
3. `python manage.py setup_admin`
4. `python manage.py seed_data`
5. Starts Gunicorn

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8000` |
| API Docs (Swagger) | `http://localhost:8000/api/docs/` |
| API Docs (ReDoc) | `http://localhost:8000/api/redoc/` |

### 3. Stop

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

---

## Default Users

After running `setup_admin` + `seed_data`, the following users are available:

| Email | Password | Role | Organization |
|---|---|---|---|
| `admin@admin.com` | `admin321` | Admin | — |
| `owner@gourmet-delights.com` | `password123` | Owner | Gourmet Delights |
| `member@gourmet-delights.com` | `password123` | Member | Gourmet Delights |
| `owner@premium-beverages.com` | `password123` | Owner | Premium Beverages |
| `member@premium-beverages.com` | `password123` | Member | Premium Beverages |

> The admin credentials come from `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` in `backend/.env`.

---

## Running Tests

```bash
cd backend
pytest --tb=short
```

Test coverage includes:

- Purchase order confirmation creates stock entries
- Sales order confirmation decrements stock
- Selling more than available stock returns 400
- Profit and margin calculations
- Organization data isolation (user A cannot access org B data)

---

## API Documentation

The API is documented via OpenAPI 3 (drf-spectacular):

| Format | URL |
|---|---|
| Raw schema (YAML) | `GET /api/schema/` |
| Swagger UI | `GET /api/docs/` |
| ReDoc | `GET /api/redoc/` |

### Key endpoints

| Area | Base path |
|---|---|
| Auth (login, refresh, profile) | `/api/auth/` |
| Admin — users | `/api/admin/users/` |
| Admin — organizations | `/api/admin/organizations/` |
| Organizations + members | `/api/organizations/` |
| Products | `/api/products/` |
| Stock | `/api/stock/` |
| Suppliers | `/api/suppliers/` |
| Customers | `/api/customers/` |
| Purchase orders | `/api/purchases/` |
| Sales orders | `/api/sales/` |
| Financial dashboard | `/api/financial/` |

All endpoints require a Bearer JWT token (`Authorization: Bearer <access_token>`).

---

## Architecture Decisions

### Domain-Driven Design (DDD)
Both the backend and frontend are organized around business domains rather than technical layers, following DDD principles.

The backend is structured as a collection of Django apps under `apps/`, each representing a bounded context of the business: `products`, `stock`, `suppliers`, `customers`, `purchases`, `sales`, `financial`, `organizations`, and `users`. Each domain owns its models, services, selectors, serializers, and API views — there are no shared "views/" or "models/" directories that mix unrelated concerns.

The frontend mirrors this structure under `src/features/`, with each domain (`auth`, `products`, `purchases`, `sales`, `suppliers`, `customers`, `dashboard`, `admin`) containing its own `api/`, `hooks/`, `components/`, `pages/`, and `model/` folders. Cross-cutting UI elements live in `src/shared/`, and infrastructure (Axios client, QueryClient) lives in `src/lib/` — keeping domain logic free from framework details.

This makes each domain independently navigable, testable, and extensible without touching unrelated parts of the codebase.

### Services / Selectors pattern
Views are kept thin. Business logic lives in `services.py` (writes/mutations) and `selectors.py` (reads/queries), making it easy to test in isolation without HTTP overhead.

### Organization-based isolation
All business data (`Product`, `Stock`, `PurchaseOrder`, `SalesOrder`, etc.) belongs to an `Organization`. Multiple users in the same org share and co-manage the same data, which mirrors how real CPG brands operate.

### Append-only stock log
Stock is never updated in-place. Every movement — manual entry, purchase order confirmation, sales order confirmation — creates a new `Stock` row with a positive or negative quantity. This provides a full audit trail and makes reversal straightforward.

### Financial calculated on request
Revenue, cost, profit, and margin are computed by database aggregation on demand. There is no cached or denormalized financial state to keep in sync, which eliminates an entire class of consistency bugs at acceptable performance cost for this scale.

### Role-based access without separate apps
Admin, Owner, and Member access is controlled via permission classes (`IsAdmin`, `IsOrganizationOwner`, `HasActiveOrganization`) rather than separate Django apps or URL namespaces, keeping the routing simple and the permission logic explicit.

### JWT authentication
Stateless tokens with short-lived access tokens and refresh tokens integrate naturally with a single-page React frontend without requiring session cookies or CSRF handling.

### Admin seeded via management command
The initial admin user is created by `python manage.py setup_admin`, which reads credentials from environment variables. This avoids hard-coded secrets and works identically in local dev, Docker, and CI.
