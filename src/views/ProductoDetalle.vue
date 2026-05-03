<template>
  <div v-if="product" class="pdp-page">
    <main class="container">
      <section class="pdp-main">
        <div class="gallery">
          <div class="main-image">
            <img :src="activeImage" :alt="product.name" />
          </div>

          <div class="thumbs">
            <button
              v-for="img in product.gallery"
              :key="img"
              class="thumb"
              :class="{ active: activeImage === img }"
              @click="activeImage = img"
            >
              <img :src="img" :alt="product.name" />
            </button>
          </div>
        </div>

        <div class="buy-box">
          <div class="rating-line">
            <span class="stars">★★★★★</span>
            <span>{{ product.rating.toFixed(1) }} ({{ product.reviews }})</span>
          </div>

          <p class="brand-line">{{ product.brandLabel }}</p>
          <h1>{{ product.name }}</h1>
          <p class="subtitle">{{ product.subtitle }}</p>

          <div class="selected-price">
            <strong>{{ fmtPrice(selectedSizeObj.priceUSD || product.priceUSD) }}</strong>
            <span v-if="selectedSizeObj.pricePer">{{ selectedSizeObj.pricePer }}</span>
          </div>

          <div class="size-section" v-if="product.sizes?.length">
            <p class="section-label">Selected size: {{ size }}</p>

            <div class="size-grid">
              <button
                v-for="s in product.sizes"
                :key="s.label"
                class="size-btn"
                :class="{ active: size === s.label }"
                @click="size = s.label"
              >
                <div>{{ s.label }}</div>
                <small>{{ fmtPrice(s.priceUSD) }}</small>
              </button>
            </div>
          </div>

          <div class="offer-box">
            <label class="radio-row">
              <input type="radio" value="one-time" v-model="purchaseMode" />
              <span>Deliver one-time only</span>
            </label>

            <label class="radio-row">
              <input type="radio" value="autoship" v-model="purchaseMode" />
              <span>Get up to 15% off + a free sample with Replenish & Save</span>
            </label>
          </div>

          <div class="cart-row">
            <div class="qty-box">
              <button @click="decreaseQty">−</button>
              <span>{{ qty }}</span>
              <button @click="qty++">+</button>
            </div>

            <button class="add-bag" @click="addToCart(product)">
              {{ fmtPrice((selectedSizeObj.priceUSD || product.priceUSD) * qty) }} — ADD TO BAG
            </button>
          </div>

          <div class="buy-now-row">
            <button class="buy-now" @click="buyNow(product)">BUY NOW</button>
          </div>

          <div v-if="product.badge" class="badge-box">
            ⭐ {{ product.badge }}
          </div>

          <div v-if="product.promoInstallments" class="afterpay">
            {{ product.promoInstallments }}
          </div>

          <div v-if="pairsBestWith.length" class="pairs-box">
            <h3>PAIRS BEST WITH</h3>

            <div class="pair-card" v-for="pair in pairsBestWith" :key="pair.id">
              <img :src="pair.image" :alt="pair.name" />

              <div class="pair-info">
                <p>{{ pair.name }}</p>
                <button @click="addToCart(pair)">
                  ADD TO BAG • ${{ money(pair.priceFrom) }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="accordion-area">
        <details open>
          <summary>DESCRIPTION</summary>
          <p>{{ product.description }}</p>
        </details>

        <details open>
          <summary>BENEFITS</summary>
          <ul>
            <li v-for="item in product.benefits || []" :key="item">{{ item }}</li>
          </ul>
        </details>

        <details open>
          <summary>RECOMMENDED FOR</summary>
          <div class="recommend-grid">
            <div>
              <h4>Skin Concern:</h4>
              <ul>
                <li v-for="item in product.recommendedFor?.concerns || []" :key="item">{{ item }}</li>
              </ul>
            </div>

            <div>
              <h4>Skin Type:</h4>
              <ul>
                <li v-for="item in product.recommendedFor?.skinTypes || []" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>
        </details>

        <details open>
          <summary>INGREDIENTS</summary>
          <h4>KEY INGREDIENTS</h4>

          <div class="ingredients-list">
            <div
              v-for="ing in product.keyIngredients || []"
              :key="ing.name"
              class="ingredient-item"
            >
              <strong>{{ ing.name }}:</strong> {{ ing.text }}
            </div>
          </div>

          <h4>FULL INGREDIENT LIST</h4>
          <p class="full-ingredients">{{ product.fullIngredients }}</p>
        </details>
      </section>

      <section v-if="product.howToUse" class="how-to">
        <div class="how-image">
          <img :src="activeImage" :alt="product.name" />
        </div>

        <div class="how-info">
          <div class="how-item">
            <h4>QUANTITY</h4>
            <p>{{ product.howToUse.quantity }}</p>
          </div>

          <div class="how-item">
            <h4>WHEN</h4>
            <p>{{ product.howToUse.when }}</p>
          </div>

          <div class="how-item">
            <h4>WHERE</h4>
            <p>{{ product.howToUse.where }}</p>
          </div>

          <div class="how-item">
            <h4>APPLICATION TIP</h4>
            <p>{{ product.howToUse.tip }}</p>
          </div>
        </div>
      </section>

      <section v-if="product.productSafety?.length" class="safety-section">
        <h2>PRODUCT SAFETY</h2>

        <div class="safety-grid">
          <div
            v-for="item in product.productSafety"
            :key="item"
            class="safety-card"
          >
            {{ item }}
          </div>
        </div>
      </section>

      <section v-if="related.length" class="related-section">
        <h2>COMPLETE YOUR ROUTINE</h2>

        <div class="related-grid">
          <article v-for="item in related" :key="item.id" class="related-card">
            <img :src="item.image" :alt="item.name" />

            <div>
              <p class="mini-line">{{ item.line }}</p>
              <h3>{{ item.name }}</h3>
              <p>{{ item.subtitle }}</p>

              <div class="mini-actions">
                <strong>${{ money(item.priceFrom) }}</strong>
                <button @click="goTo(item.slug)">View</button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section v-if="product.faqs?.length" class="faq-section">
        <h2>FREQUENTLY ASKED QUESTIONS</h2>

        <details v-for="faq in product.faqs" :key="faq.q" class="faq-item">
          <summary>{{ faq.q }}</summary>
          <p>{{ faq.a }}</p>
        </details>
      </section>
    </main>
  </div>

  <div v-else class="not-found container">
    <h1>Producto no encontrado</h1>
    <button @click="$router.push('/tienda')">Volver a Shop</button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { money } from "../data/lrpCatalog";
import { getProductBySlug, getProductById, relatedProductsFor } from "../data/productCatalog";
import { useCartStore } from "../stores/useCartStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { priceIn, convertPrice } from "../utils/currency";

const cart = useCartStore();
const settings = useSettingsStore();
const userCurrency = settings.currency;

// lrpCatalog prices are in USD; convert to user's currency for display
function fmtPrice(usdAmount) {
  const dop = convertPrice(Number(usdAmount) || 0, 'USD', 'DOP');
  return priceIn(dop, 'DOP', userCurrency.value);
}

const route = useRoute();
const router = useRouter();

const product = computed(() => getProductBySlug(route.params.slug));
const activeImage = ref("");
const size = ref("");
const qty = ref(1);
const purchaseMode = ref("one-time");

watch(
  () => route.params.slug,
  () => {
    activeImage.value = product.value?.gallery?.[0] || product.value?.image || "";
    size.value = product.value?.defaultSize || product.value?.sizes?.[0]?.label || "";
    qty.value = 1;
    purchaseMode.value = "one-time";
  },
  { immediate: true }
);

const selectedSizeObj = computed(() => {
  return product.value?.sizes?.find((s) => s.label === size.value) || {};
});

const pairsBestWith = computed(() => {
  const ids = product.value?.pairsBestWith || [];
  return ids.map((id) => getProductById(id)).filter(Boolean);
});

const related = computed(() => relatedProductsFor(product.value));

const decreaseQty = () => {
  if (qty.value > 1) qty.value -= 1;
};

const addToCart = (item) => {
  const activeSize =
    item.id === product.value?.id
      ? size.value
      : item.defaultSize || item.sizes?.[0]?.label || "Default";

  const usd =
    item.id === product.value?.id
      ? selectedSizeObj.value.priceUSD || item.priceUSD
      : item.priceFrom || item.priceUSD;

  cart.addItem(item, {
    size: activeSize,
    qty: item.id === product.value?.id ? qty.value : 1,
    priceRD: Math.round(convertPrice(usd, 'USD', 'DOP')),
    mode: item.id === product.value?.id ? purchaseMode.value : "one-time",
  });

  router.push("/carrito");
};

const buyNow = (item) => {
  const activeSize = size.value || item.defaultSize || item.sizes?.[0]?.label || "Default";
  const usd = selectedSizeObj.value.priceUSD || item.priceUSD;
  cart.addItem(item, {
    size: activeSize,
    qty: qty.value,
    priceRD: Math.round(convertPrice(usd, 'USD', 'DOP')),
    mode: purchaseMode.value,
  });
  router.push("/checkout");
};

const goTo = (slug) => {
  router.push(`/producto/${slug}`);
};
</script>

<style scoped>
.pdp-page {
  min-height: 100vh;
  background: #fff;
  color: #111827;
  font-family: Arial, Helvetica, sans-serif;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

.pdp-main {
  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 48px;
  align-items: start;
  padding: 12px 0 40px;
}

.gallery {
  min-width: 0;
}

.main-image {
  background: #fff;
  border: 1px solid #e5e7eb;
  min-height: 640px;
  display: grid;
  place-items: center;
}

.main-image img {
  width: 100%;
  max-width: 620px;
  height: 620px;
  object-fit: contain;
}

.thumbs {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.thumb {
  width: 86px;
  height: 86px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
}

.thumb.active {
  border-color: #111827;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.buy-box {
  min-width: 0;
}

.rating-line {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.stars {
  letter-spacing: 1px;
}

.brand-line {
  font-size: 11px;
  letter-spacing: .08em;
  color: #6b7280;
  margin: 0 0 8px;
}

.buy-box h1 {
  margin: 0 0 8px;
  font-size: 38px;
  line-height: 1.05;
}

.subtitle {
  margin: 0 0 18px;
  color: #4b5563;
  font-size: 15px;
}

.selected-price {
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 16px;
  margin-bottom: 18px;
}

.selected-price strong {
  font-size: 34px;
}

.section-label {
  margin: 0 0 12px;
  font-size: 14px;
}

.size-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.size-btn {
  min-height: 88px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
  padding: 12px;
  font-weight: 700;
}

.size-btn.active {
  border-color: #00a3e0;
  box-shadow: inset 0 0 0 1px #00a3e0;
}

.offer-box {
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.radio-row {
  display: flex;
  gap: 10px;
  align-items: start;
  padding: 14px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.radio-row:last-child {
  border-bottom: none;
}

.cart-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.qty-box {
  height: 44px;
  border: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qty-box button {
  width: 36px;
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
}

.add-bag {
  height: 44px;
  border: 1px solid #00a3e0;
  background: #00a3e0;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.buy-now-row {
  margin-bottom: 12px;
}

.buy-now {
  width: 100%;
  height: 44px;
  border: 1px solid #111827;
  background: white;
  font-weight: 700;
  cursor: pointer;
}

.badge-box {
  border: 1px dashed #7dd3fc;
  padding: 10px 12px;
  margin: 12px 0;
  font-size: 14px;
}

.afterpay {
  color: #4b5563;
  font-size: 13px;
  margin-bottom: 24px;
}

.pairs-box h3,
.related-section h2,
.safety-section h2,
.faq-section h2 {
  margin: 0 0 16px;
  font-size: 18px;
}

.pair-card {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 14px;
  border: 1px solid #e5e7eb;
  padding: 12px;
  margin-bottom: 12px;
}

.pair-card img {
  width: 100%;
  height: 120px;
  object-fit: contain;
  background: #f8fafc;
}

.pair-info p {
  margin: 0 0 10px;
  font-weight: 700;
}

.pair-info button {
  height: 40px;
  padding: 0 14px;
  background: white;
  border: 1px solid #111827;
  cursor: pointer;
  font-weight: 700;
}

.accordion-area {
  border-top: 1px solid #e5e7eb;
  margin-top: 20px;
}

.accordion-area details {
  border-bottom: 1px solid #e5e7eb;
  padding: 18px 0;
}

.accordion-area summary {
  cursor: pointer;
  font-weight: 800;
  letter-spacing: .02em;
}

.accordion-area p,
.accordion-area li {
  color: #111827;
  line-height: 1.7;
}

.recommend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.ingredients-list {
  display: grid;
  gap: 14px;
}

.ingredient-item {
  line-height: 1.7;
}

.full-ingredients {
  font-size: 14px;
}

.how-to {
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 24px;
  margin: 42px 0;
  background: #f8fafc;
}

.how-image img {
  width: 100%;
  height: 100%;
  min-height: 440px;
  object-fit: contain;
  background: #eaf4ff;
}

.how-info {
  padding: 30px 24px;
  display: grid;
  gap: 18px;
}

.how-item {
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 16px;
}

.how-item:last-child {
  border-bottom: none;
}

.how-item h4 {
  margin: 0 0 8px;
  font-size: 16px;
}

.safety-section {
  padding: 10px 0 28px;
}

.safety-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.safety-card {
  border: 1px solid #e5e7eb;
  padding: 18px;
  text-align: center;
  font-weight: 700;
  background: white;
}

.related-section {
  padding: 20px 0 28px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.related-card {
  border: 1px solid #e5e7eb;
  background: white;
}

.related-card img {
  width: 100%;
  height: 260px;
  object-fit: contain;
  background: #f8fafc;
}

.related-card > div {
  padding: 16px;
}

.mini-line {
  margin: 0 0 6px;
  color: #6b7280;
  font-size: 12px;
}

.related-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.related-card p {
  color: #4b5563;
}

.mini-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
}

.mini-actions button {
  height: 38px;
  padding: 0 12px;
  background: white;
  border: 1px solid #111827;
  cursor: pointer;
}

.faq-item {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 0;
}

.faq-item summary {
  cursor: pointer;
  font-weight: 700;
}

.not-found {
  padding: 60px 24px;
}

.not-found button {
  height: 42px;
  padding: 0 16px;
  border: 1px solid #111827;
  background: #fff;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .pdp-main,
  .how-to {
    grid-template-columns: 1fr;
  }

  .related-grid {
    grid-template-columns: 1fr 1fr;
  }

  .safety-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 700px) {
  .size-grid,
  .cart-row,
  .recommend-grid,
  .related-grid,
  .safety-grid {
    grid-template-columns: 1fr;
  }

  .pair-card {
    grid-template-columns: 1fr;
  }

  .buy-box h1 {
    font-size: 28px;
  }
}
</style>