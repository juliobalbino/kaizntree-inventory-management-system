# IM — Development Checklist

> Legend: `[ ]` pending · `[x]` done

---

## Backend

- [X] **STEP 1** — Project Setup (Django + PostgreSQL + settings)
- [X] **STEP 2** — Users App (Custom User, JWT auth, register/login endpoints)
- [X] **STEP 3** — Products App (CRUD, selectors, services)
- [X] **STEP 4** — Stock App (manual add, deduct, negative stock guard)
- [X] **STEP 5** — Purchases App (PurchaseOrder + items, confirm → creates stock)
- [X] **STEP 6** — Sales App (SalesOrder + items, confirm → decrements stock)
- [X] **STEP 7** — Financial App (summary + per-product breakdown endpoints)
- [X] **STEP 8** — Suppliers App (CRUD + supplier FK on PurchaseOrder)
- [X] **STEP 9** — Customers App (CRUD + customer FK on SalesOrder)
- [X] **STEP 9.5** — Organizations App (Organization + Membership, org-scoped isolation, /me endpoint, switch org)

---

## Frontend

- [X] **STEP 10** — Project Setup (Vite + Mantine + TanStack Query + Axios + Router)
- [X] **STEP 11** — Auth Feature + Login Page
- [X] **STEP 12** — Layout + AppShell + Role-Based Navbar (admin / owner / member)
- [X] **STEP 13** — Products Feature (list, create, detail page)
- [X] **STEP 14** — Suppliers Feature (list, create, edit, delete)
- [X] **STEP 15** — Customers Feature (list, create, edit, delete)
- [X] **STEP 16** — Purchases Feature (list, create, confirm + supplier selector)
- [X] **STEP 17** — Sales Feature (list, create, confirm + customer selector)
- [X] **STEP 18** — Dashboard (stat cards + per-product financial table)
- [X] **STEP 18.1** — Admin Pages (Organizations CRUD + Users CRUD, admin only)
- [X] **STEP 18.2** — Owner Settings Pages (Members + Org Settings + Profile, with DataTable pagination)

---

## Finishing

- [x] **STEP 19** — Tests (pytest: profit calc, negative stock, user isolation, supplier/customer isolation)
- [x] **STEP 20** — Docker (Dockerfile x2 + docker-compose.yml)
- [X] **STEP 21** — README (setup guide + API docs + architecture decisions)

---

## Notes


### STEP 1
### STEP 2
### STEP 3
### STEP 4
### STEP 5
### STEP 6
### STEP 7
### STEP 8
### STEP 9
### STEP 10
### STEP 11
### STEP 12
### STEP 13
### STEP 14
### STEP 15
### STEP 16
### STEP 17
### STEP 18
### STEP 18.1
### STEP 18.2
### STEP 19
### STEP 20
### STEP 21
