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

const publicRoutes = ['/login', '/registro', '/olvide']
const isPublicRoute = computed(() => publicRoutes.includes(route.path))
</script>

<style>
/* Global: offset page content below fixed AppNavbar (promo ~38px + nav 72px = ~110px) */
.page-wrap {
  padding-top: 110px;
  padding-bottom: 80px; /* room for BottomNav */
  min-height: 100vh;
}
</style>
