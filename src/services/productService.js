// src/services/productService.js
// FASE 2/3 — Supabase integration with local catalog fallback

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import {
  allProducts,
  getProductBySlug,
  getProductById,
  getProductsByBrand,
  getProductsByQuizResult,
  relatedProductsFor,
} from '../data/productCatalog.js'

let _cache = null
let _cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function _tryFetchRemote() {
  if (!isSupabaseConfigured) return null
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('brand', { ascending: true })
    if (error || !data?.length) return null
    return data
  } catch {
    return null
  }
}

export const productService = {
  /** Returns all products — tries Supabase first, falls back to local catalog */
  async getAll() {
    if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache
    const remote = await _tryFetchRemote()
    _cache = remote || allProducts
    _cacheTime = Date.now()
    return _cache
  },

  /** Instant local lookup by slug (always uses local catalog for speed) */
  getBySlug(slug) {
    return getProductBySlug(slug) || null
  },

  /** Instant local lookup by id */
  getById(id) {
    return getProductById(id) || null
  },

  /** All products for a brand */
  getByBrand(brand) {
    return getProductsByBrand(brand)
  },

  /**
   * Smart full-text search — matches name, subtitle, brand, line, type, category,
   * description, concerns, ingredientsTags, keyIngredient names, and safety claims.
   * Supports partial/fuzzy matching (contains).
   */
  search(query) {
    const q = (query || '').toLowerCase().trim()
    if (!q) return allProducts
    return allProducts.filter(p => {
      const haystack = [
        p.name,
        p.subtitle,
        p.brandLabel,
        p.brand === 'cerave' ? 'cerave' : 'la roche posay la roche-posay lrp',
        p.line,
        p.type,
        p.category,
        p.description,
        ...(p.concerns || []),
        ...(p.ingredientsTags || []),
        ...(p.keyIngredients || []).map(k => k.name),
        ...(p.safety || []),
        ...(p.productSafety || []),
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  },

  /** Related products for a given product (used in ProductoDetalle) */
  relatedFor(product, limit = 4) {
    return relatedProductsFor(product, limit)
  },

  /** Products matched to quiz result */
  byQuizResult(quizResult, time = 'morning') {
    return getProductsByQuizResult(quizResult, time)
  },

  /** Invalidate the remote cache (call after product updates) */
  invalidateCache() {
    _cache = null
    _cacheTime = 0
  },
}

export default productService
