<template>
  <div>
    <AppNavbar v-if="!isPublicRoute" />

    <div :class="isPublicRoute ? '' : 'page-wrap'">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </Transition>
      </router-view>
    </div>

    <BottomNav v-if="!isPublicRoute" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()

const publicRoutes = ['/login', '/registro', '/olvide', '/reset-password', '/appointment-confirmation']
const isPublicRoute = computed(() => publicRoutes.includes(route.path))
</script>

<style>
/* Global: offset page content below fixed AppNavbar (promo ~38px + nav 72px = ~110px) */
.page-wrap {
  padding-top: 110px;
  padding-bottom: 80px; /* room for BottomNav */
  min-height: 100vh;
}

/* Route transitions (used by <Transition name="page" />) */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.99);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.995);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
  .page-enter-from,
  .page-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
