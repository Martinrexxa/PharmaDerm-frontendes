<template>
  <nav class="bottom-nav">
    <RouterLink to="/inicio" class="nav-item" :class="{ active: isActive('/inicio') }" aria-label="Home">
      <span class="material-symbols-outlined">home</span>
      <p>Home</p>
    </RouterLink>

    <RouterLink to="/tienda" class="nav-item" :class="{ active: isActive('/tienda') || isActive('/producto') }" aria-label="Shop">
      <span class="material-symbols-outlined">grid_view</span>
      <p>Shop</p>
    </RouterLink>

    <RouterLink to="/diagnostics" class="nav-center" :class="{ active: isActive('/diagnostics') }" aria-label="Diagnostics">
      <div class="fab">
        <span class="material-symbols-outlined">stethoscope</span>
      </div>
      <p>Diagnostics</p>
    </RouterLink>

    <RouterLink to="/routine" class="nav-item" :class="{ active: isActive('/routine') }" aria-label="Routine">
      <span class="material-symbols-outlined">spa</span>
      <p>Routine</p>
    </RouterLink>

    <RouterLink to="/perfil" class="nav-item" :class="{ active: isActive('/perfil') }" aria-label="Profile">
      <span class="material-symbols-outlined">person</span>
      <p>Profile</p>
    </RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useRoute } from 'vue-router'

const route = useRoute()

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(10px);
  border-top: 1px solid #e2e8f0;
  padding: 10px 24px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 50;
}

.nav-item,
.nav-center {
  text-decoration: none;
  color: #94a3b8;
  display: grid;
  place-items: center;
  gap: 4px;
  min-width: 60px;
  user-select: none;
}


.nav-item .material-symbols-outlined,
.nav-center .material-symbols-outlined {
  font-size: 26px;
}

.nav-item p,
.nav-center p {
  font-size: 11px;
  margin: 0;
  font-weight: 600;
}

.nav-item.active,
.nav-center.active {
  color: #004e92;
}

.nav-center {
  margin-top: -20px;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #004e92;
  color: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 16px 36px rgba(0,0,0,0.22);
  border: 4px solid rgba(248,250,252,0.96);
}

.nav-center.active .fab {
  background: #0066cc;
}

/* Dark mode support */
:global(.dark) .bottom-nav {
  background: rgba(10,18,32,0.96);
  border-top-color: #1c2b44;
}

:global(.dark) .nav-item,
:global(.dark) .nav-center {
  color: #6f8099;
}

:global(.dark) .nav-item.active,
:global(.dark) .nav-center.active {
  color: #66d6ff;
}

:global(.dark) .fab {
  background: #1f4b86;
  border-color: rgba(11,18,32,0.96);
}
</style>
