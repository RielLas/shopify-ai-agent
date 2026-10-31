/**
 * Shopify Storefront GraphQL Client
 * Supports standard Shopify Storefront API 2024-01 & mock.shop endpoints
 */

import { CONFIG } from './config.js';

class ShopifyClient {
  constructor(config = CONFIG.store) {
    this.endpoint = config.endpoint;
    this.token = config.storefrontAccessToken;
    this.inspectorListeners = [];
  }

  /**
   * Subscribe to real-time GraphQL requests/responses for Architecture Inspector
   */
  onInspectorEvent(listener) {
    this.inspectorListeners.push(listener);
  }

  emitInspectorEvent(event) {
    this.inspectorListeners.forEach(fn => fn(event));
  }

  /**
   * Core GraphQL fetcher with timing & inspector hooks
   */
  async executeGraphQL(query, variables = {}, operationName = 'StorefrontQuery') {
    const startTime = performance.now();
    const requestId = 'req_' + Math.random().toString(36).substring(2, 9);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.token) {
      headers['X-Shopify-Storefront-Access-Token'] = this.token;
    }

    const payload = {
      query: query.trim(),
      variables: variables
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const json = await response.json();

      this.emitInspectorEvent({
        id: requestId,
        timestamp: new Date().toLocaleTimeString(),
        operationName,
        endpoint: this.endpoint,
        query: payload.query,
        variables: payload.variables,
        response: json,
        status: response.status,
        latencyMs,
        isError: Boolean(json.errors && json.errors.length)
      });

      if (json.errors && json.errors.length) {
        console.warn('[ShopifyClient] GraphQL errors:', json.errors);
      }

      return json.data;
    } catch (err) {
      const latencyMs = Math.round(performance.now() - startTime);
      this.emitInspectorEvent({
        id: requestId,
        timestamp: new Date().toLocaleTimeString(),
        operationName,
        endpoint: this.endpoint,
        query: payload.query,
        variables: payload.variables,
        response: { error: err.message },
        status: 0,
        latencyMs,
        isError: true
      });
      throw err;
    }
  }

  /**
   * Fetch storefront products
   */
  async getProducts(limit = 12) {
    const query = `
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
    `;

    const data = await this.executeGraphQL(query, { first: limit }, 'GetProducts');
    if (!data?.products?.edges) return [];

    return data.products.edges.map(edge => {
      const n = edge.node;
      const variants = n.variants?.edges?.map(v => v.node) || [];
      const primaryVariant = variants[0] || {};
      const priceAmount = parseFloat(primaryVariant.price?.amount || '0');
      const currency = primaryVariant.price?.currencyCode || 'USD';

      return {
        id: n.id,
        title: n.title,
        description: n.description || 'Exclusive designer collection piece with premium materials.',
        imageUrl: n.featuredImage?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
        price: priceAmount,
        currency,
        variants,
        primaryVariantId: primaryVariant.id
      };
    });
  }

  /**
   * Search / filter products by term, category, and budget
   */
  async searchProducts({ query = '', maxPrice = null, category = '' }) {
    const all = await this.getProducts(20);
    const qLower = query.toLowerCase();
    const catLower = category.toLowerCase();

    return all.filter(p => {
      const matchesText = !query || 
        p.title.toLowerCase().includes(qLower) || 
        p.description.toLowerCase().includes(qLower);

      const matchesCategory = !category || 
        p.title.toLowerCase().includes(catLower) || 
        p.description.toLowerCase().includes(catLower);

      const matchesBudget = !maxPrice || p.price <= maxPrice;

      return matchesText && matchesCategory && matchesBudget;
    });
  }

  /**
   * Execute Shopify cartCreate mutation
   * Generates a live cart session and direct Shopify checkoutUrl
   */
  async createCart(variantId, quantity = 1) {
    const mutation = `
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
                      product {
                        title
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
    `;

    const variables = {
      input: {
        lines: [
          {
            merchandiseId: variantId,
            quantity: quantity
          }
        ]
      }
    };

    const data = await this.executeGraphQL(mutation, variables, 'CartCreateMutation');
    const result = data?.cartCreate;

    if (result?.userErrors && result.userErrors.length > 0) {
      throw new Error(result.userErrors.map(e => e.message).join(', '));
    }

    return result?.cart;
  }
}

export const shopifyClient = new ShopifyClient();
