<template>
  <div class="cart-page">
    <main class="container cart-layout">
      <section class="cart-items">
        <article
          v-for="(item, index) in cartItems"
          :key="`${item.slug || item.id}-${item.size || 'default'}-${index}`"
          class="cart-item"
        >
          <img :src="item.image" :alt="item.name" class="cart-item__img" />

          <div class="cart-item__body">
            <h3>{{ item.name }}</h3>
            <p class="muted" v-if="item.size">Size: {{ item.size }}</p>
            <p class="muted" v-if="item.mode">
              Purchase: {{ item.mode === 'autoship' ? 'Replenish & Save' : 'One-time' }}
            </p>
            <p class="muted" v-if="item.brand">Brand: {{ item.brand }}</p>
            <strong>{{ fmtPrice(item.priceRD) }}</strong>
          </div>

          <div class="cart-item__actions">
            <div class="qty-box">
              <button
                @click="cart.updateQty(index, (item.quantity || 1) - 1)"
                :disabled="(item.quantity || 1) <= 1"
                :style="{ opacity: (item.quantity || 1) <= 1 ? '0.35' : '1', cursor: (item.quantity || 1) <= 1 ? 'not-allowed' : 'pointer' }"
              >−</button>
              <span>{{ item.quantity }}</span>
              <button @click="cart.updateQty(index, (item.quantity || 1) + 1)">+</button>
            </div>

            <button class="remove-btn" @click="cart.removeItem(index)">
              Remove
            </button>
          </div>
        </article>

        <div v-if="!cartItems.length" class="empty">
          <p>Your cart is empty.</p>
          <button class="shop-btn" @click="router.push('/tienda')">
            Continue Shopping
          </button>
        </div>
      </section>

      <aside class="summary" v-if="cartItems.length">
        <h2>Order Summary</h2>

        <div class="summary-row">
          <span>Subtotal</span>
          <strong>{{ fmtPrice(subtotal) }}</strong>
        </div>

        <div class="summary-row">
          <span>Estimated shipping</span>
          <strong>{{ subtotal >= 3000 ? "Free" : fmtPrice(250) }}</strong>
        </div>

        <div class="summary-row total">
          <span>Total</span>
          <strong>{{ fmtPrice(total) }}</strong>
        </div>

        <button class="checkout-btn" @click="router.push('/checkout')">Proceed to Checkout</button>
        <button class="clear-btn" @click="cart.clear()">Clear Cart</button>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/useCartStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { priceIn } from "../utils/currency";

const router = useRouter();
const cart = useCartStore();
const settings = useSettingsStore();
const { items: cartItems, subtotal: cartSubtotal } = cart;
const userCurrency = settings.currency;

function fmtPrice(dopAmount) {
  return priceIn(Number(dopAmount) || 0, 'DOP', userCurrency.value);
}

const subtotal  = computed(() => cartSubtotal.value);
const shipping  = computed(() => (subtotal.value >= 3000 ? 0 : 250));
const total     = computed(() => subtotal.value + shipping.value);
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #fff;
  color: #111827;
  font-family: Arial, Helvetica, sans-serif;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 28px;
  padding: 28px 24px 40px;
}

.cart-items {
  display: grid;
  gap: 16px;
}

.cart-item {
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: 18px;
  border: 1px solid #e5e7eb;
  padding: 16px;
}

.cart-item__img {
  width: 100%;
  height: 140px;
  object-fit: contain;
  background: #f8fafc;
}

.cart-item__body h3 {
  margin: 0 0 8px;
  font-size: 20px;
}

.muted {
  margin: 0 0 6px;
  color: #6b7280;
}

.cart-item__actions {
  display: flex;
  flex-direction: column;
  align-items: end;
  justify-content: space-between;
}

.qty-box {
  width: 120px;
  height: 42px;
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

.remove-btn {
  border: none;
  background: transparent;
  color: #b91c1c;
  cursor: pointer;
}

.summary {
  border: 1px solid #e5e7eb;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 120px;
}

.summary h2 {
  margin: 0 0 18px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
}

.summary-row.total {
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
  font-size: 18px;
}

.checkout-btn,
.clear-btn,
.shop-btn {
  width: 100%;
  height: 46px;
  cursor: pointer;
  font-weight: 700;
  margin-top: 12px;
}

.checkout-btn {
  background: #00a3e0;
  color: white;
  border: 1px solid #00a3e0;
}

.clear-btn,
.shop-btn {
  background: white;
  border: 1px solid #111827;
}

.empty {
  border: 1px dashed #d1d5db;
  padding: 40px;
  text-align: center;
}

@media (max-width: 900px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 1fr;
  }

  .cart-item__actions {
    align-items: start;
    gap: 12px;
  }
}
</style>
