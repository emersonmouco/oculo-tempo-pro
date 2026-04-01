# Módulo de Controle de Estoque — Documentação Técnica

## 1. Visão Geral

O módulo de controle de estoque implementa rastreabilidade completa de todas as entradas e saídas de mercadorias, com integração nativa ao PDV e ao módulo de Compras. Ele segue o padrão **ledger imutável**: cada alteração no saldo de um produto gera um registro permanente em `stock_movements`, que serve como trilha de auditoria.

```
Produto (saldo atual)
    ↑ atualizado por cada movimentação
    │
stock_movements (registro histórico imutável)
    │ referenciado por
    ├── sales (venda → saída automática pelo PDV)
    └── purchase_orders (compra → entrada ao receber)
```

---

## 2. Modelo de Dados

### 2.1 `products` (tabela existente — colunas relevantes)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `stock_quantity` | `INTEGER` | Saldo atual do produto. Atualizado a cada movimentação. |
| `min_stock_level` | `INTEGER` | Nível mínimo de alerta. Quando `stock_quantity ≤ min_stock_level`, o produto entra em estado **Baixo**. Quando `= 0`, estado **Ruptura**. |
| `cost_price` | `NUMERIC` | Custo unitário usado para calcular o valor total em estoque. |

### 2.2 `stock_movements` (nova tabela)

Ledger imutável. Nenhum registro é deletado — apenas inserido.

| Coluna | Tipo | Valores possíveis | Descrição |
|--------|------|-------------------|-----------|
| `id` | `UUID` | — | PK gerado automaticamente |
| `product_id` | `UUID` | FK → `products` | Produto movimentado |
| `movement_type` | `TEXT` | `entrada`, `saida`, `ajuste_positivo`, `ajuste_negativo`, `devolucao_cliente`, `devolucao_fornecedor` | Tipo da operação |
| `quantity` | `INTEGER` | > 0 | Quantidade da movimentação (sempre positiva) |
| `previous_quantity` | `INTEGER` | — | Saldo antes da movimentação |
| `new_quantity` | `INTEGER` | — | Saldo após a movimentação |
| `reference_type` | `TEXT` | `venda`, `compra`, `ajuste`, `devolucao`, `inventario` | Origem da movimentação |
| `reference_id` | `UUID` | — | ID da venda ou pedido de compra relacionado |
| `notes` | `TEXT` | — | Observações livres |
| `operator` | `TEXT` | — | Nome do responsável pela operação |
| `created_at` | `TIMESTAMPTZ` | — | Data/hora do registro |

**Cálculo do `new_quantity`:**
```
Tipos que aumentam: entrada, ajuste_positivo, devolucao_cliente
  new_quantity = previous_quantity + quantity

Tipos que reduzem: saida, ajuste_negativo, devolucao_fornecedor
  new_quantity = previous_quantity - quantity
```

### 2.3 `purchase_orders` (nova tabela)

Pedidos de compra aos fornecedores.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` | PK |
| `order_number` | `TEXT` | Gerado automaticamente via trigger: `PC-YYYYMMDD-NNNN` |
| `supplier_id` | `UUID` | FK → `legal_persons` (fornecedor) |
| `status` | `TEXT` | Ciclo de vida do pedido (ver seção 4) |
| `order_date` | `DATE` | Data de emissão |
| `expected_date` | `DATE` | Previsão de entrega |
| `received_date` | `DATE` | Data efetiva de recebimento completo |
| `subtotal / discount / total` | `NUMERIC` | Valores do pedido |
| `operator` | `TEXT` | Comprador responsável |

### 2.4 `purchase_order_items` (nova tabela)

Itens individuais do pedido.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `purchase_order_id` | `UUID` | FK → `purchase_orders` |
| `product_id` | `UUID` | FK → `products` |
| `quantity_ordered` | `INTEGER` | Quantidade pedida |
| `quantity_received` | `INTEGER` | Quantidade já recebida (cumulativa) |
| `unit_cost` | `NUMERIC` | Custo unitário negociado |
| `subtotal` | `NUMERIC` | `quantity_ordered × unit_cost` |

---

## 3. Fluxo de Entrada de Estoque

### 3.1 Via Pedido de Compra (recomendado)

```
Módulo Compras → Novo Pedido → [itens + fornecedor] → status: rascunho
    ↓ Vendedor envia ao fornecedor
status: enviado
    ↓ Fornecedor confirma
status: confirmado → em_transito
    ↓ Mercadoria chega
Compras → Receber Pedido → informe qtd recebida por item
    ↓ Para cada item com qty > 0:
        INSERT stock_movements (movement_type='entrada', reference_type='compra')
        UPDATE products.stock_quantity += qty_received
    ↓ Se todos itens recebidos: status = 'recebido'
       Se parcial: status = 'recebido_parcial'
```

### 3.2 Via Ajuste Manual (estoque → "Ajustar")

Use quando:
- Receber mercadoria sem pedido formal
- Corrigir diferenças de inventário
- Registrar doação ou bonificação

```
Estoque → [selecionar produto] → Ajustar Estoque
    → tipo: entrada | ajuste_positivo | devolucao_cliente
    → quantidade, operador, observação
    → INSERT stock_movements
    → UPDATE products.stock_quantity
```

---

## 4. Fluxo de Saída de Estoque

### 4.1 Automática via PDV

Ao finalizar uma venda no PDV, para cada item do carrinho:

```javascript
// PDV.tsx — finalizeSale()
for (const item of cart) {
  const newQty = item.product.stock_quantity - item.quantity;

  // 1. Atualiza saldo
  await db.from("products")
    .update({ stock_quantity: newQty })
    .eq("id", item.product.id);

  // 2. Registra no ledger
  await db.from("stock_movements").insert({
    movement_type: "saida",
    reference_type: "venda",
    reference_id: saleId,
    quantity: item.quantity,
    previous_quantity: item.product.stock_quantity,
    new_quantity: newQty,
    ...
  });
}
```

### 4.2 Via Ajuste Manual

Para registrar perdas, avarias ou devoluções ao fornecedor:
- Tipo `ajuste_negativo`: perda/avaria/inventário
- Tipo `devolucao_fornecedor`: mercadoria devolvida ao fornecedor

---

## 5. Ciclo de Vida do Pedido de Compra

```
rascunho ──► enviado ──► confirmado ──► em_transito
                │                            │
                │                            ▼
                │                    recebido_parcial
                │                            │
                │                            ▼
                └──────────────────────► recebido
                
Em qualquer estado até 'em_transito': pode ser cancelado
```

| Status | Significado |
|--------|-------------|
| `rascunho` | Criado localmente, não enviado |
| `enviado` | E-mail/WhatsApp enviado ao fornecedor |
| `confirmado` | Fornecedor aceitou o pedido |
| `em_transito` | Mercadoria despachada |
| `recebido_parcial` | Parte dos itens recebida |
| `recebido` | Todos os itens recebidos |
| `cancelado` | Pedido cancelado |

---

## 6. Alertas de Estoque

O sistema classifica cada produto em três estados:

| Estado | Condição | Cor |
|--------|----------|-----|
| **Normal** | `stock_quantity > min_stock_level` (ou sem mínimo) | Verde |
| **Baixo** | `0 < stock_quantity ≤ min_stock_level` | Amarelo |
| **Ruptura** | `stock_quantity = 0` | Vermelho |

Os produtos em **Baixo** ou **Ruptura** aparecem:
1. No banner de alertas da página **Estoque**
2. Na aba **Para Repor** da página **Compras**
3. No aviso de estoque baixo durante a finalização no **PDV**

---

## 7. Arquitetura de Código

```
src/
├── hooks/
│   ├── useStockMovements.ts    # Hook para movimentações de estoque
│   └── usePurchaseOrders.ts    # Hook para pedidos de compra
├── pages/
│   ├── Estoque.tsx             # UI: estoque atual + histórico + ajuste manual
│   ├── Compras.tsx             # UI: pedidos de compra + recebimento
│   └── PDV.tsx                 # UI: finalização integrada com movimentações
└── integrations/supabase/
    └── types.ts                # Tipos TypeScript (inclui novas tabelas)

supabase/migrations/
└── 20260401000000_inventory_control.sql  # Schema das novas tabelas
```

### 7.1 `useStockMovements`

```typescript
const { movements, loading, createMovement, createBatchMovements } = useStockMovements(productId?);
```

- `movements`: array de movimentações (opcional: filtrado por `productId`)
- `createMovement(input)`: cria 1 movimentação + atualiza saldo
- `createBatchMovements(inputs[])`: cria N movimentações em paralelo

### 7.2 `usePurchaseOrders`

```typescript
const { orders, loading, createOrder, updateStatus, receiveOrder, deleteOrder } = usePurchaseOrders();
```

- `createOrder(input)`: cria pedido + itens
- `updateStatus(id, status)`: avança o ciclo de vida
- `receiveOrder(order, receivedQtys, operator)`: recebe itens → cria `stock_movements` → atualiza status
- `deleteOrder(id)`: deleta (apenas rascunhos)

---

## 8. Decisões de Design

### Por que `stock_movements` é imutável?

Em ERPs de missão crítica, o histórico de estoque é usado para:
- Auditoria fiscal (SPED, NF-e)
- Reconciliação de inventário
- Detecção de fraudes
- Reversão de erros (estornos)

Deletar ou editar movimentações poderia criar inconsistências. O padrão correto é sempre criar uma **movimentação contrária** (ex.: uma saída incorreta é corrigida com uma entrada de ajuste).

### Por que duas operações (insert + update) em vez de uma trigger?

Em uma stack simples com Supabase sem servidor dedicado, usar RPC/triggers Postgres seria o ideal para garantir atomicidade. A implementação atual usa duas operações sequenciais que funcionam corretamente na ausência de alta concorrência (típico de uma ótica de pequeno porte). Para ambientes de alta concorrência, o ideal é criar uma `FUNCTION` Postgres e chamá-la via `supabase.rpc()`.

### `calcNewQuantity` centralizado

A função utilitária `calcNewQuantity(type, prev, qty)` é a única fonte de verdade para o cálculo do novo saldo. Qualquer componente que crie movimentações deve usar esta função — nunca calcular manualmente — evitando erros de sinal.

---

## 9. Como Executar a Migration

```bash
# Via Supabase CLI (local)
supabase db reset

# Ou aplicar individualmente no dashboard do Supabase:
# Settings → SQL Editor → colar o conteúdo de:
# supabase/migrations/20260401000000_inventory_control.sql
```

---

## 10. Próximas Evoluções Sugeridas

| Melhoria | Benefício |
|----------|-----------|
| `supabase.rpc('create_stock_movement', {...})` | Atomicidade real via transação Postgres |
| Lote de inventário (`inventory_count`) | Suporte a contagem física periódica com ajuste em massa |
| Localização de estoque (`location`) | Controle por prateleira/armário |
| Número de série (`serial_numbers`) | Rastreio individual por item (útil para relógios) |
| Reserva de estoque (`stock_reserved`) | Bloquear estoque em pré-vendas antes da finalização |
| Custo médio ponderado | Atualizar `cost_price` automaticamente a cada entrada |
