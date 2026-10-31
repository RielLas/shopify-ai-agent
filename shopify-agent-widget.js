/**
 * AURA Concierge — Theme-Matched Shopify Embed Widget
 * Harmonized with the store's clean monochrome palette (White / Black / Inter)
 * Runs natively on any Shopify theme via /products.json & /cart/add.js
 */
(function() {
  if (window.__AURA_CONCIERGE_LOADED__) return;
  window.__AURA_CONCIERGE_LOADED__ = true;

  // 1. Inject Theme-Matched Styles
  const style = document.createElement('style');
  style.id = 'aura-concierge-styles';
  style.textContent = `
    #aura-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #000000;
      color: #ffffff;
      border: 1px solid #000000;
      border-radius: 9999px;
      padding: 12px 20px;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: -0.01em;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #aura-fab:hover {
      background: #262626;
      border-color: #262626;
      transform: translateY(-1px);
      box-shadow: 0 14px 28px -5px rgba(0, 0, 0, 0.28);
    }
    #aura-fab .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 9999px;
      background: #10b981;
    }
    #aura-drawer {
      position: fixed;
      bottom: 84px;
      right: 24px;
      width: 375px;
      max-width: calc(100vw - 48px);
      height: 550px;
      max-height: calc(100vh - 110px);
      z-index: 999999;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 18px;
      box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.18), 0 0 1px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      opacity: 0;
      transform: translateY(12px) scale(0.98);
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #aura-drawer.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .aura-header {
      padding: 16px 20px;
      background: #ffffff;
      border-bottom: 1px solid #f0f0f2;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .aura-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .aura-header-title {
      font-size: 13px;
      font-weight: 600;
      color: #000000;
      letter-spacing: -0.01em;
      margin: 0;
    }
    .aura-header-badge {
      font-size: 10px;
      color: #52525b;
      background: #f4f4f5;
      padding: 2px 8px;
      border-radius: 9999px;
      border: 1px solid #e4e4e7;
      font-weight: 500;
    }
    .aura-close-btn {
      background: transparent;
      border: none;
      color: #71717a;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: color 0.15s;
    }
    .aura-close-btn:hover {
      color: #000000;
    }
    .aura-messages {
      flex: 1;
      padding: 18px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: #fafafa;
    }
    .aura-msg {
      max-width: 86%;
      padding: 11px 15px;
      font-size: 13px;
      line-height: 1.5;
      border-radius: 14px;
      letter-spacing: -0.005em;
    }
    .aura-msg-bot {
      align-self: flex-start;
      background: #ffffff;
      color: #18181b;
      border: 1px solid #e4e4e7;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }
    .aura-msg-user {
      align-self: flex-end;
      background: #000000;
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }
    .aura-product-card {
      background: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 14px;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }
    .aura-product-card .title {
      font-weight: 600;
      font-size: 13px;
      color: #000000;
      letter-spacing: -0.01em;
    }
    .aura-product-card .price {
      font-size: 12px;
      color: #52525b;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
    .aura-product-card .action-btn {
      background: #000000;
      color: #ffffff;
      border: 1px solid #000000;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
    }
    .aura-product-card .action-btn:hover {
      background: #262626;
      border-color: #262626;
    }
    .aura-starters {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }
    .aura-starter-btn {
      background: #ffffff;
      border: 1px solid #e4e4e7;
      color: #3f3f46;
      padding: 9px 13px;
      font-size: 12px;
      border-radius: 10px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
      font-weight: 400;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }
    .aura-starter-btn:hover {
      background: #f4f4f5;
      color: #000000;
      border-color: #d4d4d8;
    }
    .aura-input-box {
      padding: 14px 16px;
      background: #ffffff;
      border-top: 1px solid #f0f0f2;
      display: flex;
      gap: 8px;
    }
    .aura-input-box input {
      flex: 1;
      background: #ffffff;
      border: 1px solid #d4d4d8;
      border-radius: 10px;
      padding: 10px 14px;
      color: #09090b;
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s;
    }
    .aura-input-box input::placeholder {
      color: #a1a1aa;
    }
    .aura-input-box input:focus {
      border-color: #000000;
    }
    .aura-send-btn {
      background: #000000;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 0 14px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: background 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .aura-send-btn:hover {
      background: #262626;
    }
    .aura-checkout-link {
      display: inline-block;
      margin-top: 10px;
      background: #000000;
      color: #ffffff;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      transition: opacity 0.15s;
    }
    .aura-checkout-link:hover {
      opacity: 0.9;
    }
  `;
  document.head.appendChild(style);

  // 2. Fetch Catalog
  let catalog = [];
  fetch('/products.json')
    .then(r => r.json())
    .then(data => { catalog = data.products || []; })
    .catch(() => {});

  // 3. Render Theme-Matched Widget
  const fab = document.createElement('button');
  fab.id = 'aura-fab';
  fab.innerHTML = `
    <span class="status-dot"></span>
    <span>Concierge</span>
  `;

  const drawer = document.createElement('div');
  drawer.id = 'aura-drawer';
  drawer.innerHTML = `
    <div class="aura-header">
      <div class="aura-header-info">
        <h3 class="aura-header-title">Concierge</h3>
        <span class="aura-header-badge">Assistant</span>
      </div>
      <button class="aura-close-btn" id="aura-close-btn" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="aura-messages" id="aura-msg-container">
      <div class="aura-msg aura-msg-bot">
        Welcome. I can help you explore our pieces, filter by price, and assemble your order directly.
      </div>
      <div class="aura-starters" id="aura-starters">
        <button class="aura-starter-btn" data-q="Show pieces under Rs. 2000">Pieces under Rs. 2,000</button>
        <button class="aura-starter-btn" data-q="Recommend footwear">Footwear and sneakers</button>
        <button class="aura-starter-btn" data-q="Add Classic Streetwear Hoodie to cart">Classic Streetwear Hoodie</button>
      </div>
    </div>
    <div class="aura-input-box">
      <input type="text" id="aura-user-input" placeholder="Ask about style, budget, or items..." />
      <button class="aura-send-btn" id="aura-send-btn" aria-label="Send">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(drawer);

  // 4. Interactivity
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
    appendMsg(`Adding <b>${title}</b> to cart...`);
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
      });
      const data = await res.json();
      appendMsg(`<b>${title}</b> added to your cart.<br/><a href="/checkout" class="aura-checkout-link">Proceed to Checkout →</a>`);
    } catch (e) {
      appendMsg(`Unable to add item: ${e.message}`);
    }
  };

  async function handleUserQuery(q) {
    appendMsg(q, true);
    input.value = '';
    const starters = document.getElementById('aura-starters');
    if (starters) starters.style.display = 'none';

    const lower = q.toLowerCase();

    // Check for direct add to cart
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

    let results = catalog;
    if (budget) {
      results = results.filter(p => {
        const pr = parseFloat(p.variants[0]?.price || '0');
        return pr <= budget;
      });
    }

    if (lower.includes('sneaker') || lower.includes('shoe') || lower.includes('footwear')) {
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
      appendMsg(`No direct match found. Here are current featured selections:`);
    } else {
      appendMsg(`Matching pieces from catalog:`);
    }

    results.forEach(p => {
      const v = p.variants[0];
      const card = document.createElement('div');
      card.className = 'aura-product-card';
      card.innerHTML = `
        <div class="title">${p.title}</div>
        <div class="price">Rs. ${parseFloat(v.price).toLocaleString()}</div>
        <button class="action-btn" onclick="window.auraAddToCart(${v.id}, '${p.title.replace(/'/g, "\\'")}')">Add to Cart</button>
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
})();
