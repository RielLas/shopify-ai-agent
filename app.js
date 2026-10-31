/**
 * Main Application Orchestrator
 * Connects UI, Shopify GraphQL Client, AI Agent, and Technical Architecture Inspector
 */

import { CONFIG } from './config.js';
import { shopifyClient } from './shopify-client.js';
import { shoppingAgent } from './ai-agent.js';

class App {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.cart = null;
    this.cartItemsCount = 0;
    this.inspectorEvents = [];
    this.isChatOpen = false;
    this.isInspectorOpen = false;
    this.activeFilter = 'all';

    this.init();
  }

  async init() {
    this.bindEvents();
    this.setupInspectorListener();
    this.renderStarterPrompts();
    await this.loadCatalog();
  }

  // ----------------------------------------------------
  // Catalog & Storefront Logic
  // ----------------------------------------------------
  async loadCatalog() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = `
      <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
        <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-sm font-medium">Fetching real-time collection from Shopify Storefront API...</p>
      </div>
    `;

    try {
      this.products = await shopifyClient.getProducts(12);
      this.applyFilter(this.activeFilter);
    } catch (err) {
      console.error('Failed to fetch Shopify catalog:', err);
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-red-400">
          <p class="font-medium">Failed to connect to Shopify GraphQL API.</p>
          <p class="text-xs text-slate-500 mt-1">${err.message}</p>
        </div>
      `;
    }
  }

  applyFilter(category) {
    this.activeFilter = category;
    
    // Update pill styles
    document.querySelectorAll('.filter-pill').forEach(btn => {
      const active = btn.dataset.category === category;
      btn.className = `filter-pill px-4 py-2 rounded-full text-xs font-semibold transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
      }`;
    });

    if (category === 'all') {
      this.filteredProducts = [...this.products];
    } else if (category === 'footwear') {
      this.filteredProducts = this.products.filter(p => 
        p.title.toLowerCase().includes('slide') || p.title.toLowerCase().includes('shoe')
      );
    } else if (category === 'tops') {
      this.filteredProducts = this.products.filter(p => 
        p.title.toLowerCase().includes('shirt') || p.title.toLowerCase().includes('tee')
      );
    } else if (category === 'bottoms') {
      this.filteredProducts = this.products.filter(p => 
        p.title.toLowerCase().includes('sweat') || p.title.toLowerCase().includes('pant')
      );
    }

    this.renderProductsGrid();
  }

  renderProductsGrid() {
    const grid = document.getElementById('products-grid');
    if (!this.filteredProducts.length) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400">
          <p>No products found in this category.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.filteredProducts.map(p => `
      <div class="glass-card rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 group flex flex-col">
        <div class="relative overflow-hidden aspect-square bg-slate-900/50">
          <img 
            src="${p.imageUrl}" 
            alt="${p.title}" 
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/20">
            In Stock
          </span>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>AURA Essentials</span>
              <span class="font-mono text-emerald-400 font-semibold">$${p.price.toFixed(2)} ${p.currency}</span>
            </div>
            <h3 class="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">${p.title}</h3>
            <p class="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">${p.description}</p>
          </div>

          <div class="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
            <button 
              onclick="window.app.quickAddToCart('${p.primaryVariantId}', '${p.title.replace(/'/g, "\\'")}')"
              class="flex-1 bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              <span>Instant Checkout</span>
            </button>
            <button 
              onclick="window.app.askAIAboutProduct('${p.title.replace(/'/g, "\\'")}')"
              title="Ask AI Stylist about this item"
              class="bg-slate-800 hover:bg-slate-700 text-indigo-400 p-2.5 rounded-xl border border-slate-700/60 transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ----------------------------------------------------
  // Checkout & Shopify Cart Mutation
  // ----------------------------------------------------
  async quickAddToCart(variantId, productTitle) {
    this.showToast(`Creating official Shopify cart for "${productTitle}"...`);
    try {
      const cart = await shopifyClient.createCart(variantId, 1);
      this.cart = cart;
      this.cartItemsCount += 1;
      this.updateCartBadge();

      // Open checkout modal or banner
      this.showCheckoutModal(cart, productTitle);
    } catch (err) {
      console.error('Failed to create cart:', err);
      this.showToast(`Cart Error: ${err.message}`, true);
    }
  }

  showCheckoutModal(cart, productTitle) {
    const modal = document.getElementById('checkout-modal');
    const modalBody = document.getElementById('checkout-modal-body');

    modalBody.innerHTML = `
      <div class="text-center py-2">
        <div class="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h3 class="text-lg font-bold text-slate-100">Official Shopify Cart Created!</h3>
        <p class="text-xs text-slate-400 mt-1">Live checkout session successfully initialized via Storefront GraphQL API.</p>
        
        <div class="bg-slate-900/80 rounded-xl p-3 my-4 border border-slate-800 text-left">
          <div class="flex justify-between items-center text-xs text-slate-300">
            <span class="font-medium">${productTitle}</span>
            <span class="font-mono text-emerald-400 font-bold">$${cart.cost?.totalAmount?.amount || '0.00'} ${cart.cost?.totalAmount?.currencyCode || 'USD'}</span>
          </div>
          <div class="text-[10px] font-mono text-slate-500 mt-1 break-all">
            Session GID: ${cart.id.substring(0, 40)}...
          </div>
        </div>

        <div class="flex gap-2">
          <a 
            href="${cart.checkoutUrl}" 
            target="_blank" 
            class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30"
          >
            <span>Proceed to Shopify Checkout</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
          <button 
            onclick="document.getElementById('checkout-modal').classList.add('hidden')"
            class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium py-2.5 px-3 rounded-xl transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  updateCartBadge() {
    const badge = document.getElementById('cart-counter-badge');
    if (badge) {
      badge.textContent = this.cartItemsCount;
      badge.classList.remove('hidden');
    }
  }

  // ----------------------------------------------------
  // AI Assistant Chat Logic
  // ----------------------------------------------------
  toggleChat(forceOpen = null) {
    const drawer = document.getElementById('ai-chat-drawer');
    const fab = document.getElementById('ai-chat-fab');
    this.isChatOpen = forceOpen !== null ? forceOpen : !this.isChatOpen;

    if (this.isChatOpen) {
      drawer.classList.remove('translate-y-full', 'opacity-0', 'pointer-events-none');
      drawer.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
      fab.classList.add('scale-0');
      document.getElementById('ai-input')?.focus();
    } else {
      drawer.classList.add('translate-y-full', 'opacity-0', 'pointer-events-none');
      drawer.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
      fab.classList.remove('scale-0');
    }
  }

  renderStarterPrompts() {
    const container = document.getElementById('chat-starter-prompts');
    if (!container) return;

    container.innerHTML = CONFIG.starterPrompts.map(sp => `
      <button 
        onclick="window.app.sendChatMessage('${sp.prompt.replace(/'/g, "\\'")}')"
        class="text-left bg-slate-800/80 hover:bg-indigo-950/60 hover:border-indigo-500/50 border border-slate-700/60 rounded-xl p-2.5 text-xs text-slate-300 transition-all group"
      >
        <span class="block font-medium group-hover:text-indigo-300">${sp.label}</span>
      </button>
    `).join('');
  }

  askAIAboutProduct(productTitle) {
    this.toggleChat(true);
    this.sendChatMessage(`Tell me about the ${productTitle} and recommend styling pairings.`);
  }

  async sendChatMessage(customText = null) {
    const input = document.getElementById('ai-input');
    const text = customText || input.value.trim();
    if (!text) return;

    if (!customText) input.value = '';

    // Hide starter prompts once conversation begins
    const starterBox = document.getElementById('starter-prompts-wrapper');
    if (starterBox) starterBox.classList.add('hidden');

    // Append user message
    this.appendMessage('user', text);

    // Show typing / tool status
    const statusBox = document.getElementById('ai-status-indicator');
    const statusText = document.getElementById('ai-status-text');
    statusBox.classList.remove('hidden');

    shoppingAgent.setStatusListener((status) => {
      statusText.textContent = status;
    });

    try {
      const response = await shoppingAgent.processMessage(text);
      statusBox.classList.add('hidden');
      this.appendAssistantResponse(response);
    } catch (err) {
      console.error('Agent execution error:', err);
      statusBox.classList.add('hidden');
      this.appendMessage('assistant', `I encountered an issue querying the catalog: ${err.message}`);
    }
  }

  appendMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const isUser = role === 'user';

    const msgEl = document.createElement('div');
    msgEl.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`;

    msgEl.innerHTML = `
      <div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
        isUser 
          ? 'bg-indigo-600 text-white rounded-br-xs' 
          : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-xs'
      }">
        ${text}
      </div>
    `;

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  appendAssistantResponse(agentResponse) {
    const container = document.getElementById('chat-messages');
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-start mb-4 max-w-[92%]';

    let productsHtml = '';
    if (agentResponse.products && agentResponse.products.length > 0) {
      productsHtml = `
        <div class="mt-3 w-full grid grid-cols-2 gap-2">
          ${agentResponse.products.map(p => `
            <div class="glass-card rounded-xl p-2.5 border border-slate-700/60 flex flex-col justify-between">
              <img src="${p.imageUrl}" alt="${p.title}" class="w-full aspect-square object-cover rounded-lg mb-2 bg-slate-900" />
              <div>
                <h4 class="font-bold text-[11px] text-slate-100 line-clamp-1">${p.title}</h4>
                <div class="font-mono text-[10px] text-emerald-400 font-semibold mt-0.5">$${p.price.toFixed(2)} ${p.currency}</div>
              </div>
              <button 
                onclick="window.app.quickAddToCart('${p.primaryVariantId}', '${p.title.replace(/'/g, "\\'")}')"
                class="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <span>Add to Cart</span>
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }

    let cartHtml = '';
    if (agentResponse.cart) {
      cartHtml = `
        <div class="mt-3 w-full p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold">🛒 Live Shopify Cart Created</span>
            <span class="text-[10px] font-mono text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded">Storefront Session</span>
          </div>
          <a 
            href="${agentResponse.cart.checkoutUrl}" 
            target="_blank" 
            class="w-full block text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-md shadow-emerald-600/30"
          >
            Direct Shopify Checkout &rarr;
          </a>
        </div>
      `;
    }

    wrapper.innerHTML = `
      <div class="bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-2xl rounded-bl-xs px-4 py-3 text-xs leading-relaxed">
        ${agentResponse.text}
        ${productsHtml}
        ${cartHtml}
      </div>
    `;

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  // ----------------------------------------------------
  // Technical Architecture Inspector Logic
  // ----------------------------------------------------
  setupInspectorListener() {
    shopifyClient.onInspectorEvent((event) => {
      this.inspectorEvents.unshift(event);
      if (this.inspectorEvents.length > 25) this.inspectorEvents.pop();
      this.renderInspector();

      // Show live toast counter if inspector is closed
      const badge = document.getElementById('inspector-counter-badge');
      if (badge) {
        badge.textContent = this.inspectorEvents.length;
        badge.classList.remove('hidden');
      }
    });
  }

  toggleInspector(forceOpen = null) {
    const drawer = document.getElementById('architecture-inspector-drawer');
    this.isInspectorOpen = forceOpen !== null ? forceOpen : !this.isInspectorOpen;

    if (this.isInspectorOpen) {
      drawer.classList.remove('translate-x-full');
      this.renderInspector();
    } else {
      drawer.classList.add('translate-x-full');
    }
  }

  renderInspector() {
    const list = document.getElementById('inspector-events-list');
    if (!list) return;

    if (this.inspectorEvents.length === 0) {
      list.innerHTML = `
        <div class="p-8 text-center text-slate-500 text-xs font-mono">
          Waiting for Storefront API events...<br>
          Trigger any action in the store or AI chat to inspect live GraphQL payloads.
        </div>
      `;
      return;
    }

    list.innerHTML = this.inspectorEvents.map((evt, idx) => `
      <div class="border-b border-slate-800/80 p-3 hover:bg-slate-900/60 transition-colors font-mono text-[11px]">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              evt.isError ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }">
              ${evt.operationName}
            </span>
            <span class="text-slate-500 text-[10px]">${evt.timestamp}</span>
          </div>
          <span class="text-indigo-400 font-semibold text-[10px]">${evt.latencyMs}ms</span>
        </div>

        <div class="text-[10px] text-slate-400 break-all mb-2">
          Endpoint: <span class="text-slate-200">${evt.endpoint}</span>
        </div>

        <details class="cursor-pointer group">
          <summary class="text-[10px] text-indigo-400/90 font-medium hover:text-indigo-300 select-none">
            ▸ Inspect GraphQL Query & Variables
          </summary>
          <pre class="bg-slate-950 p-2.5 rounded-lg mt-1.5 text-[10px] text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">${this.escapeHtml(evt.query)}</pre>
          ${evt.variables && Object.keys(evt.variables).length ? `
            <div class="text-[9px] text-slate-500 mt-1 uppercase font-semibold">Variables:</div>
            <pre class="bg-slate-950 p-2 rounded-lg mt-0.5 text-[10px] text-amber-300 overflow-x-auto whitespace-pre border border-slate-800">${this.escapeHtml(JSON.stringify(evt.variables, null, 2))}</pre>
          ` : ''}
        </details>

        <details class="cursor-pointer group mt-1.5">
          <summary class="text-[10px] text-indigo-400/90 font-medium hover:text-indigo-300 select-none">
            ▸ Inspect Response Payload (${evt.status})
          </summary>
          <pre class="bg-slate-950 p-2.5 rounded-lg mt-1.5 text-[10px] text-slate-300 overflow-x-auto whitespace-pre max-h-40 border border-slate-800">${this.escapeHtml(JSON.stringify(evt.response, null, 2))}</pre>
        </details>
      </div>
    `).join('');
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl transition-all duration-300 flex items-center gap-2 ${
      isError 
        ? 'bg-red-950/90 text-red-200 border border-red-500/40' 
        : 'bg-slate-900/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md'
    }`;
    toast.innerHTML = `
      <span class="w-2 h-2 rounded-full ${isError ? 'bg-red-400' : 'bg-emerald-400 animate-ping'}"></span>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ----------------------------------------------------
  // Bind Event Listeners
  // ----------------------------------------------------
  bindEvents() {
    // Search input on top nav
    const searchInput = document.getElementById('nav-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        this.filteredProducts = this.products.filter(p => 
          p.title.toLowerCase().includes(val) || p.description.toLowerCase().includes(val)
        );
        this.renderProductsGrid();
      });
    }

    // AI Chat input enter key
    const chatInput = document.getElementById('ai-input');
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendChatMessage();
        }
      });
    }
  }
}

// Global instance
window.app = new App();
