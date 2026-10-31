# Shopify Autonomous AI Shopping Agent — Architecture & Technical Specification

> **A Reference Architecture for Low-Latency, Zero-Cold-Start AI Clienteling on Shopify**  
> *Targeted for E-Commerce Brands Seeking High-Conversion Conversational Commerce*

---

## 1. Executive Summary

This reference implementation demonstrates a modern, production-grade **Autonomous AI Shopping Assistant** integrated directly with Shopify's **Storefront GraphQL API (2024-01+)**. 

Unlike conventional chatbots that rely on static FAQ retrieval or brittle iframe widgets, this architecture leverages **Client-Side LLM Function Calling** paired with native Shopify GraphQL mutations. It empowers shoppers to discover products through natural language, filter intelligently by price and style, and generate authentic Shopify checkout sessions directly inside the conversation stream.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SHOPPER STOREFRONT UI                           │
│  (Modern Responsive Web / Liquid Theme / Headless Hydrogen / Next.js)  │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
   ┌──────────────────────────────┐  ┌───────────────────────────────────┐
   │    AURA SHOPPING CONCIERGE   │  │   ⚡ ARCHITECTURE INSPECTOR       │
   │  - Natural Language Parser   │  │  - Live GraphQL Query Tracing    │
   │  - Tool Calling Dispatcher   │  │  - Real-Time Latency Profiler     │
   │  - Rich Cart & Product Cards │  │  - Variable & Payload Inspector   │
   └───────────────┬──────────────┘  └─────────────────▲─────────────────┘
                   │                                   │
                   │ (Tool Invocations)                │ (Telemetry Events)
                   ▼                                   │
   ┌───────────────────────────────────────────────────┴─────────────────┐
   │                   SHOPIFY STOREFRONT GRAPHQL CLIENT                 │
   │  - Query: products(first, query, sortKey)                           │
   │  - Mutation: cartCreate(input: { lines: [...] })                    │
   │  - Session: checkoutUrl Hand-off                                    │
   └───────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS / Direct GraphQL
                                   ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │                     SHOPIFY GLOBAL COMMERCE API                     │
   │           (mock.shop / live .myshopify.com Storefront)              │
   └─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

### 2.1 The 3-Tier Integration Model

```
                    Tier 1: Conversational Clienteling
                   ┌──────────────────────────────────┐
                   │    Aura Concierge UI Widget      │
                   │  (Drawer / Bubble / Inline Cards)│
                   └────────────────┬─────────────────┘
                                    │
                    Tier 2: Tool Calling & Reasoning
                   ┌────────────────▼─────────────────┐
                   │       AI Agent Tool Engine       │
                   │  • search_products(q, maxPrice)  │
                   │  • create_cart_checkout(variant) │
                   └────────────────┬─────────────────┘
                                    │
                    Tier 3: Shopify Storefront Commerce
                   ┌────────────────▼─────────────────┐
                   │  Storefront GraphQL API 2024-01  │
                   │  • Product / Variant Resolver    │
                   │  • cartCreate Mutation           │
                   └──────────────────────────────────┘
```

#### Tier 1: Zero-Bloat Presentation Layer
- **Lightweight footprint:** Built without heavy multi-megabyte dependencies, ensuring sub-100ms initialization and no impact on Shopify Core Web Vitals (LCP/CLS).
- **Embedded Interactive Elements:** Direct "Add to Cart" and "Instant Checkout" buttons rendered inline within AI response bubbles.

#### Tier 2: Dual-Engine Tool Calling & Reasoning
- **Engine A: Intelligent Heuristic Agent (Zero API Key Mode):**  
  An ultra-fast client-side intent classifier that parses pricing thresholds (e.g., *"under $50"*, *"below 30"*), product categories (*"slides"*, *"tees"*, *"hoodies"*), and purchasing verbs (*"checkout"*, *"buy"*, *"cart"*). Executes valid Shopify tools with zero server cost or external API keys.
- **Engine B: LLM Tool Calling (Gemini / OpenAI):**  
  Implements standard Function Calling schemas (`tools` parameter) where the LLM produces structured JSON tool arguments executed against the Storefront API.

#### Tier 3: Shopify Storefront GraphQL & Checkout Hand-off
- Direct execution of standard Shopify Storefront GraphQL queries.
- Leverages the official `cartCreate` mutation to generate a native Shopify session (`gid://shopify/Cart/...`) and returns a direct `checkoutUrl` hosted securely on Shopify's PCI-DSS Level 1 compliant checkout infrastructure.

---

## 3. Tool Calling Specification (JSON Schema)

The AI Agent operates strictly through validated tool schemas:

### Tool 1: `search_products`
```json
{
  "name": "search_products",
  "description": "Search the Shopify catalog by query, maximum budget, and category.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Search keyword (e.g., 'sneakers', 'slides')" },
      "maxPrice": { "type": "number", "description": "Optional upper budget limit in store currency" },
      "category": { "type": "string", "description": "Optional category filter" }
    }
  }
}
```

### Tool 2: `create_cart_checkout`
```json
{
  "name": "create_cart_checkout",
  "description": "Initializes a Shopify cart session and produces an authentic checkout URL.",
  "parameters": {
    "type": "object",
    "properties": {
      "variantId": { "type": "string", "description": "Shopify ProductVariant GID" },
      "quantity": { "type": "integer", "description": "Number of units (defaults to 1)" }
    },
    "required": ["variantId"]
  }
}
```

---

## 4. GraphQL Operations

### 4.1 Product Catalog Query (`GetProducts`)
```graphql
query GetProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        title
        description
        featuredImage {
          url
          altText
        }
        variants(first: 5) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
```

### 4.2 Checkout Mutation (`CartCreateMutation`)
```graphql
mutation CartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 5) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

---

## 5. Security & Authentication Architecture

| Layer | Credential Type | Scope | Security Posture |
|---|---|---|---|
| **Storefront API** | `X-Shopify-Storefront-Access-Token` | Read-only Catalog & Cart Mutation | Safe for public client-side bundling (designed by Shopify for headless web apps). |
| **Admin API** | Private App Secret Token | Full Store / Order / Customer Read & Write | **Strictly Server-Side Only.** Never exposed in client code. |
| **Webhooks** | `X-Shopify-Hmac-Sha256` | Order & Inventory Event Listeners | Verified via HMAC-SHA256 signature verification in Node/Python backend. |

### Webhook HMAC Validation Pattern (for Backend Sync)
```javascript
import crypto from 'crypto';

export function verifyShopifyWebhook(rawBody, hmacHeader, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
}
```

---

## 6. Real-Time Telemetry: Architecture Inspector

The built-in **Technical Architecture Inspector** provides continuous observability:
1. **Request Tracing:** Captures exact GraphQL queries, variables, and network round-trip latencies in milliseconds.
2. **Payload Inspection:** Inspects raw JSON returned by Shopify for every tool invocation.
3. **Audit Trail:** Proves to technical buyers and security auditors that the agent runs live Shopify Storefront mutations without simulated mock data.

---

## 7. Private Shopify Store Migration in 3 Steps

To transition this assistant from `mock.shop` to your live private Shopify store:

1. In Shopify Admin, navigate to **Apps and sales channels** → **Develop apps** → **Create an app**.
2. Under **Configuration**, enable **Storefront API access** (grant `unauthenticated_read_product_listings` and `unauthenticated_write_checkouts`).
3. In `config.js` (or via the Assistant UI Settings):
   ```javascript
   export const CONFIG = {
     store: {
       name: "Your Brand Name",
       endpoint: "https://your-store.myshopify.com/api/2024-01/graphql.json",
       storefrontAccessToken: "your_public_storefront_access_token_here"
     }
   };
   ```

Done! The assistant immediately queries your store's live inventory and generates checkouts directly on your brand domain.
