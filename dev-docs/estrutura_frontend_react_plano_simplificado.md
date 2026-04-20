# Estrutura de Frontend (React + Mantine + TanStack Query + Tailwind)

## 1. Objetivo
Definir uma estrutura simples, organizada e rápida de implementar para o frontend do sistema de inventário, evitando overengineering e cobrindo boas práticas modernas.

---

## 2. Estrutura de Pastas

```bash
frontend/
│
├── src/
│   │
│   ├── app/                     # configuração global
│   │   ├── providers.tsx        # QueryClient + MantineProvider
│   │   └── router.tsx           # rotas
│   │
│   ├── pages/                   # telas
│   │   ├── login/
│   │   ├── products/
│   │   ├── purchases/
│   │   ├── sales/
│   │   └── dashboard/
│   │
│   ├── features/                # lógica por domínio
│   │   ├── products/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── purchases/
│   │   ├── sales/
│   │   └── dashboard/
│   │
│   ├── components/              # componentes reutilizáveis
│   │   ├── layout/
│   │   ├── ui/
│   │   └── forms/
│   │
│   ├── lib/                     # infraestrutura
│   │   ├── api-client.ts
│   │   ├── query-client.ts
│   │   └── utils.ts
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
└── tailwind.config.js
```

---

## 3. Responsabilidades

### app/
Configuração global da aplicação:
- Providers (Mantine + React Query)
- Rotas

---

### pages/
Representa telas da aplicação:
- Login
- Produtos
- Compras
- Vendas
- Dashboard

Cada página deve ser **simples**, delegando lógica para features.

---

### features/
Responsável pela lógica de cada domínio.

Contém:
- `api.ts` → chamadas HTTP
- `hooks.ts` → React Query
- `types.ts` → tipagens

---

### components/
Componentes reutilizáveis:

- `ui/` → botões, inputs
- `layout/` → header, sidebar
- `forms/` → formulários

---

### lib/
Infraestrutura compartilhada:

- cliente HTTP (axios/fetch)
- configuração do React Query
- utilitários

---

## 4. Sobre "services" no Frontend

Não é necessário criar uma pasta `services/` separada.

A responsabilidade de service já é atendida por:

```ts
features/<domain>/api.ts
```

Exemplo:

```ts
export const fetchProducts = async () => {
  const { data } = await api.get('/products');
  return data;
};
```

---

## 5. Fluxo de Dados

```text
Page → Hook (React Query) → API → Backend
```

---

## 6. Boas Práticas

- Não colocar fetch direto nos componentes
- Manter páginas leves
- Separar lógica por domínio
- Reutilizar componentes

---

## 7. Simplificação para Prazo Curto

Se necessário, reduzir para:

```bash
src/
├── pages/
├── components/
├── api/
├── hooks/
```

---

## 8. Conclusão

Essa estrutura garante:

- Organização
- Clareza
- Rapidez de desenvolvimento
- Boa separação de responsabilidades

Ideal para entrega em curto prazo mantendo qualidade técnica.

