# Inventory Management System - Plan

## Objective
Build a functional inventory management application with a Django backend and a React frontend, covering all mandatory requirements: products, stock, purchase/sales orders, financial tracking, and authentication.

---

## Scope

### Mandatory Features
- Product registration (name, description, SKU, unit)
- Stock management
- Stock input via:
  - Manual
  - Purchase order
- Product sales via sales orders
- Financial tracking:
  - Total purchased
  - Total sold
  - Profit
  - Margin
- Authentication
- Per-user data isolation

---

## Architecture

- Backend: Django + DRF
- Frontend: React + TanStack Query + Mantine
- Database: PostgreSQL
- Auth: JWT

---

## Models

### User
- id, email, password

### Product
- id
- name
- description
- sku
- unit (kg, g, L, mL, unit)
- user

### Stock
- id
- product
- quantity

### PurchaseOrder
- id
- user
- total_cost

### PurchaseOrderItem
- product
- quantity
- unit_cost

### SalesOrder
- id
- user
- total_revenue

### SalesOrderItem
- product
- quantity
- unit_price

---

## Backend

### Setup
- Create Django project
- Configure PostgreSQL
- Install DRF
- Implement authentication

### Required Endpoints

#### Auth
- POST /login

#### Products
- GET /products
- POST /products

#### Stock
- POST /stock (manual)

#### Purchase Order
- POST /purchase-orders
  - automatically creates stock

#### Sales Order
- POST /sales-orders
  - validates stock
  - decrements stock

#### Financial
- GET /dashboard
  - total_cost
  - total_revenue
  - profit
  - margin

### Critical Rules
- Never allow negative stock
- Calculate profit on the backend
- Filter all data per user

---

## Frontend

### Screens

#### Login

#### Products
- List
- Create

#### Purchase
- Create purchase order

#### Sales
- Create sales order

#### Dashboard
- Display:
  - Revenue
  - Costs
  - Profit
  - Margin

---

## Tests

- Test:
  - purchase creation
  - sales creation
  - profit calculation