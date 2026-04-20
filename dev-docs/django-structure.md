# Estrutura de Projeto Django (Completa e Pragmática)

## 1. Visão Geral

Esta estrutura organiza o backend Django por **domínios de negócio** e aplica o padrão de separação em:

* Models → dados
* Services → regras de negócio
* Selectors → consultas
* API → endpoints

O objetivo é manter o projeto **organizado, escalável e simples**, adequado para implementação rápida.

---

## 2. Estrutura de Pastas

```bash
backend/
│
├── config/                     # Configuração global do Django
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/                       # Domínios do sistema
│   │
│   ├── users/
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── selectors.py
│   │   ├── api.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── permissions.py
│   │
│   ├── products/
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── selectors.py
│   │   ├── api.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── stock/
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── selectors.py
│   │   ├── api.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── purchases/
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── selectors.py
│   │   ├── api.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── sales/
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── selectors.py
│   │   ├── api.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   └── financial/
│       ├── services.py
│       ├── selectors.py
│       ├── api.py
│       └── urls.py
│
├── common/                     # Código compartilhado (opcional)
│   ├── models.py               # BaseModel (created_at, updated_at)
│   ├── permissions.py
│   ├── exceptions.py
│   └── utils.py
│
├── manage.py
├── requirements.txt
└── Dockerfile
```

---

## 3. Responsabilidades por Camada

| Camada      | Responsabilidade            |
| ----------- | --------------------------- |
| models      | Estrutura do banco de dados |
| services    | Regras de negócio           |
| selectors   | Consultas ao banco          |
| api         | Endpoints (views)           |
| serializers | Validação e transformação   |
| permissions | Controle de acesso          |

---

## 4. Fluxo da Aplicação

```text
Request → API → Service → Model/DB
                   ↓
              Selector (se necessário)
                   ↓
Response ← Serializer ← API
```

---

## 5. Organização por Domínio

Cada app representa um domínio:

* **users** → autenticação e usuários
* **products** → cadastro de produtos
* **stock** → controle de estoque
* **purchases** → pedidos de compra
* **sales** → pedidos de venda
* **financial** → cálculos e dashboard

---

## 6. Decisões Importantes

* Separação por domínio melhora organização e escalabilidade
* `services.py` centraliza regras de negócio
* `selectors.py` evita queries espalhadas
* `stock` é separado de `products` por ter regras próprias

---

## 7. Simplificações para Projeto Rápido

Se necessário:

* Pode evitar `selectors.py` inicialmente
* Pode usar permissões padrão do DRF
* Pode simplificar `common/` ou não utilizar

Mas manter:

* Separação por apps
* Uso de `services`
