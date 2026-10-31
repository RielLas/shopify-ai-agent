# 🛍️ AURA Atelier — Shopify Autonomous AI Shopping Assistant

> **A production-ready, zero-build reference implementation of an Autonomous AI Shopping Concierge integrated with Shopify's Storefront GraphQL API (2024-01+).**

---

## 🌟 Key Highlights

- **Live Shopify Storefront API Integration:** Connects out-of-the-box with Shopify's official Storefront GraphQL endpoint (`https://mock.shop/api`) and switches seamlessly to any private `.myshopify.com` store.
- **Client-Side LLM Function Calling:** The AI Assistant uses formal tool calling to search products by keyword/budget/category and triggers live Shopify `cartCreate` mutations to generate real checkout URLs.
- **⚡ Technical Architecture Inspector:** Built-in slide-over inspector that reveals live GraphQL queries, variables, network round-trip latency, and raw response JSON in real time.
- **Zero API Key Requirement:** Includes an intelligent client-side heuristic engine for instant, 100% reliable local evaluation, plus optional plug-and-play settings for Google Gemini 1.5 or OpenAI GPT-4o-mini keys.
- **Ultra-Lightweight & Thermal-Friendly:** Zero npm dependencies, zero build steps, and zero background daemons. Runs directly via any static file server.

---

## 🚀 Quick Start (Instant Preview)

### Method 1: Using Built-in Python Server (Recommended)
Open PowerShell or Terminal in this folder and run:

```powershell
python -m http.server 3000
```

Then open your browser at:  
👉 **`http://localhost:3000`**

### Method 2: Using Node / npx serve
```bash
npx serve .
```

### Method 3: One-Click Deploy to Vercel / Netlify / GitHub Pages
Because this project uses standard ES Modules and static assets, you can deploy it directly:
- **Vercel:** Drag and drop this folder onto [vercel.com](https://vercel.com) or run `vercel`.
- **GitHub Pages:** Push to a repository and enable GitHub Pages on `main`.

---

## 📂 Project Structure

```
Shopify AI agents/
├── index.html               # Main Storefront UI, Concierge Drawer & Inspector
├── style.css                # Modern design system, glassmorphism & micro-animations
├── app.js                   # Application state manager, catalog renderer & UI bindings
├── ai-agent.js              # Tool definitions, intent parser, and heuristic/LLM runner
├── shopify-client.js        # Shopify Storefront GraphQL client with inspector telemetry
├── config.js                # Store configuration, endpoints & starter prompts
├── ARCHITECTURE.md          # In-depth 3-tier architecture document for technical clients
├── DEVELOPER_PROFILE.md     # 1-page technical developer profile & credentials
└── README.md                # Quick start, feature guide & client pitching template
```

---

## ⚙️ Connecting to a Private Shopify Store

To connect this assistant to your custom Shopify store:

1. Open `config.js` (or click the ⚙️ Settings icon in the top navigation):
   ```javascript
   export const CONFIG = {
     store: {
       name: "Your Store Name",
       endpoint: "https://YOUR-STORE.myshopify.com/api/2024-01/graphql.json",
       storefrontAccessToken: "YOUR_STOREFRONT_ACCESS_TOKEN",
       currency: "USD",
       apiVersion: "2024-01"
     }
     // ...
   };
   ```
2. Save the file and refresh. The assistant and storefront will immediately query your store's live inventory and generate checkouts on your domain!

---

## 💬 Client Pitch & Reddit Response Template

When responding to the client on Reddit for the **INR 30k–40k ($400–$500)** project, use this concise, high-converting reply:

***

**Subject / Reply:** Re: Shopify AI Agent Integration

> Hi there,
>
> I saw your post looking for an engineer to integrate an AI shopping assistant into your Shopify store. Rather than sending a generic pitch, I went ahead and built a working reference implementation so you can see the exact architecture in action:
>
> **Live Demo & Codebase:** [Provide your GitHub repo / hosted link]  
>
> **Key Technical Highlights:**
> 1. **Direct Storefront GraphQL Integration:** Queries live product variants and executes native Shopify `cartCreate` mutations to generate real checkout sessions without redirect friction.
> 2. **Client-Side Tool Calling:** Natural language intent parsing that handles budget constraints (e.g., *"find black sneakers under $50"*), style pairing, and one-click cart additions.
> 3. **⚡ Built-in Architecture Inspector:** If you click the **"⚡ Inspector"** button in the top navigation, you can inspect the exact GraphQL queries, variables, and network latency running against the Shopify API in real-time.
> 4. **Zero-Bloat & Fast:** No multi-megabyte bundle dependencies, preserving your Shopify store's Core Web Vitals and SEO rankings.
>
> I've also attached my **1-page technical profile (`DEVELOPER_PROFILE.md`)** and a complete **architectural breakdown (`ARCHITECTURE.md`)** detailing the data flow, webhook HMAC verification, and security boundaries.
>
> For a clean setup tailored to your store's catalog and brand tone, my fixed rate fits right into your budget (INR 30k–40k / $400–$500) with a 3–5 day turnaround.
>
> Happy to jump on a quick 10-minute call or chat here to show you how easily we can plug this into your theme. Let me know what you think!
>
> Best,  
> **Fahad**  
> Full-Stack & AI Systems Developer

***
