/**
 * Shopify AI Shopping Assistant - Configuration
 * 
 * Default is configured for Shopify's official Mock Storefront GraphQL API (mock.shop/api)
 * which supports live product queries and real cartCreate checkout sessions with zero auth required.
 * 
 * To switch to a custom private Shopify store:
 * 1. Set `endpoint` to 'https://YOUR-STORE.myshopify.com/api/2024-01/graphql.json'
 * 2. Set `storefrontAccessToken` to your store's public Storefront API access token.
 */

export const CONFIG = {
  store: {
    name: "AURA Atelier",
    tagline: "Curated Contemporary Footwear & Apparel",
    endpoint: "https://mock.shop/api",
    storefrontAccessToken: null, // null for mock.shop; add string token for private Shopify stores
    currency: "USD",
    apiVersion: "2024-01"
  },
  ai: {
    name: "Aura Concierge",
    subtitle: "AI Shopping Assistant & Personal Stylist",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    defaultProvider: "heuristic", // 'heuristic' (zero API key needed) | 'gemini' | 'openai'
    geminiApiKey: "",
    openaiApiKey: "",
    defaultGeminiModel: "gemini-3.8-flash", // Official Google AI Studio standard
    defaultOpenAIModel: "gpt-5-mini",
    systemPrompt: `You are Aura Concierge, an ultra-refined, helpful AI shopping assistant for AURA Atelier fashion store.
Your goal is to understand customer style preferences, budget, and sizing, query real products using your tools, and generate frictionless Shopify checkout links.
Always be concise, stylish, polite, and recommend specific items with reasons.`
  },
  starterPrompts: [
    {
      label: "Footwear under $50",
      prompt: "Show me footwear or slides under $50 with sizes"
    },
    {
      label: "Outerwear and layers",
      prompt: "What winter tops or jackets do you have in stock?"
    },
    {
      label: "Trending arrivals",
      prompt: "What are your top recommended apparel picks right now?"
    },
    {
      label: "Add Slides to cart",
      prompt: "Add comfortable slides to my cart and give me the checkout link"
    }
  ]
};
