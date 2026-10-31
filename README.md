# AURA Atelier - Shopify AI Shopping Assistant

A reference implementation showing an AI shopping concierge integrated directly with Shopify's Storefront GraphQL API.

---

## What this shows

- **Direct Storefront GraphQL integration:** Queries products and executes Shopify `cartCreate` mutations without backend middleware.
- **Tool calling:** The assistant parses natural language requests, filters products by price or category, and builds checkout sessions in chat.
- **Architecture inspector:** A slide-over panel that logs GraphQL queries, variables, and response latencies in real time.
- **Zero setup mode:** Runs out of the box using an intent engine and Shopify's public mock endpoint. Works without entering an API key, while still supporting custom Gemini or OpenAI keys through settings.
- **Static assets only:** No npm dependencies, build tools, or background daemons.

---

## Quick Start

### Option 1: Python static server
In PowerShell or terminal:

```powershell
cd "d:\Wonderland Discord\Projects\Shopify AI agents"
python -m http.server 3000
```

Open `http://localhost:3000` in your browser.

### Option 2: Node / npx
```bash
npx serve .
```

### Option 3: GitHub Pages
Push to a repository and enable Pages on the `main` branch.

---

## Project Structure

```
Shopify AI agents/
├── index.html          # Storefront UI, chat drawer, and inspector
├── style.css           # Styling and layout
├── app.js              # State manager and UI bindings
├── ai-agent.js         # Tool definitions, intent parser, and model runner
├── shopify-client.js   # GraphQL client with query telemetry
├── config.js           # Endpoints, store settings, and prompts
├── ARCHITECTURE.md     # Technical breakdown of the integration
└── DEVELOPER_PROFILE.md# Developer background and technical focus
```

---

## Connecting a Custom Shopify Store

1. Open `config.js` or use the settings modal in the UI:
   ```javascript
   export const CONFIG = {
     store: {
       name: "Your Store",
       endpoint: "https://your-store.myshopify.com/api/2024-01/graphql.json",
       storefrontAccessToken: "YOUR_TOKEN",
       currency: "USD",
       apiVersion: "2024-01"
     }
   };
   ```
2. Save and reload. The assistant will query your store catalog directly.
