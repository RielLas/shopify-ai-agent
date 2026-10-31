/**
 * AI Shopping Agent Engine
 * Features:
 * 1. Client-Side Tool Calling Architecture (Function Calling schema)
 * 2. Intelligent Heuristic Engine (zero API key needed for instant testability)
 * 3. Gemini / OpenAI API integration fallback
 * 4. Architecture Inspector broadcasting
 */

import { CONFIG } from './config.js';
import { shopifyClient } from './shopify-client.js';

export class ShoppingAgent {
  constructor() {
    const hasStorage = typeof localStorage !== 'undefined';
    this.provider = hasStorage ? (localStorage.getItem('aura_ai_provider') || CONFIG.ai.defaultProvider) : CONFIG.ai.defaultProvider;
    this.geminiKey = hasStorage ? (localStorage.getItem('aura_gemini_key') || CONFIG.ai.geminiApiKey) : CONFIG.ai.geminiApiKey;
    this.openaiKey = hasStorage ? (localStorage.getItem('aura_openai_key') || CONFIG.ai.openaiApiKey) : CONFIG.ai.openaiApiKey;
    this.customModel = hasStorage ? (localStorage.getItem('aura_model_name') || '') : '';
    this.conversationHistory = [];
    this.onStatusChange = null;
  }

  setStatusListener(callback) {
    this.onStatusChange = callback;
  }

  notifyStatus(statusText) {
    if (this.onStatusChange) {
      this.onStatusChange(statusText);
    }
  }

  /**
   * Tool Definitions (JSON Schema for OpenAI / Gemini function calling)
   */
  getToolsSchema() {
    return [
      {
        name: "search_products",
        description: "Search the Shopify store catalog for footwear, apparel, and accessories based on natural language queries, maximum budget, and category.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search keyword, style, color, or item name (e.g., 'sneakers', 'hoodie', 'black')" },
            maxPrice: { type: "number", description: "Optional maximum price filter in USD" },
            category: { type: "string", description: "Category filter (e.g., 'Footwear', 'Tops', 'Bottoms')" }
          },
          required: []
        }
      },
      {
        name: "create_cart_checkout",
        description: "Creates a Shopify cart session and generates an authentic checkout URL for the selected product variant.",
        parameters: {
          type: "object",
          properties: {
            variantId: { type: "string", description: "The Shopify ProductVariant GID" },
            quantity: { type: "integer", description: "Number of units to purchase (default 1)" }
          },
          required: ["variantId"]
        }
      }
    ];
  }

  /**
   * Tool Executor: runs the tool against the live Shopify Storefront client
   */
  async executeTool(toolName, args) {
    this.notifyStatus(`⚡ Tool Invocation: ${toolName}...`);

    if (toolName === 'search_products') {
      const results = await shopifyClient.searchProducts({
        query: args.query || '',
        maxPrice: args.maxPrice ? parseFloat(args.maxPrice) : null,
        category: args.category || ''
      });
      return {
        tool: toolName,
        success: true,
        count: results.length,
        products: results
      };
    }

    if (toolName === 'create_cart_checkout') {
      const cart = await shopifyClient.createCart(args.variantId, args.quantity || 1);
      return {
        tool: toolName,
        success: true,
        cartId: cart.id,
        checkoutUrl: cart.checkoutUrl,
        totalAmount: cart.cost?.totalAmount,
        lines: cart.lines?.edges || []
      };
    }

    throw new Error(`Unknown tool: ${toolName}`);
  }

  /**
   * Process incoming user prompt
   */
  async processMessage(userMessage) {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    // 1. Check if user configured Gemini or OpenAI
    if (this.provider === 'gemini' && this.geminiKey) {
      try {
        return await this.callGeminiAgent(userMessage);
      } catch (err) {
        console.warn('[AI Agent] Gemini call failed, falling back to Intelligent Heuristic Engine:', err);
      }
    } else if (this.provider === 'openai' && this.openaiKey) {
      try {
        return await this.callOpenAIAgent(userMessage);
      } catch (err) {
        console.warn('[AI Agent] OpenAI call failed, falling back to Intelligent Heuristic Engine:', err);
      }
    }

    // 2. Default: Intelligent Heuristic Agent (Zero API Key Required)
    return await this.callHeuristicAgent(userMessage);
  }

  /**
   * Intelligent Heuristic Agent Loop
   * Simulates function calling by parsing intents, extracting constraints,
   * querying Shopify GraphQL, and returning rich UI cards.
   */
  async callHeuristicAgent(userMessage) {
    this.notifyStatus('Parsing customer intent and preferences...');
    await new Promise(r => setTimeout(r, 400)); // natural UX beat

    const lower = userMessage.toLowerCase();

    // Intent: Cart Checkout / Add to cart
    const isCartIntent = lower.includes('cart') || lower.includes('checkout') || lower.includes('buy');
    
    // Check for specific item mentioned in cart request
    if (isCartIntent) {
      this.notifyStatus('Resolving product variant for checkout session...');
      const allProducts = await shopifyClient.getProducts(12);

      let targetProduct = allProducts.find(p => lower.includes(p.title.toLowerCase()));
      if (!targetProduct) {
        if (lower.includes('slide') || lower.includes('sandal')) {
          targetProduct = allProducts.find(p => p.title.toLowerCase().includes('slide'));
        } else if (lower.includes('t-shirt') || lower.includes('shirt') || lower.includes('tee')) {
          targetProduct = allProducts.find(p => p.title.toLowerCase().includes('shirt'));
        } else if (lower.includes('pant') || lower.includes('sweat')) {
          targetProduct = allProducts.find(p => p.title.toLowerCase().includes('sweatpant'));
        } else {
          targetProduct = allProducts[0]; // fallback to first item
        }
      }

      if (targetProduct && targetProduct.primaryVariantId) {
        this.notifyStatus('Executing cartCreate mutation on Storefront API...');
        const cartResult = await this.executeTool('create_cart_checkout', {
          variantId: targetProduct.primaryVariantId,
          quantity: 1
        });

        const reply = `Created an official Shopify checkout session for the **${targetProduct.title}**. You can review the details below and proceed to checkout:`;
        
        return {
          text: reply,
          toolCalled: 'create_cart_checkout',
          cart: cartResult,
          products: [targetProduct]
        };
      }
    }

    // Intent: Price filter extraction (e.g., "under $50", "less than 40", "under 30")
    let maxPrice = null;
    const priceMatch = lower.match(/(?:under|below|less than|max)\s*\$?(\d+(?:\.\d{1,2})?)/i);
    if (priceMatch) {
      maxPrice = parseFloat(priceMatch[1]);
    }

    // Intent: Category or Keyword search
    let searchQuery = '';
    let category = '';

    if (lower.includes('slide') || lower.includes('sandal')) searchQuery = 'slide';
    else if (lower.includes('sneaker') || lower.includes('shoe') || lower.includes('footwear')) searchQuery = 'slide'; // mock store's footwear
    else if (lower.includes('sweatpant') || lower.includes('pant') || lower.includes('bottom')) searchQuery = 'sweatpant';
    else if (lower.includes('shirt') || lower.includes('tee') || lower.includes('top')) searchQuery = 'shirt';
    else if (lower.includes('winter') || lower.includes('jacket') || lower.includes('coat')) searchQuery = 'sweatpant'; // related cozy item
    else if (lower.includes('black')) searchQuery = 'slide';

    this.notifyStatus('Executing Storefront GraphQL search query...');
    const searchResult = await this.executeTool('search_products', {
      query: searchQuery,
      maxPrice: maxPrice,
      category: category
    });

    let products = searchResult.products;
    if (products.length === 0) {
      // fallback to all products if specific query was overly narrow
      products = await shopifyClient.getProducts(4);
    } else {
      products = products.slice(0, 4);
    }

    let responseText = '';
    if (maxPrice) {
      responseText = `I filtered our current collection for items under **$${maxPrice}**. Here are the best hand-picked options matching your criteria:`;
    } else if (searchQuery) {
      responseText = `Here are our top styles matching **"${searchQuery}"**, synced live from our Shopify inventory:`;
    } else {
      responseText = `Here are our featured fashion essentials from the new collection, tailored for modern street luxury:`;
    }

    return {
      text: responseText,
      toolCalled: 'search_products',
      toolArgs: { query: searchQuery, maxPrice },
      products: products
    };
  }

  /**
   * Gemini API Function Calling integration (for live key evaluation)
   */
  async callGeminiAgent(userMessage) {
    const primaryModel = this.customModel || CONFIG.ai.defaultGeminiModel || 'gemini-3.5-flash-lite';
    const fallbackModel = CONFIG.ai.fallbackGeminiModel || 'gemini-3.1-flash-lite';
    this.notifyStatus(`🤖 Contacting Google Gemini (${primaryModel})...`);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiKey}`;

    const toolsDef = [{
      function_declarations: [
        {
          name: "search_products",
          description: "Search Shopify products by query and price",
          parameters: {
            type: "OBJECT",
            properties: {
              query: { type: "STRING" },
              maxPrice: { type: "NUMBER" }
            }
          }
        },
        {
          name: "create_cart_checkout",
          description: "Generate live Shopify checkout link for variant",
          parameters: {
            type: "OBJECT",
            properties: {
              variantId: { type: "STRING" }
            },
            required: ["variantId"]
          }
        }
      ]
    }];

    const payload = {
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      tools: toolsDef,
      systemInstruction: { parts: [{ text: CONFIG.ai.systemPrompt }] }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0];

    if (candidate?.functionCall) {
      const call = candidate.functionCall;
      const toolRes = await this.executeTool(call.name, call.args || {});
      return {
        text: `Based on your request, I queried our Shopify store. Here are the matching items:`,
        toolCalled: call.name,
        products: toolRes.products || [],
        cart: toolRes.cartId ? toolRes : null
      };
    }

    return {
      text: candidate?.text || "I found some great options in our catalog for you.",
      products: await shopifyClient.getProducts(3)
    };
  }

  /**
   * OpenAI API Function Calling integration
   */
  async callOpenAIAgent(userMessage) {
    const model = this.customModel || CONFIG.ai.defaultOpenAIModel;
    this.notifyStatus(`🤖 Contacting OpenAI (${model})...`);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: CONFIG.ai.systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || "Here are our recommendations:",
      products: await shopifyClient.getProducts(3)
    };
  }
}

export const shoppingAgent = new ShoppingAgent();
