/**
 * AURA Concierge — Autonomous AI Shopping Stylist
 * Powered by Google AI Studio Gemini 3.8 Flash / Gemini 4 Argon + Intelligent Editorial Fashion Persona
 * Seamless Shopify Storefront Integration (/products.json & /cart/add.js)
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
      background: #000000;
      color: #ffffff;
      border: 1px solid #000000;
      border-radius: 9999px;
      padding: 12px 20px;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: -0.01em;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.22);
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
      width: 385px;
      max-width: calc(100vw - 48px);
      height: 560px;
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
      padding: 14px 18px;
      background: #ffffff;
      border-bottom: 1px solid #f0f0f2;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .aura-header-info {
      display: flex;
      align-items: center;
      gap: 8px;
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
      padding: 2px 7px;
      border-radius: 9999px;
      border: 1px solid #e4e4e7;
      font-weight: 500;
    }
    .aura-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .aura-icon-btn {
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
    .aura-icon-btn:hover {
      color: #000000;
    }
    .aura-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #fafafa;
    }
    .aura-msg {
      max-width: 88%;
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
    .aura-msg-typing {
      align-self: flex-start;
      background: #ffffff;
      color: #71717a;
      border: 1px solid #e4e4e7;
      border-radius: 14px;
      padding: 8px 14px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .aura-dot {
      width: 4px;
      height: 4px;
      background: #71717a;
      border-radius: 50%;
      animation: aura-blink 1.4s infinite both;
    }
    .aura-dot:nth-child(2) { animation-delay: 0.2s; }
    .aura-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes aura-blink {
      0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1.1); }
    }
    .aura-product-card {
      background: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 12px 14px;
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
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
      padding: 8px 12px;
      font-size: 12px;
      border-radius: 8px;
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
      padding: 12px 16px;
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
    .aura-settings-modal {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.98);
      z-index: 20;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transform: translateY(100%);
      transition: transform 0.25s ease;
    }
    .aura-settings-modal.show {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  // 2. Fetch Catalog
  let catalog = [];
  fetch('/products.json')
    .then(r => r.json())
    .then(data => { catalog = data.products || []; })
    .catch(() => {});

  // 3. Render Widget
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
        <span class="aura-header-badge" id="aura-model-badge">Stylist AI</span>
      </div>
      <div class="aura-header-actions">
        <button class="aura-icon-btn" id="aura-settings-btn" title="AI Settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
        <button class="aura-icon-btn" id="aura-close-btn" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    <div class="aura-messages" id="aura-msg-container">
      <div class="aura-msg aura-msg-bot">
        Welcome. I'm your personal shopping assistant. I can recommend pieces based on cut, fit, and style, check our live inventory, and assemble orders directly.
      </div>
      <div class="aura-starters" id="aura-starters">
        <button class="aura-starter-btn" data-q="What hoodies do you have in stock and how should I style them?">What hoodies do you have and how do I style them?</button>
        <button class="aura-starter-btn" data-q="Recommend footwear for daily wear">Recommend daily footwear</button>
        <button class="aura-starter-btn" data-q="What can I get under Rs. 2,000?">Pieces under Rs. 2,000</button>
      </div>
    </div>
    <div class="aura-input-box">
      <input type="text" id="aura-user-input" placeholder="Ask about style, fit, budget, or checkout..." />
      <button class="aura-send-btn" id="aura-send-btn" aria-label="Send">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>

    <!-- In-Widget LLM Settings Modal -->
    <div class="aura-settings-modal" id="aura-settings-modal">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4 style="margin:0; font-size:14px; font-weight:600;">AI Studio Engine Settings</h4>
        <button class="aura-icon-btn" id="aura-close-settings">✕</button>
      </div>
      <p style="font-size:11px; color:#71717a; margin:0; line-height:1.4;">
        Connect Google AI Studio (Gemini 3.8 Flash / Gemini 4 Argon) for real-time generative reasoning. Leave blank for built-in stylist engine.
      </p>
      <div>
        <label style="font-size:11px; font-weight:600; color:#27272a; display:block; margin-bottom:4px;">Gemini Model</label>
        <select id="aura-gemini-model" style="width:100%; box-sizing:border-box; padding:8px 10px; border:1px solid #d4d4d8; border-radius:6px; font-size:12px; background:#fff; color:#000;">
          <option value="gemini-3.8-flash">Gemini 3.8 Flash (High-Speed Workhorse)</option>
          <option value="gemini-4-argon">Gemini 4 Argon (Flagship Reasoning)</option>
          <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (Low Latency)</option>
          <option value="gemini-flash-latest">gemini-flash-latest (Auto-update)</option>
        </select>
      </div>
      <div>
        <label style="font-size:11px; font-weight:600; color:#27272a; display:block; margin-bottom:4px;">Google AI Studio API Key</label>
        <input type="password" id="aura-gemini-key" placeholder="AIzaSy..." style="width:100%; box-sizing:border-box; padding:8px 10px; border:1px solid #d4d4d8; border-radius:6px; font-size:12px;" />
      </div>
      <button id="aura-save-settings" style="background:#000; color:#fff; border:none; padding:10px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">
        Save Engine Settings
      </button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(drawer);

  // 4. Interactivity & State
  fab.onclick = () => drawer.classList.toggle('open');
  document.getElementById('aura-close-btn').onclick = () => drawer.classList.remove('open');

  const settingsModal = document.getElementById('aura-settings-modal');
  document.getElementById('aura-settings-btn').onclick = () => {
    document.getElementById('aura-gemini-key').value = localStorage.getItem('aura_gemini_key') || '';
    document.getElementById('aura-gemini-model').value = localStorage.getItem('aura_gemini_model') || 'gemini-3.8-flash';
    settingsModal.classList.add('show');
  };
  document.getElementById('aura-close-settings').onclick = () => settingsModal.classList.remove('show');
  document.getElementById('aura-save-settings').onclick = () => {
    const key = document.getElementById('aura-gemini-key').value.trim();
    const model = document.getElementById('aura-gemini-model').value;
    localStorage.setItem('aura_gemini_model', model);
    if (key) {
      localStorage.setItem('aura_gemini_key', key);
      const modelLabel = model === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash';
      document.getElementById('aura-model-badge').textContent = modelLabel;
    } else {
      localStorage.removeItem('aura_gemini_key');
      document.getElementById('aura-model-badge').textContent = 'Stylist AI';
    }
    settingsModal.classList.remove('show');
    appendMsg('Engine preferences updated.');
  };

  if (localStorage.getItem('aura_gemini_key')) {
    const savedModel = localStorage.getItem('aura_gemini_model') || 'gemini-3.8-flash';
    document.getElementById('aura-model-badge').textContent = savedModel === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash';
  }

  const msgContainer = document.getElementById('aura-msg-container');
  const input = document.getElementById('aura-user-input');
  const sendBtn = document.getElementById('aura-send-btn');
  const chatHistory = [];

  function appendMsg(text, isUser = false) {
    const div = document.createElement('div');
    div.className = `aura-msg ${isUser ? 'aura-msg-user' : 'aura-msg-bot'}`;
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    div.innerHTML = formatted;
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.id = 'aura-typing-indicator';
    div.className = 'aura-msg-typing';
    div.innerHTML = `<span>Consulting catalog</span><div class="aura-dot"></div><div class="aura-dot"></div><div class="aura-dot"></div>`;
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('aura-typing-indicator')?.remove();
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
      appendMsg(`<b>${title}</b> is in your bag.<br/><a href="/checkout" class="aura-checkout-link">Proceed to Checkout →</a>`);
    } catch (e) {
      appendMsg(`Unable to add item: ${e.message}`);
    }
  };

  // 5. Intelligent AI Reasoning & LLM Runner
  async function generateStylistResponse(q) {
    const geminiKey = localStorage.getItem('aura_gemini_key');

    // If customer provided a Gemini API Key, execute live generative LLM
    if (geminiKey) {
      try {
        const catalogContext = catalog.map(p => ({
          title: p.title,
          price: p.variants?.[0]?.price,
          variantId: p.variants?.[0]?.id,
          handle: p.handle
        }));

        const systemPrompt = `You are the personal shopping concierge for this fashion boutique.
Catalog: ${JSON.stringify(catalogContext)}
Speak with natural elegance, warmth, and high-fashion expertise. Explain cuts, drapes, silhouettes, and styling pairings.
When mentioning a product from the catalog, write its exact title.
Keep answers concise (2-4 sentences max).`;

        const contents = [
          ...chatHistory.slice(-4),
          { role: 'user', parts: [{ text: q }] }
        ];

        const selectedModel = localStorage.getItem('aura_gemini_model') || 'gemini-3.8-flash';
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        });

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          chatHistory.push({ role: 'user', parts: [{ text: q }] });
          chatHistory.push({ role: 'model', parts: [{ text }] });
          
          // Match products mentioned in the LLM answer
          const matched = catalog.filter(p => text.toLowerCase().includes(p.title.toLowerCase()) || q.toLowerCase().includes(p.title.toLowerCase()));
          return { text, products: matched };
        }
      } catch (err) {
        console.warn('Gemini LLM error, falling back to local stylist engine:', err);
      }
    }

    // High-End Editorial Stylist Engine (Zero API Key Fallback)
    const lower = q.toLowerCase();

    // Sizing / Fit question
    if (lower.includes('size') || lower.includes('fit') || lower.includes('measure') || lower.includes('true to size')) {
      return {
        text: `Our pieces are tailored with a contemporary relaxed fit. If you prefer a tailored, sharp silhouette, take your standard size. For an elevated, streetwear drape, size one up. Would you like specific measurements for any piece?`,
        products: []
      };
    }

    // Hoodie / Outerwear question
    if (lower.includes('hoodie') || lower.includes('sweatshirt') || lower.includes('jacket') || lower.includes('layer')) {
      const hoodie = catalog.find(p => p.title.toLowerCase().includes('hoodie')) || catalog[0];
      return {
        text: `The **${hoodie.title}** is constructed from heavyweight loopback organic cotton with dropped shoulders and a clean boxy silhouette. It pairs effortlessly over our oversized tees with technical cargo pants for a balanced, minimalist drape.`,
        products: hoodie ? [hoodie] : []
      };
    }

    // Footwear / Sneakers
    if (lower.includes('sneaker') || lower.includes('shoe') || lower.includes('footwear') || lower.includes('runner')) {
      const sneaker = catalog.find(p => p.title.toLowerCase().includes('sneaker') || p.title.toLowerCase().includes('runner')) || catalog[1];
      return {
        text: `For footwear, our **${sneaker?.title || 'Runner Sneakers'}** feature a sleek architectural sole with low-profile monochrome leather panelling. They anchor both cropped trousers and relaxed denim cleanly.`,
        products: sneaker ? [sneaker] : []
      };
    }

    // Tees / Tops
    if (lower.includes('tee') || lower.includes('t-shirt') || lower.includes('shirt') || lower.includes('top')) {
      const tee = catalog.find(p => p.title.toLowerCase().includes('tee') || p.title.toLowerCase().includes('shirt')) || catalog[2];
      return {
        text: `Our **${tee?.title || 'Heavyweight Cotton Tee'}** has an architectural high-rib collar and substantial 280 GSM cotton drape that holds its shape through all-day wear. An essential layering foundation.`,
        products: tee ? [tee] : []
      };
    }

    // Pants / Bottoms
    if (lower.includes('pant') || lower.includes('cargo') || lower.includes('bottom') || lower.includes('trouser')) {
      const pants = catalog.find(p => p.title.toLowerCase().includes('pant') || p.title.toLowerCase().includes('cargo')) || catalog[3];
      return {
        text: `The **${pants?.title || 'Technical Cargo Pants'}** offer clean articulated seams and adjustable hems, allowing you to transition between a wide-leg drape and a tapered ankle cuff.`,
        products: pants ? [pants] : []
      };
    }

    // Budget filtering (e.g. "under 2000", "under $50", "cheap")
    const budgetMatch = lower.match(/(under|below|less than|max)\s*([₹$]?\s*\d+)/i) || lower.match(/(\d+)\s*(rs|inr|usd)/i);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[0].replace(/[^\d]/g, ''), 10);
      const filtered = catalog.filter(p => parseFloat(p.variants?.[0]?.price || '0') <= budget);
      if (filtered.length > 0) {
        return {
          text: `Curated selection fitting your budget under Rs. ${budget.toLocaleString()}:`,
          products: filtered
        };
      }
    }

    // Styling advice / pairing
    if (lower.includes('style') || lower.includes('pair') || lower.includes('wear with') || lower.includes('outfit')) {
      return {
        text: `For a cohesive contemporary look, we recommend balancing volume: pair the structured heavyweight hoodie with clean-line track pants and minimalist low-profile sneakers. Here are the core foundation pieces:`,
        products: catalog.slice(0, 3)
      };
    }

    // Default conversational response
    return {
      text: `Here are our current signature essentials. Each piece is designed for versatility, refined proportion, and easy pairing across your everyday wardrobe.`,
      products: catalog.slice(0, 3)
    };
  }

  async function handleUserQuery(q) {
    appendMsg(q, true);
    input.value = '';
    const starters = document.getElementById('aura-starters');
    if (starters) starters.style.display = 'none';

    // Direct cart addition intent
    const lower = q.toLowerCase();
    if ((lower.startsWith('add') || lower.includes('buy now')) && !lower.includes('what') && !lower.includes('how')) {
      const matched = catalog.find(p => lower.includes(p.title.toLowerCase()) || lower.includes(p.handle.replace(/-/g, ' ')));
      if (matched && matched.variants && matched.variants[0]) {
        window.auraAddToCart(matched.variants[0].id, matched.title);
        return;
      }
    }

    showTyping();
    // Simulate slight natural latency for realism
    await new Promise(r => setTimeout(r, 600));

    const result = await generateStylistResponse(q);
    hideTyping();

    appendMsg(result.text);

    if (result.products && result.products.length > 0) {
      result.products.forEach(p => {
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
