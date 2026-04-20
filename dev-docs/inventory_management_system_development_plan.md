# Sistema de Gestão de Inventário - Plano Simplificado (2 Dias)

## 1. Objetivo
Construir uma aplicação funcional de gestão de inventário com backend em Django + DRF e frontend em React, cobrindo todos os requisitos obrigatórios: produtos, estoque, pedidos de compra/venda, financeiro e autenticação.

Foco: **entregar completo, simples e bem estruturado**, sem overengineering.

---

## 2. Escopo (Requisitos Cobertos)

### Funcionalidades obrigatórias
- Cadastro de produtos (name, description, SKU, unidade)
- Controle de estoque
- Entrada de estoque via:
  - Manual
  - Pedido de compra
- Venda de produtos via pedido de venda
- Controle financeiro:
  - Total comprado
  - Total vendido
  - Lucro
  - Margem
- Autenticação
- Isolamento de dados por usuário

---

## 3. Arquitetura Simples

- Backend: Django + DRF
- Frontend: React + TanStack Query + Mantine
- Banco: PostgreSQL
- Auth: Token simples (DRF Token ou JWT)

---

## 4. Modelos Essenciais (Simplificados)

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

## 5. Backend (Prioridade Alta)

### 5.1 Setup
- Criar projeto Django
- Configurar Postgres
- Instalar DRF
- Criar autenticação

### 5.2 Endpoints obrigatórios

#### Auth
- POST /login

#### Produtos
- GET /products
- POST /products

#### Estoque
- POST /stock (manual)

#### Pedido de Compra
- POST /purchase-orders
  - cria estoque automaticamente

#### Pedido de Venda
- POST /sales-orders
  - valida estoque
  - decrementa estoque

#### Financeiro
- GET /dashboard
  - total_cost
  - total_revenue
  - profit
  - margin

### 5.3 Regras críticas
- Nunca permitir estoque negativo
- Calcular lucro no backend
- Filtrar tudo por usuário

---

## 6. Frontend (Essencial apenas)

### Telas mínimas

#### Login

#### Produtos
- Listar
- Criar

#### Compra
- Criar pedido de compra

#### Venda
- Criar pedido de venda

#### Dashboard
- Mostrar:
  - Receita
  - Custos
  - Lucro
  - Margem

---

## 7. Plano de Execução (2 Dias)

### Dia 1 (Backend completo)
- Setup Django + DRF
- Modelos
- Auth
- CRUD produtos
- Pedido de compra (com entrada de estoque)
- Pedido de venda (com baixa de estoque)
- Endpoint financeiro

### Dia 2 (Frontend + Finalização)
- Setup React
- Integração com API
- Telas principais
- Ajustes finais
- README

---

## 8. Testes (mínimo viável)

- Testar:
  - criação de compra
  - criação de venda
  - cálculo de lucro

---

## 9. Entrega

- Código no GitHub
- README com:
  - como rodar
  - decisões técnicas

---

## 10. Decisões Importantes (para explicar na entrevista)

- Simplificação intencional para cumprir prazo
- Lógica de negócio no backend
- Estrutura preparada para escalar

---

## 11. O que NÃO fazer (para não perder tempo)

- Não implementar features extras
- Não fazer UI complexa
- Não otimizar prematuramente
- Não usar arquitetura complexa (DDD completo, etc.)

---

## 12. Resultado Esperado

Uma aplicação:
- Funcional
- Completa nos requisitos
- Simples
- Fácil de explicar tecnicamente

Isso é mais valioso do que algo incompleto ou super complexo.

