/**
 * productCatalog.js — Catálogo unificado LRP + CeraVe.
 * Punto único de verdad para todas las pantallas que necesitan productos.
 */

import { lrpCatalog } from './lrpCatalog.js';
import { ceraveCatalog } from './ceraveCatalog.js';
import { useHistoryStore } from '../stores/useHistoryStore.js';

export const allProducts = [...lrpCatalog, ...ceraveCatalog];

/** Busca por slug en todo el catálogo */
export function getProductBySlug(slug) {
  return allProducts.find(p => p.slug === slug);
}

/** Busca por id en todo el catálogo */
export function getProductById(id) {
  return allProducts.find(p => p.id === id);
}

/**
 * Devuelve productos complementarios para "Complete Your Routine".
 * Si hay resultado de quiz en localStorage, los ordena por relevancia.
 * Si no, cae back a productos de la misma línea/concern.
 *
 * @param {object} product - Producto actual (de cualquier catálogo)
 * @param {number} [limit=4]
 */
export function relatedProductsFor(product, limit = 4) {
  if (!product) return [];

  const quizResult = useHistoryStore().getLatestQuizResult();

  const others = allProducts.filter(p => p.id !== product.id);

  if (quizResult) {
    const skinType = quizResult.skinType || '';
    const concerns = quizResult.concerns || [];
    const sensitivity = quizResult.sensitivity || '';

    // Mapeo de tipo de piel → concerns que coinciden en el catálogo
    const skinTypeToConcerns = {
      seca:   ['Dry Skin', 'Dry/Damaged', 'Dehydrated Skin'],
      grasa:  ['Oiliness', 'Acne Prone Skin', 'Acne Prone'],
      mixta:  ['Oiliness', 'Dry Skin', 'Sensitive Skin'],
      normal: ['Sensitive Skin', 'Fine Lines & Wrinkles'],
    };
    const skinConcerns = skinTypeToConcerns[skinType] || [];

    // Mapeo de concerns del quiz → concerns del catálogo
    const quizToProductConcerns = {
      acne:           ['Acne Prone Skin', 'Acne Prone', 'Oiliness'],
      manchas:        ['Dark Spots', 'Uneven Skin Tone', 'Dull Skin'],
      deshidratacion: ['Dehydrated Skin', 'Dry Skin'],
      barrera:        ['Dry Skin', 'Sensitive Skin', 'Eczema'],
      arrugas:        ['Fine Lines & Wrinkles'],
      poros:          ['Oiliness', 'Acne Prone Skin'],
      luminosidad:    ['Dull Skin', 'Uneven Skin Tone'],
      sensibilidad:   ['Sensitive Skin', 'Dry/Damaged'],
    };

    const relevantConcerns = new Set([
      ...skinConcerns,
      ...concerns.flatMap(c => quizToProductConcerns[c] || []),
      ...(sensitivity === 'reactive' || sensitivity === 'very_reactive'
        ? ['Sensitive Skin']
        : []),
    ]);

    // Puntuar cada producto por cuántos concerns relevantes tiene
    const scored = others.map(p => {
      const productConcerns = p.concerns || [];
      const score = productConcerns.filter(c => relevantConcerns.has(c)).length;
      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.product);
  }

  // Fallback: misma línea o concern compartido
  return others
    .filter(p =>
      p.line === product.line ||
      p.concerns?.some(c => product.concerns?.includes(c))
    )
    .slice(0, limit);
}

/**
 * Devuelve productos recomendados basándose en el resultado del quiz.
 * Usado en la pantalla de resultados del Quiz y en Routine.vue.
 *
 * @param {object} quizResult - Objeto del quiz guardado en localStorage
 * @param {string} [time='morning'] - 'morning' | 'night'
 * @returns {object[]} Hasta 6 productos ordenados por relevancia
 */
export function getProductsByQuizResult(quizResult, time = 'morning') {
  if (!quizResult) return [];

  const skinType   = quizResult.skinType || 'normal';
  const concerns   = quizResult.concerns || [];
  const sensitivity = quizResult.sensitivity || 'mild';

  // Categorías que van en mañana vs noche
  const morningCategories = ['Face Wash', 'Face Serum', 'Face Moisturizer', 'Face Sunscreen', 'Moisturizer SPF'];
  const nightCategories   = ['Face Wash', 'Face Serum', 'Face Moisturizer', 'Eye Care', 'Treatment', 'Acne Treatment'];

  const allowedCategories = time === 'morning' ? morningCategories : nightCategories;

  // Prefer SPF in morning, avoid in night
  const filtered = allProducts.filter(p => {
    if (!allowedCategories.includes(p.category) && !allowedCategories.includes(p.type)) return false;
    if (time === 'night' && (p.category === 'Face Sunscreen' || p.type === 'Sunscreen' || p.type === 'Moisturizer SPF')) return false;
    if (time === 'morning' && p.type === 'Balm') return false;
    return true;
  });

  // Score por relevancia
  const skinTypeToConcerns = {
    seca:   ['Dry Skin', 'Dehydrated Skin', 'Dry/Damaged'],
    grasa:  ['Oiliness', 'Acne Prone Skin', 'Acne Prone'],
    mixta:  ['Oiliness', 'Dry Skin', 'Sensitive Skin'],
    normal: ['Sensitive Skin', 'Fine Lines & Wrinkles'],
  };

  const quizToProductConcerns = {
    acne:           ['Acne Prone Skin', 'Acne Prone', 'Oiliness'],
    manchas:        ['Dark Spots', 'Uneven Skin Tone', 'Dull Skin'],
    deshidratacion: ['Dehydrated Skin', 'Dry Skin'],
    barrera:        ['Dry Skin', 'Sensitive Skin', 'Eczema'],
    arrugas:        ['Fine Lines & Wrinkles'],
    poros:          ['Oiliness', 'Acne Prone Skin'],
    luminosidad:    ['Dull Skin', 'Uneven Skin Tone'],
    sensibilidad:   ['Sensitive Skin', 'Dry/Damaged'],
  };

  const relevantConcerns = new Set([
    ...(skinTypeToConcerns[skinType] || []),
    ...concerns.flatMap(c => quizToProductConcerns[c] || []),
    ...(sensitivity === 'reactive' || sensitivity === 'very_reactive' ? ['Sensitive Skin'] : []),
  ]);

  // Si piel muy reactiva → excluir retinol y ácidos fuertes
  const excludeIfReactive = ['Retinol', 'Salicylic Acid', 'Benzoyl Peroxide'];
  const isReactive = sensitivity === 'reactive' || sensitivity === 'very_reactive';

  const scored = filtered
    .filter(p => {
      if (isReactive) {
        const tags = p.ingredientsTags || [];
        if (tags.some(t => excludeIfReactive.includes(t))) return false;
      }
      return true;
    })
    .map(p => {
      const productConcerns = p.concerns || [];
      const score = productConcerns.filter(c => relevantConcerns.has(c)).length;
      return { product: p, score };
    });

  scored.sort((a, b) => b.score - a.score);

  // Asegurar que haya un limpiador, hidratante y SPF (mañana) o tratamiento (noche)
  const result = [];
  const categories = new Set();

  for (const { product } of scored) {
    const cat = product.category || product.type || '';
    const isCleanser    = cat.includes('Face Wash') || cat.includes('Cleanser');
    const isMoisturizer = cat.includes('Face Moisturizer') || cat.includes('Moisturizer');
    const isSPF         = cat.includes('Sunscreen') || cat.includes('SPF');
    const isSerum       = cat.includes('Serum');

    // Evitar duplicar categorías
    const key = isCleanser ? 'cleanser' : isSPF ? 'spf' : isMoisturizer ? 'moisturizer' : isSerum ? 'serum' : cat;
    if (categories.has(key)) continue;
    categories.add(key);
    result.push(product);
    if (result.length >= 6) break;
  }

  return result;
}
