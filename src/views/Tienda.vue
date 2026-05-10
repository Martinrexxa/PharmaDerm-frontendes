<template>
  <div class="shop-page">
    <main class="container shop-layout">
      <section class="breadcrumb-row">
        <div class="crumbs">
          <span class="crumb" @click="$router.push('/inicio')">{{ t('bottomNav.home') }}</span>
          <span>›</span>
          <span class="crumb active">{{ t('nav.ourProducts') }}</span>
          <span>›</span>
          <span class="crumb active">{{ activeBrandLabel }}</span>
        </div>
      </section>

      <section class="hero-title">
        <div>
          <h1>{{ activeBrandLabel.toUpperCase() }}</h1>
          <p>{{ t('shop.subtitle') }}</p>
        </div>

        <div class="title-actions">
          <div class="product-count">
            <strong>{{ sortedProducts.length }}</strong>
            <span>{{ t('shop.products') }}</span>
          </div>

          <select v-model="sortBy" class="sort-select">
            <option value="best">{{ t('home.bestSellers') }}</option>
            <option value="az">{{ t('shop.sortAZ') }}</option>
            <option value="za">{{ t('shop.sortZA') }}</option>
            <option value="priceAsc">{{ t('shop.priceLowHigh') }}</option>
            <option value="priceDesc">{{ t('shop.priceHighLow') }}</option>
          </select>
        </div>
      </section>

      <section class="brand-switch-row">
        <button
          class="brand-switch"
          :class="{ active: activeBrand === 'larocheposay' }"
          @click="setBrand('larocheposay')"
        >
          La Roche-Posay
        </button>

        <button
          class="brand-switch"
          :class="{ active: activeBrand === 'cerave' }"
          @click="setBrand('cerave')"
        >
          CeraVe
        </button>
      </section>

      <section class="content-grid">
        <aside class="filters">
          <div class="filters-header">
            <h3>{{ t('shop.filterBy') }}</h3>
            <button @click="resetFilters">{{ t('shop.reset') }}</button>
          </div>

          <div class="filter-box">
            <button class="filter-heading" @click="filterOpen.search = !filterOpen.search">
              <span>{{ t('nav.search') }}</span>
              <span class="filter-chevron" :class="{ open: filterOpen.search }">›</span>
            </button>
            <div v-show="filterOpen.search" class="filter-body">
              <input v-model.trim="search" type="text" :placeholder="t('shop.searchPlaceholder')" />
            </div>
          </div>

          <div v-if="activeBrand === 'larocheposay'" class="filter-box">
            <button class="filter-heading" @click="filterOpen.line = !filterOpen.line">
              <span>{{ t('menu.productLine') }}</span>
              <span class="filter-chevron" :class="{ open: filterOpen.line }">›</span>
            </button>
            <div v-show="filterOpen.line" class="filter-body">
              <div class="scroll-checks">
                <label v-for="line in availableLines" :key="line" class="check-row">
                  <input type="checkbox" :value="line" v-model="selectedLines" />
                  <span>{{ line }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="filter-box">
            <button class="filter-heading" @click="filterOpen.concern = !filterOpen.concern">
              <span>{{ t('menu.skinConcern') }}</span>
              <span class="filter-chevron" :class="{ open: filterOpen.concern }">›</span>
            </button>
            <div v-show="filterOpen.concern" class="filter-body">
              <div class="scroll-checks">
                <label v-for="concern in availableConcerns" :key="concern" class="check-row">
                  <input type="checkbox" :value="concern" v-model="selectedConcerns" />
                  <span>{{ normalizeConcernLabel(concern) }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="filter-box">
            <button class="filter-heading" @click="filterOpen.type = !filterOpen.type">
              <span>{{ t('shop.type') }}</span>
              <span class="filter-chevron" :class="{ open: filterOpen.type }">›</span>
            </button>
            <div v-show="filterOpen.type" class="filter-body">
              <div class="scroll-checks">
                <label v-for="type in availableTypes" :key="type" class="check-row">
                  <input type="checkbox" :value="type" v-model="selectedTypes" />
                  <span>{{ type }}</span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="activeBrand === 'cerave'" class="filter-box">
            <button class="filter-heading" @click="filterOpen.ingredients = !filterOpen.ingredients">
              <span>{{ t('shop.keyIngredients') }}</span>
              <span class="filter-chevron" :class="{ open: filterOpen.ingredients }">›</span>
            </button>
            <div v-show="filterOpen.ingredients" class="filter-body">
              <div class="scroll-checks">
                <label v-for="ingredient in availableKeyIngredients" :key="ingredient.name" class="check-row">
                  <input type="checkbox" :value="ingredient.name" v-model="selectedIngredients" />
                  <span>{{ ingredient.name }} ({{ ingredient.count }})</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        <section class="products-zone">
          <div class="products-grid">
            <article
              v-for="(product, i) in sortedProducts"
              :key="product.id"
              class="product-card"
            >
              <div class="card-image-wrap" @click="openProduct(product.slug)">
                <img :src="product.image" :alt="productName(product)" class="card-image" />
              </div>

              <div class="card-body">
                <p class="brand-line">{{ product.brandLabel }}</p>

                <h3 class="product-name" @click="openProduct(product.slug)">
                  {{ productName(product) }}
                </h3>

                <p class="product-subtitle">{{ productSubtitle(product) }}</p>

                <div class="rating-row">
                  <span class="stars">★★★★★</span>
                  <span class="reviews">
                    {{ Number(product.rating || 4.5).toFixed(1) }}
                    ({{ product.reviews || 0 }})
                  </span>
                </div>

                <div v-if="product.sizes?.length" class="size-row">
                  <label>{{ t('shop.size') }}</label>
                  <select v-model="selectedSize[product.id]">
                    <option
                      v-for="size in product.sizes"
                      :key="size.label"
                      :value="size.label"
                    >
                      {{ size.label }}
                    </option>
                  </select>
                </div>

                <div class="card-bottom">
                  <strong class="price">{{ fmtPrice(selectedPrice(product)) }}</strong>

                  <div class="action-row">
                    <button class="outline-btn" @click="openProduct(product.slug)">
                      {{ t('general.view') }}
                    </button>
                    <button class="primary-btn" @click="addToCart(product)">
                      {{ t('quiz.addToBag') }}
                    </button>
                  </div>
                </div>
              </div>
            </article>

            <div v-if="!sortedProducts.length" class="empty-state">
              {{ t('shop.noResults') }}
            </div>
          </div>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup>
import {
  computed,
  reactive,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { lrpCatalog } from "../data/lrpCatalog";
import { ceraveCatalog } from "../data/ceraveCatalog";
import productService from "../services/productService.js";
import { useCartStore } from "../stores/useCartStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { priceIn, convertPrice } from "../utils/currency";
import { useI18n } from "../lib/i18n.js";

const router = useRouter();
const route = useRoute();
const cart = useCartStore();
const settings = useSettingsStore();
const { t, lang } = useI18n();
const userCurrency = settings.currency;

function localizeField(product, baseKey) {
  if (!product) return ''
  if (lang.value === 'es') {
    return product[`${baseKey}Es`] || product[`${baseKey}_es`] || product[baseKey] || ''
  }
  return product[baseKey] || ''
}

function productName(product) {
  return localizeField(product, 'name')
}

function productSubtitle(product) {
  return localizeField(product, 'subtitle')
}

// Todos los precios ahora están en USD (lrpCatalog y ceraveCatalog) → convertir a DOP
function priceDOP(product, sizeLabel) {
  const sizes = product.sizes || [];
  const size = sizes.find(s => s.label === (sizeLabel || selectedSize[product.id]));
  const usd = size?.priceUSD ?? product.priceUSD ?? product.priceFrom ?? 0;
  return Math.round(convertPrice(Number(usd), 'USD', 'DOP'));
}

function fmtPrice(dopAmount) {
  return priceIn(dopAmount, 'DOP', userCurrency.value);
}

const remoteProducts = ref([])
const allProducts = computed(() => {
  if (remoteProducts.value.length) return remoteProducts.value
  return [
    ...lrpCatalog.map((p) => ({ ...p, brand: p.brand || "larocheposay" })),
    ...ceraveCatalog.map((p) => ({ ...p, brand: p.brand || "cerave" })),
  ]
});

const activeBrand = ref("larocheposay");
const activeBrandLabel = computed(() =>
  activeBrand.value === "larocheposay" ? "La Roche-Posay" : "CeraVe"
);

const search = ref("");
const sortBy = ref("best");
const selectedLines = ref([]);
const selectedConcerns = ref([]);
const selectedTypes = ref([]);
const selectedIngredients = ref([]);
const selectedSize = reactive({});
const filterOpen = reactive({ search: false, line: false, concern: false, type: false, ingredients: false });

const CERAVE_KEY_INGREDIENTS = [
  "Benzoyl Peroxide",
  "Ceramides",
  "Dimethicone",
  "Hyaluronic Acid",
  "Lactic Acid",
  "Niacinamide",
  "Peptides",
  "Petrolatum",
  "Pramoxine Hydrochloride",
  "Retinol",
  "Salicylic Acid",
  "Titanium Dioxide",
  "Urea",
  "Vitamin C",
  "Zinc Oxide",
];

const ingredientNormalizationMap = {
  "benzoyl peroxide": "Benzoyl Peroxide",
  ceramides: "Ceramides",
  dimethicone: "Dimethicone",
  "hyaluronic acid": "Hyaluronic Acid",
  "lactic acid": "Lactic Acid",
  niacinamide: "Niacinamide",
  peptides: "Peptides",
  petrolatum: "Petrolatum",
  "pramoxine hydrochloride": "Pramoxine Hydrochloride",
  retinol: "Retinol",
  "salicylic acid": "Salicylic Acid",
  "titanium dioxide": "Titanium Dioxide",
  urea: "Urea",
  "vitamin c": "Vitamin C",
  "zinc oxide": "Zinc Oxide",
};

function normalizeIngredientName(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();

  for (const [token, canonical] of Object.entries(ingredientNormalizationMap)) {
    if (lower === token || lower.includes(token)) return canonical;
  }

  return "";
}

function getProductIngredientSet(product) {
  const merged = [
    ...(product.ingredientsTags || []),
    ...(product.keyIngredients || []).map((k) => k.name),
  ];
  const normalized = merged
    .map(normalizeIngredientName)
    .filter((name) => CERAVE_KEY_INGREDIENTS.includes(name));
  return new Set(normalized);
}

const brandProducts = computed(() =>
  allProducts.value.filter((p) => p.brand === activeBrand.value)
);

const availableLines = computed(() =>
  [...new Set(brandProducts.value.map((p) => p.line).filter(Boolean))].sort()
);

const availableConcerns = computed(() =>
  [...new Set(brandProducts.value.flatMap((p) => p.concerns || []))].sort()
);

const availableTypes = computed(() =>
  [...new Set(brandProducts.value.map((p) => p.type).filter(Boolean))].sort()
);

const availableKeyIngredients = computed(() => {
  if (activeBrand.value !== "cerave") return [];

  const ceraveProducts = allProducts.value.filter((p) => p.brand === "cerave");

  return CERAVE_KEY_INGREDIENTS
    .map((ingredient) => {
      const count = ceraveProducts.reduce((acc, product) => {
        const set = getProductIngredientSet(product);
        return set.has(ingredient) ? acc + 1 : acc;
      }, 0);
      return { name: ingredient, count };
    })
    .filter((item) => item.count > 0);
});

const filteredProducts = computed(() => {
  const q = search.value.toLowerCase();

  return brandProducts.value.filter((p) => {
    if (q) {
      // FASE 8 — smart search: brand, line, concern, ingredient, description
      const haystack = [
        p.name,
        p.subtitle,
        p.brandLabel,
        p.brand,
        p.line,
        p.type,
        p.category,
        p.description,
        ...(p.concerns || []),
        ...(p.ingredientsTags || []),
        ...(p.keyIngredients || []).map(k => k.name),
        ...(p.safety || p.productSafety || []),
      ].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (
      activeBrand.value === "larocheposay" &&
      selectedLines.value.length &&
      !selectedLines.value.includes(p.line)
    ) {
      return false;
    }

    if (
      selectedConcerns.value.length &&
      !selectedConcerns.value.some((c) => p.concerns?.includes(c))
    ) {
      return false;
    }

    if (selectedTypes.value.length && !selectedTypes.value.includes(p.type)) {
      return false;
    }

    if (activeBrand.value === "cerave" && selectedIngredients.value.length) {
      const ingredientSet = getProductIngredientSet(p);
      const hasAnySelected = selectedIngredients.value.some((ingredient) =>
        ingredientSet.has(ingredient)
      );
      if (!hasAnySelected) return false;
    }

    return true;
  });
});

const sortedProducts = computed(() => {
  const arr = [...filteredProducts.value];

  switch (sortBy.value) {
    case "az":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "za":
      return arr.sort((a, b) => b.name.localeCompare(a.name));
    case "priceAsc":
      return arr.sort((a, b) => selectedPrice(a) - selectedPrice(b));
    case "priceDesc":
      return arr.sort((a, b) => selectedPrice(b) - selectedPrice(a));
    default:
      return arr.sort((a, b) => Number(b.reviews || 0) - Number(a.reviews || 0));
  }
});

function selectedPrice(product) {
  return priceDOP(product, selectedSize[product.id]);
}

function addToCart(product) {
  const size = selectedSize[product.id] || product.defaultSize || product.sizes?.[0]?.label;
  cart.addItem(product, {
    size,
    qty: 1,
    priceRD: priceDOP(product, size),
    mode: "one-time",
  });
}

function openProduct(slug) {
  router.push(`/producto/${slug}`);
}

function resetFilters() {
  search.value = "";
  selectedLines.value = [];
  selectedConcerns.value = [];
  selectedTypes.value = [];
  selectedIngredients.value = [];
  sortBy.value = "best";
}

function setBrand(brand) {
  activeBrand.value = brand;
  resetFilters();
  brandProducts.value.forEach((p) => {
    if (p.sizes?.length && !selectedSize[p.id]) {
      selectedSize[p.id] = p.defaultSize || p.sizes[0].label;
    }
  });
}

function setLineFilter(line) {
  resetFilters();
  selectedLines.value = [line];
}

function setConcernFilter(concern) {
  resetFilters();
  selectedConcerns.value = [concern];
}

function applySearch(term) {
  resetFilters();
  search.value = term;
}

function applyQueryParams() {
  const q = route.query;
  if (q.search) { resetFilters(); search.value = String(q.search); }
  if (q.line) { resetFilters(); selectedLines.value = [String(q.line)]; }
  if (q.concern) { resetFilters(); selectedConcerns.value = [String(q.concern)]; }
  if (q.ingredient) {
    const normalized = normalizeIngredientName(String(q.ingredient));
    if (normalized) {
      resetFilters();
      selectedIngredients.value = [normalized];
    }
  }
  if (q.brand) {
    const b = String(q.brand);
    if (b === 'cerave' || b === 'larocheposay') activeBrand.value = b;
  }
}

function normalizeConcernLabel(value) {
  const map = {
    "Acne Prone Skin": "Acne Prone",
    "Fine Lines & Wrinkles": "Anti-Aging",
    Oiliness: "Oily Skin",
  };
  return map[value] || value;
}

function shortenName(name) {
  if (name.length <= 24) return name;
  return `${name.slice(0, 24)}...`;
}

onMounted(() => {
  productService.getAll()
    .then((rows) => {
      if (Array.isArray(rows) && rows.length) remoteProducts.value = rows
    })
    .catch(() => {})

  brandProducts.value.forEach((p) => {
    if (p.sizes?.length && !selectedSize[p.id]) {
      selectedSize[p.id] = p.defaultSize || p.sizes[0].label;
    }
  });
  applyQueryParams();
});

watch(() => route.query, applyQueryParams);
</script>

<style scoped>
.shop-page,
.shop-layout,
.search-overlay,
.search-overlay__box {
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}

.shop-page {
  min-height: 100vh;
  background: #ffffff;
  color: #111827;
}

.container {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
}

.top-promos {
  background: #63b6cb;
  color: white;
  border-bottom: 1px solid #dbe3e8;
  display: grid;
  grid-template-columns: 1fr;
  padding: 12px 24px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .08em;
  text-align: center;
  font-weight: 700;
}

.shop-header {
  position: sticky;
  top: 0;
  z-index: 90;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  overflow: visible;
}

.header-main {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  position: relative;
  overflow: visible;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.brand-text {
  font-size: 18px;
  font-weight: 800;
  color: #07579b;
  line-height: 1;
  white-space: nowrap;
}

.brand-accent {
  color: #76b82a;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex-wrap: nowrap;
  overflow: visible;
}

.nav-link {
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .02em;
  cursor: pointer;
  color: #111827;
  white-space: nowrap;
  padding: 4px 6px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  position: relative;
  cursor: pointer;
  color: #07579b;
  display: grid;
  place-items: center;
}

.icon-btn .material-symbols-outlined {
  font-size: 24px;
}

.cart-badge {
  position: absolute;
  right: 0;
  top: 2px;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #111827;
  color: white;
  font-size: 10px;
  display: grid;
  place-items: center;
}

.nav-hover-wrap {
  position: static;
  overflow: visible;
}

.products-hover-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: min(1280px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  background: #f7f7f7;
  border: 1px solid #d8dee5;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  padding: 22px 24px;
  z-index: 999;
  overflow-x: auto;
}

.hover-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(150px, 1fr));
  gap: 22px;
  min-width: 980px;
}

.hover-col h4 {
  margin: 0 0 12px;
  font-size: 12px;
  letter-spacing: .03em;
}

.hover-col button {
  display: block;
  border: none;
  background: transparent;
  padding: 0;
  margin-bottom: 12px;
  text-align: left;
  color: #334155;
  cursor: pointer;
  font-size: 13px;
  line-height: 1.2;
}

.hover-col button:hover {
  text-decoration: underline;
}

.profile-wrap {
  position: relative;
}

.profile-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: 180px;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
  z-index: 120;
  padding: 10px;
  display: grid;
  gap: 8px;
}

.profile-panel button {
  border: none;
  background: #fff;
  text-align: left;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
}

.profile-panel button:hover {
  background: #f8fafc;
}

.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(244, 248, 251, 0.92);
  z-index: 200;
}

.search-overlay__box {
  width: 100%;
  height: 100%;
  background: #eef4f8;
}

.search-overlay__top {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  border-bottom: 1px solid #d7e1e8;
  background: white;
}

.search-tabs {
  display: flex;
  align-items: center;
  gap: 26px;
  padding: 0 18px;
}

.close-search {
  min-width: 170px;
  border: none;
  border-left: 1px solid #d7e1e8;
  background: #dfeff5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 700;
  cursor: pointer;
}

.search-overlay__input-row {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 14px;
  align-items: center;
  padding: 18px 18px 14px;
}

.search-title {
  font-size: 34px;
  line-height: 1.05;
  color: #4b5563;
  font-weight: 300;
}

.search-overlay__input {
  width: 100%;
  height: 64px;
  border: 2px solid #4f83ff;
  background: white;
  padding: 0 16px;
  font-size: 28px;
  color: #6b7280;
  font-weight: 600;
}

.search-overlay__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 18px;
  padding: 14px 18px 20px;
}

.search-left__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.search-left__header h3 {
  margin: 0;
  font-size: 18px;
}

.view-all-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  text-decoration: underline;
}

.best-matches-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.best-match-card {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 12px;
  border: none;
  background: rgba(255,255,255,0.4);
  text-align: left;
  cursor: pointer;
  padding: 14px;
  min-width: 0;
}

.best-match-card img {
  width: 110px;
  height: 110px;
  object-fit: contain;
  background: white;
}

.best-match-card__info h4 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.1;
}

.best-match-card__info p {
  margin: 0 0 8px;
  color: #475569;
  font-size: 13px;
  line-height: 1.35;
}

.mini-stars {
  margin-bottom: 8px;
  color: #2196f3;
  letter-spacing: 1px;
}

.best-match-card__info strong {
  font-size: 16px;
}

.search-right {
  display: grid;
  gap: 18px;
}

.search-side-box {
  background: white;
  border: 1px solid #dbe3ea;
  padding: 18px 20px;
}

.search-side-box h4 {
  margin: 0 0 14px;
  font-size: 13px;
}

.search-side-box button {
  display: block;
  border: none;
  background: transparent;
  padding: 0;
  margin-bottom: 14px;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  color: #374151;
}

.search-empty {
  grid-column: 1 / -1;
  padding: 20px;
  background: white;
  color: #6b7280;
}

.shop-layout {
  padding-bottom: 40px;
}

.breadcrumb-row {
  padding: 20px 0 10px;
}

.crumbs {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.crumb.active {
  color: #111827;
}

.hero-title {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
  padding: 8px 0 22px;
}

.hero-title h1 {
  margin: 0;
  font-size: 34px;
  letter-spacing: -.02em;
}

.hero-title p {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 15px;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

.product-count {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.sort-select {
  height: 42px;
  border: 1px solid #d1d5db;
  padding: 0 12px;
  background: #fff;
}

.brand-switch-row {
  display: flex;
  gap: 10px;
  margin-bottom: 22px;
}

.brand-switch {
  height: 40px;
  padding: 0 16px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  font-weight: 700;
}

.brand-switch.active {
  border-color: #00a3e0;
  color: #00a3e0;
}

.content-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 28px;
}

.filters {
  position: sticky;
  top: 120px;
  align-self: start;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  padding-right: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.5) transparent;
}

.filters::-webkit-scrollbar {
  width: 8px;
}

.filters::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.5);
  border-radius: 999px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.filters-header h3 {
  margin: 0;
  font-size: 16px;
}

.filters-header button {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
}

.filter-box {
  border: 1px solid #e5e7eb;
  margin-bottom: 14px;
  background: #fff;
  overflow: hidden;
}

.filter-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .04em;
  text-align: left;
  color: inherit;
}

.filter-heading:hover {
  background: #f8fafc;
}

.filter-chevron {
  font-size: 16px;
  transition: transform 0.2s ease;
  display: inline-block;
  transform: rotate(90deg);
}

.filter-chevron.open {
  transform: rotate(-90deg);
}

.filter-body {
  padding: 0 16px 14px;
}

.filter-box input[type="text"] {
  width: 100%;
  height: 42px;
  border: 1px solid #d1d5db;
  padding: 0 12px;
}

.scroll-checks {
  max-height: 210px;
  overflow-y: auto;
  padding-right: 6px;
}

.scroll-checks::-webkit-scrollbar {
  width: 7px;
}

.scroll-checks::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 999px;
}

.check-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.product-card {
  border: 1px solid #e5e7eb;
  background: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 48px rgba(0,0,0,0.10);
}

.card-image-wrap {
  background: #f8fafc;
  padding: 24px;
  cursor: pointer;
}

.card-image {
  width: 100%;
  height: 240px;
  object-fit: contain;
  display: block;
}

.card-body {
  padding: 18px;
}

.brand-line {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: .06em;
  color: #6b7280;
}

.product-name {
  margin: 0 0 8px;
  font-size: 17px;
  line-height: 1.2;
  cursor: pointer;
}

.product-subtitle {
  margin: 0 0 12px;
  color: #4b5563;
  font-size: 13px;
  min-height: 38px;
}

.rating-row {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  margin-bottom: 14px;
}

.stars {
  color: #111827;
  letter-spacing: 1px;
}

.reviews {
  color: #6b7280;
}

.size-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.size-row select {
  min-width: 130px;
  height: 40px;
  border: 1px solid #d1d5db;
  padding: 0 10px;
}

.card-bottom {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price {
  font-size: 20px;
}

.action-row {
  display: flex;
  gap: 10px;
}

.outline-btn,
.primary-btn {
  flex: 1;
  height: 44px;
  cursor: pointer;
  font-weight: 700;
}

.outline-btn {
  border: 1px solid #111827;
  background: white;
}

.primary-btn {
  border: 1px solid #009fe3;
  background: #009fe3;
  color: white;
}

.empty-state {
  grid-column: 1 / -1;
  border: 1px dashed #d1d5db;
  padding: 30px;
  text-align: center;
  color: #6b7280;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1250px) {
  .hover-grid {
    grid-template-columns: repeat(4, minmax(150px, 1fr));
    min-width: 780px;
  }
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .best-matches-grid {
    grid-template-columns: 1fr 1fr;
  }

  .search-overlay__input-row {
    grid-template-columns: 1fr;
  }

  .search-title {
    font-size: 28px;
  }

  .products-hover-panel {
    width: min(980px, calc(100vw - 28px));
  }
}

@media (max-width: 1000px) {
  .desktop-nav {
    display: none;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    position: static;
    max-height: none;
  }

  .search-overlay__content {
    grid-template-columns: 1fr;
  }

  .header-main {
    height: 68px;
  }

  .brand-text {
    font-size: 16px;
  }

  .products-hover-panel {
    width: min(94vw, 94vw);
  }

  .hover-grid {
    grid-template-columns: repeat(3, minmax(150px, 1fr));
    min-width: 680px;
  }
}

@media (max-width: 700px) {
  .container {
    padding: 0 14px;
  }

  .hero-title {
    flex-direction: column;
    align-items: start;
  }

  .products-grid,
  .best-matches-grid {
    grid-template-columns: 1fr;
  }

  .search-overlay__input {
    height: 54px;
    font-size: 22px;
  }

  .search-tabs {
    display: none;
  }

  .close-search {
    min-width: 110px;
  }

  .search-title {
    font-size: 22px;
  }

  .brand-switch-row {
    flex-wrap: wrap;
  }

  .products-hover-panel {
    width: calc(100vw - 20px);
    max-width: calc(100vw - 20px);
    padding: 18px 16px;
  }

  .hover-grid {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
    min-width: 0;
    gap: 18px;
  }
}
</style>
