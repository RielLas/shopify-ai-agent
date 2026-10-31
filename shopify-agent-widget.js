/**
 * AURA Concierge — Live Shopify Theme Embed Widget
 * Self-contained, zero-dependency autonomous shopping assistant
 * Runs natively on any Shopify theme via /products.json & /cart/add.js
 */
(function() {
  if (window.__AURA_CONCIERGE_LOADED__) return;
  window.__AURA_CONCIERGE_LOADED__ = true;

  // 1. Inject Styles
  const style = document.createElement('style');
  style.id = 'aura-concierge-styles';
  style.textContent = `
    #aura-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      border-radius: 9999px;
      padding: 14px 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4), 0 8px 10px -6px rgba(79, 70, 229, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #aura-fab:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.5);
    }
    #aura-drawer {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 48px);
      height: 560px;
      max-height: calc(100vh - 120px);
      z-index: 999999;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.96);
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #aura-drawer.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .aura-header {
      padding: 16px 20px;
      background: rgba(30, 41, 59, 0.7);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .aura-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .aura-badge {
      font-size: 10px;
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      padding: 2px 8px;
      border-radius: 9999px;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .aura-close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
      line-height: 1;
      border-radius: 8px;
    }
    .aura-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .aura-msg {
      max-width: 85%;
      padding: 10px 14px;
      font-size: 13px;
      line-height: 1.45;
      border-radius: 16px;
    }
    .aura-msg-bot {
      align-self: flex-start;
      background: rgba(30, 41, 59, 0.8);
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-bottom-left-radius: 4px;
    }
    .aura-msg-user {
      align-self: flex-end;
      background: #4f46e5;
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }
    .aura-product-card {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 12px;
      padding: 10px;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .aura-product-card .title {
      font-weight: 600;
      font-size: 12px;
      color: #f8fafc;
    }
    .aura-product-card .price {
      font-size: 12px;
      color: #34d399;
      font-weight: 700;
    }
    .aura-product-card button {
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .aura-product-card button:hover {
      background: #4338ca;
    }
    .aura-starter-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 6px 12px;
      font-size: 11px;
      border-radius: 9999px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
    }
    .aura-starter-btn:hover {
      background: rgba(79, 70, 229, 0.2);
      border-color: #6366f1;
      color: #ffffff;
    }
    .aura-input-box {
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.95);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      gap: 8px;
    }
    .aura-input-box input {
      flex: 1;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 10px 14px;
      color: #f8fafc;
      font-size: 13px;
      outline: none;
    }
    .aura-input-box input:focus {
      border-color: #6366f1;
    }
    .aura-send-btn {
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 0 16px;
      cursor: pointer;
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);

  // 2. Fetch Catalog
  let catalog = [];
  fetch('/products.json')
    .then(r => r.json())
    .then(data => {
      catalog = data.products || [];
      console.log('[AURA AI] Loaded products:', catalog.length);
    })
    .catch(err => console.warn('[AURA AI] Catalog fetch error:', err));

  // 3. Render Widget DOM
  const fab = document.createElement('button');
  fab.id = 'aura-fab';
  fab.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a9.96 9.96 0 0 1-5.008-1.341L2 22l1.341-4.992A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2z"/></svg>
    <span>Ask AI Stylist</span>
  `;

  const drawer = document.createElement('div');
  drawer.id = 'aura-drawer';
  drawer.innerHTML = `
    <div class="aura-header">
      <div>
        <h3>⚡ Aura Stylist <span class="aura-badge">Shopify Agent</span></h3>
      </div>
      <button class="aura-close-btn" id="aura-close-btn">✕</button>
    </div>
    <div class="aura-messages" id="aura-msg-container">
      <div class="aura-msg aura-msg-bot">
        Hey! I'm your autonomous AI shopping assistant on <b>${window.Shopify?.shop || 'this store'}</b>. Ask me for recommendations, budget picks, or instant checkout.
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;" id="aura-starters">
        <button class="aura-starter-btn" data-q="Show me items under Rs. 2000">💰 Pieces under Rs. 2,000</button>
        <button class="aura-starter-btn" data-q="Recommend sneakers">👟 Recommend footwear & sneakers</button>
        <button class="aura-starter-btn" data-q="Add Classic Hoodie to cart">🛒 Add Hoodie to my cart</button>
      </div>
    </div>
    <div class="aura-input-box">
      <input type="text" id="aura-user-input" placeholder="Ask about style, budget, or cart..." />
      <button class="aura-send-btn" id="aura-send-btn">→</button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(drawer);

  // 4. Widget Logic
  fab.onclick = () => drawer.classList.toggle('open');
  document.getElementById('aura-close-btn').onclick = () => drawer.classList.remove('open');

  const msgContainer = document.getElementById('aura-msg-container');
  const input = document.getElementById('aura-user-input');
  const sendBtn = document.getElementById('aura-send-btn');

  function appendMsg(text, isUser = false) {
    const div = document.createElement('div');
    div.className = `aura-msg ${isUser ? 'aura-msg-user' : 'aura-msg-bot'}`;
    div.innerHTML = text;
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  window.auraAddToCart = async function(variantId, title) {
    appendMsg(`Adding <b>${title}</b> to your Shopify cart...`);
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
      });
      const data = await res.json();
      appendMsg(`✅ <b>${title}</b> added to cart! <br/><a href="/checkout" style="display:inline-block; margin-top:8px; background:#10b981; color:#fff; text-decoration:none; padding:6px 14px; border-radius:8px; font-weight:700;">Proceed to Checkout →</a>`);
    } catch (e) {
      appendMsg(`Error adding to cart: ${e.message}`);
    }
  };

  async function handleUserQuery(q) {
    appendMsg(q, true);
    input.value = '';
    const starters = document.getElementById('aura-starters');
    if (starters) starters.style.display = 'none';

    const lower = q.toLowerCase();

    // Check for add to cart
    if (lower.includes('add') || lower.includes('cart') || lower.includes('buy')) {
      const matched = catalog.find(p => lower.includes(p.title.toLowerCase()) || lower.includes(p.handle.replace(/-/g, ' ')));
      if (matched && matched.variants && matched.variants[0]) {
        const v = matched.variants[0];
        window.auraAddToCart(v.id, matched.title);
        return;
      }
    }

    // Check budget
    const budgetMatch = lower.match(/(under|below|less than)\s*([₹$]?\s*\d+)/i) || lower.match(/(\d+)\s*(rs|inr|usd)/i);
    let budget = null;
    if (budgetMatch) {
      budget = parseInt(budgetMatch[0].replace(/[^\d]/g, ''), 10);
    }

    // Filter products
    let results = catalog;
    if (budget) {
      results = results.filter(p => {
        const pr = parseFloat(p.variants[0]?.price || '0');
        return pr <= budget;
      });
    }

    if (lower.includes('sneaker') || lower.includes('shoe')) {
      results = results.filter(p => p.title.toLowerCase().includes('sneaker') || p.title.toLowerCase().includes('runner'));
    } else if (lower.includes('hoodie')) {
      results = results.filter(p => p.title.toLowerCase().includes('hoodie'));
    } else if (lower.includes('tee') || lower.includes('shirt')) {
      results = results.filter(p => p.title.toLowerCase().includes('tee') || p.title.toLowerCase().includes('shirt'));
    } else if (lower.includes('pant') || lower.includes('cargo')) {
      results = results.filter(p => p.title.toLowerCase().includes('pant') || p.title.toLowerCase().includes('cargo'));
    }

    if (results.length === 0) {
      results = catalog.slice(0, 3);
      appendMsg(`I didn't find an exact match, but here are our top trending pieces right now:`);
    } else {
      appendMsg(`Here are the matching pieces from our live catalog:`);
    }

    results.forEach(p => {
      const v = p.variants[0];
      const card = document.createElement('div');
      card.className = 'aura-product-card';
      card.innerHTML = `
        <div class="title">${p.title}</div>
        <div class="price">Rs. ${parseFloat(v.price).toLocaleString()}</div>
        <button onclick="window.auraAddToCart(${v.id}, '${p.title.replace(/'/g, "\\'")}')">⚡ Quick Add to Cart</button>
      `;
      msgContainer.appendChild(card);
    });
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  sendBtn.onclick = () => {
    const val = input.value.trim();
    if (val) handleUserQuery(val);
  };
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      const val = input.value.trim();
      if (val) handleUserQuery(val);
    }
  };

  document.querySelectorAll('.aura-starter-btn').forEach(btn => {
    btn.onclick = () => handleUserQuery(btn.getAttribute('data-q'));
  });

  console.log('[AURA Concierge] Live AI Agent initialized on store.');
})();
