<template>
  <div
    class="min-h-screen"
    :class="[{ 'pd-dark': isDark }, 'pd-root']"
  >
    <!-- MAIN -->
    <main class="max-w-[1200px] mx-auto px-6 py-8">
      <!-- HERO PERFIL -->
      <section class="pd-hero rounded-[28px] overflow-hidden shadow-xl relative">
        <div class="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 px-6 sm:px-10 py-8 sm:py-10 text-white">
          <div class="flex flex-col justify-center">
            <span class="text-xs uppercase tracking-[0.25em] opacity-80">
              Welcome back
            </span>

            <h2 class="text-3xl sm:text-4xl font-extrabold mt-3 leading-tight">
              Hola, {{ auth.displayName.value }}
            </h2>

            <p class="mt-4 text-white/90 text-sm sm:text-base max-w-2xl">
              Administra tu cuenta, revisa tus pedidos, consulta tus citas dermatológicas
              y accede rápidamente a tu rutina personalizada.
            </p>

            <div class="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                class="pd-cta px-6 py-3 rounded-full font-bold shadow-lg transition"
                @click="router.push('/diagnostics')"
              >
                Reservar cita
              </button>

              <button
                type="button"
                class="pd-ghost-white px-6 py-3 rounded-full font-bold transition"
                @click="router.push('/tienda')"
              >
                Ver tienda
              </button>
            </div>
          </div>

          <div class="pd-card rounded-[24px] p-5 sm:p-6 text-slate-900 shadow-xl self-start">
            <div class="flex items-start gap-4">
              <div class="pd-profile-avatar-wrap">
                <img
                  v-if="currentUser?.avatar"
                  :src="currentUser.avatar"
                  alt="Avatar"
                  class="pd-profile-avatar"
                />
                <div v-else class="pd-profile-avatar pd-profile-avatar-fallback">
                  {{ currentInitial }}
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-xs uppercase tracking-[0.2em] pd-muted font-bold">
                  Cuenta principal
                </p>
                <h3 class="text-xl font-extrabold mt-1 text-slate-900">
                  {{ auth.displayName.value }}
                </h3>
                <p class="text-sm text-slate-500 break-all mt-1">
                  {{ currentUser?.email || "Sin correo registrado" }}
                </p>

                <div class="mt-4 flex flex-wrap gap-2">
                  <span class="pd-chip-inline">Perfil activo</span>
                  <span class="pd-chip-inline">Skin Care Member</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-6">
              <button type="button" class="pd-soft-btn" @click="router.push('/diagnostics')">
                <span class="material-symbols-outlined">clinical_notes</span>
                <span>Mis citas</span>
              </button>

              <button type="button" class="pd-soft-btn" @click="router.push('/quiz')">
                <span class="material-symbols-outlined">dermatology</span>
                <span>Mi rutina</span>
              </button>

              <button type="button" class="pd-soft-btn" @click="router.push('/tienda')">
                <span class="material-symbols-outlined">inventory_2</span>
                <span>Pedidos</span>
              </button>

              <button type="button" class="pd-soft-btn" @click="toggleEditMode">
                <span class="material-symbols-outlined">edit</span>
                <span>{{ editMode ? "Cerrar edición" : "Editar" }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- RESUMEN -->
      <section class="mt-10">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <article class="pd-card pd-border rounded-2xl p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Pedidos</p>
                <h3 class="text-2xl font-extrabold mt-2">{{ history.orders.value.length }}</h3>
              </div>
              <div class="pd-stat-icon">
                <span class="material-symbols-outlined">package_2</span>
              </div>
            </div>
          </article>

          <article class="pd-card pd-border rounded-2xl p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Citas</p>
                <h3 class="text-2xl font-extrabold mt-2">{{ history.appointments.value.length }}</h3>
              </div>
              <div class="pd-stat-icon">
                <span class="material-symbols-outlined">calendar_month</span>
              </div>
            </div>
          </article>

          <article class="pd-card pd-border rounded-2xl p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Rutinas</p>
                <h3 class="text-2xl font-extrabold mt-2">{{ history.routines.value.length || history.quizHistory.value.length }}</h3>
              </div>
              <div class="pd-stat-icon">
                <span class="material-symbols-outlined">spa</span>
              </div>
            </div>
          </article>

          <article class="pd-card pd-border rounded-2xl p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Diagnósticos</p>
                <h3 class="text-2xl font-extrabold mt-2">{{ history.diagnostics.value.length }}</h3>
              </div>
              <div class="pd-stat-icon">
                <span class="material-symbols-outlined">clinical_notes</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- TABS -->
      <div class="mt-8 flex gap-2 flex-wrap">
        <button
          v-for="tab in [{key:'cuenta', label:'Mi cuenta'}, {key:'historial', label:'Historial'}, {key:'settings', label:'Configuración'}]"
          :key="tab.key"
          type="button"
          class="pd-tab-btn"
          :class="{ 'pd-tab-btn--active': activeTab === tab.key }"
          @click="goTab(tab.key)"
        >{{ tab.label }}</button>
      </div>

      <!-- CONTENIDO: Mi cuenta -->
      <section v-if="activeTab === 'cuenta'" class="mt-6 grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <!-- COLUMNA IZQUIERDA -->
        <div class="space-y-6">
          <!-- DATOS PERSONALES -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Perfil</p>
                <h3 class="font-bold text-xl mt-1">Mis datos</h3>
              </div>

              <button
                type="button"
                class="pd-outline-btn"
                @click="toggleEditMode"
              >
                {{ editMode ? "Cancelar edición" : "Editar información" }}
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="pd-field">
                <span>Nombre completo</span>
                <input
                  v-model="editableUser.name"
                  type="text"
                  :disabled="!editMode"
                  placeholder="Tu nombre"
                />
              </label>

              <label class="pd-field">
                <span>Correo electrónico</span>
                <input
                  v-model="editableUser.email"
                  type="email"
                  :disabled="!editMode"
                  placeholder="correo@ejemplo.com"
                />
              </label>

              <label class="pd-field">
                <span>Teléfono</span>
                <input
                  v-model="editableUser.phone"
                  type="text"
                  :disabled="!editMode"
                  placeholder="(809) 000-0000"
                />
              </label>

              <label class="pd-field">
                <span>Fecha de nacimiento</span>
                <input
                  v-model="editableUser.birth_date"
                  type="date"
                  :disabled="!editMode"
                  :max="maxBirthDate"
                />
              </label>
            </div>

            <div class="mt-4">
              <label class="pd-field">
                <span>Dirección</span>
                <input
                  v-model="editableUser.address"
                  type="text"
                  :disabled="!editMode"
                  placeholder="Dirección"
                />
              </label>
            </div>

            <div v-if="editMode" class="flex flex-wrap gap-3 mt-5">
              <label class="pd-secondary-btn cursor-pointer inline-flex items-center justify-center">
                Cambiar foto
                <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
              </label>

              <button type="button" class="pd-primary-btn" @click="saveProfile">
                Guardar cambios
              </button>

              <button type="button" class="pd-secondary-btn" @click="resetEditableUser">
                Restablecer
              </button>
            </div>
          </article>

          <!-- PEDIDOS -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4 mb-5">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Compras</p>
                <h3 class="font-bold text-xl mt-1">Pedidos recientes</h3>
              </div>

              <button type="button" class="pd-outline-btn" @click="router.push('/tienda')">
                Ir a tienda
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="order in history.orders.value.slice(0, 5)"
                :key="order.id"
                class="pd-list-row"
              >
                <div>
                  <h4 class="font-semibold">Pedido {{ order.code || `#${order.id}` }}</h4>
                  <p class="text-sm pd-muted">{{ fmtDate(order.date) }}</p>
                </div>

                <div class="text-right">
                  <p class="font-bold pd-price">{{ formatPrice(order.total) }}</p>
                  <p class="text-sm text-emerald-600 font-semibold">Confirmado</p>
                </div>
              </div>

              <div v-if="history.orders.value.length === 0" class="pd-empty-box">
                Aún no tienes pedidos. <button class="pd-link underline ml-1" @click="router.push('/tienda')">Ir a tienda</button>
              </div>
            </div>
          </article>

          <!-- CITAS -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4 mb-5">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Dermatología</p>
                <h3 class="font-bold text-xl mt-1">Mis citas</h3>
              </div>

              <button type="button" class="pd-outline-btn" @click="router.push('/diagnostics')">
                Agendar
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="apt in history.appointments.value.slice(0, 5)"
                :key="apt.id"
                class="pd-list-row"
              >
                <div>
                  <h4 class="font-semibold">{{ apt.service || "Consulta dermatológica" }}</h4>
                  <p class="text-sm pd-muted">{{ apt.dateTime || fmtDate(apt.date) }}</p>
                </div>

                <div class="text-right">
                  <p class="font-semibold">{{ apt.mode || "Presencial" }}</p>
                  <p class="text-sm pd-link font-semibold">{{ apt.doctor || "Especialista" }}</p>
                </div>
              </div>

              <div v-if="history.appointments.value.length === 0" class="pd-empty-box">
                No hay citas programadas por ahora.
              </div>
            </div>
          </article>
        </div>

        <!-- COLUMNA DERECHA -->
        <div class="space-y-6">
          <!-- RUTINA -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Skin profile</p>
            <h3 class="font-bold text-xl mt-1">Mi rutina</h3>

            <div v-if="routineSource && latestRoutineSteps.length" class="mt-5 space-y-3">
              <div
                v-for="step in latestRoutineSteps"
                :key="step.id || step.title"
                class="pd-routine-item"
              >
                <div class="pd-routine-icon">
                  <span class="material-symbols-outlined">{{ step.icon || "spa" }}</span>
                </div>

                <div class="min-w-0">
                  <h4 class="font-semibold">{{ step.title }}</h4>
                  <p class="text-sm pd-muted">{{ step.desc }}</p>
                </div>
              </div>
            </div>

            <div v-else class="pd-empty-box mt-5">
              Aún no has realizado tu rutina personalizada.
            </div>

            <button
              type="button"
              class="mt-5 w-full py-3 rounded-xl pd-primary text-white font-bold shadow-lg"
              @click="router.push(routineSource ? '/routine' : '/quiz')"
            >
              {{ routineSource ? "Ver o actualizar rutina" : "Hacer rutina" }}
            </button>
          </article>

          <!-- DIAGNOSTICO -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Diagnostics</p>
            <h3 class="font-bold text-xl mt-1">Mi diagnóstico</h3>

            <div v-if="latestDiagnostic" class="mt-5 pd-list-row">
              <div>
                <h4 class="font-semibold">
                  {{ latestDiagnostic.title || "Diagnóstico realizado" }}
                </h4>
                <p class="text-sm pd-muted">
                  {{ latestDiagnostic.summary || fmtDate(latestDiagnostic.date) }}
                </p>
              </div>
            </div>

            <div v-else class="pd-empty-box mt-5">
              Aún no has realizado un diagnóstico.
            </div>

            <button
              type="button"
              class="mt-5 w-full py-3 rounded-xl pd-primary text-white font-bold shadow-lg"
              @click="router.push('/diagnostics')"
            >
              {{ latestDiagnostic ? "Ver o actualizar diagnóstico" : "Hacer diagnóstico" }}
            </button>
          </article>

          

          <!-- ATAJOS -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Accesos rápidos</p>
            <h3 class="font-bold text-xl mt-1">Tu panel</h3>

            <div class="grid grid-cols-1 gap-3 mt-5">
              <button type="button" class="pd-shortcut" @click="router.push('/carrito')">
                <span class="material-symbols-outlined">shopping_cart</span>
                <span>Ir al carrito</span>
              </button>

              <button type="button" class="pd-shortcut" @click="router.push('/diagnostics')">
                <span class="material-symbols-outlined">stethoscope</span>
                <span>Consultar especialista</span>
              </button>

              <button type="button" class="pd-shortcut" @click="doLogout">
                <span class="material-symbols-outlined">logout</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- CONTENIDO: Historial -->
      <section v-if="activeTab === 'historial'" class="mt-6 space-y-6">
        <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
          <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Análisis de piel</p>
          <h3 class="font-bold text-xl mt-1">Historial de quizzes</h3>
          <div class="mt-4 space-y-3">
            <div v-for="q in history.quizHistory.value" :key="q.id" class="pd-list-row">
              <div>
                <h4 class="font-semibold">Análisis de piel</h4>
                <p class="text-sm pd-muted">{{ fmtDate(q.date) }} · {{ q.skinType || 'Tipo desconocido' }}</p>
              </div>
              <button class="pd-outline-btn text-sm" @click="router.push('/routine')">Ver rutina</button>
            </div>
            <div v-if="!history.quizHistory.value.length" class="pd-empty-box">
              No has realizado ningún análisis aún. <button class="pd-link underline ml-1" @click="router.push('/quiz')">Empezar quiz</button>
            </div>
          </div>
        </article>

        <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
          <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Diagnósticos</p>
          <h3 class="font-bold text-xl mt-1">Historial de diagnósticos</h3>
          <div class="mt-4 space-y-3">
            <div v-for="d in history.diagnostics.value" :key="d.id" class="pd-list-row">
              <div>
                <h4 class="font-semibold">{{ d.title || 'Diagnóstico' }}</h4>
                <p class="text-sm pd-muted">{{ fmtDate(d.date) }}</p>
              </div>
              <span class="text-sm pd-muted capitalize">{{ d.status || 'guardado' }}</span>
            </div>
            <div v-if="!history.diagnostics.value.length" class="pd-empty-box">
              No hay diagnósticos guardados.
            </div>
          </div>
        </article>

        <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
          <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Citas</p>
          <h3 class="font-bold text-xl mt-1">Historial de citas</h3>
          <div class="mt-4 space-y-3">
            <div v-for="apt in history.appointments.value" :key="apt.id" class="pd-list-row">
              <div>
                <h4 class="font-semibold">{{ apt.service || 'Consulta dermatológica' }}</h4>
                <p class="text-sm pd-muted">{{ apt.dateTime || fmtDate(apt.date) }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold">{{ apt.mode || 'Presencial' }}</p>
                <p class="text-sm pd-link">{{ apt.doctor || 'Especialista' }}</p>
              </div>
            </div>
            <div v-if="!history.appointments.value.length" class="pd-empty-box">
              No hay citas en el historial.
            </div>
          </div>
        </article>

        <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
          <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Compras</p>
          <h3 class="font-bold text-xl mt-1">Historial de pedidos</h3>
          <div class="mt-4 space-y-3">
            <div v-for="order in history.orders.value" :key="order.id" class="pd-list-row">
              <div>
                <h4 class="font-semibold">Pedido {{ order.code || `#${order.id}` }}</h4>
                <p class="text-sm pd-muted">{{ fmtDate(order.date) }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold pd-price">{{ formatPrice(order.total) }}</p>
                <p class="text-sm text-emerald-600 font-semibold capitalize">{{ order.status || 'confirmado' }}</p>
              </div>
            </div>
            <div v-if="!history.orders.value.length" class="pd-empty-box">
              No hay pedidos aún. <button class="pd-link underline ml-1" @click="router.push('/tienda')">Ir a tienda</button>
            </div>
          </div>
        </article>
      </section>

      <!-- CONTENIDO: Configuración -->
      <section v-if="activeTab === 'settings'" class="mt-6 max-w-lg">
        <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
          <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Preferencias</p>
          <h3 class="font-bold text-xl mt-1 mb-6">Configuración</h3>

          <div class="space-y-5">
            <!-- Dark mode -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined pd-icon">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
                <div>
                  <p class="font-semibold">Modo oscuro</p>
                  <p class="text-sm pd-muted">Cambia la apariencia de la app</p>
                </div>
              </div>
              <button type="button" class="pd-toggle" :class="{ 'pd-toggle--on': isDark }" @click="settings.toggleDark()">
                <span class="pd-toggle-thumb"></span>
              </button>
            </div>

            <hr class="border-[var(--border)]" />

            <!-- Idioma -->
            <div class="pd-field">
              <span>Idioma de la aplicación</span>
              <select :value="language" @change="settings.setLanguage($event.target.value)">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>

            <!-- País -->
            <div class="pd-field">
              <span>País</span>
              <select :value="country" @change="settings.setCountry($event.target.value)">
                <option v-for="c in settings.countryList" :key="c.code" :value="c.code">{{ c.name }}</option>
              </select>
            </div>

            <!-- Moneda -->
            <div class="pd-field">
              <span>Moneda preferida</span>
              <select :value="currency" @change="settings.setCurrency($event.target.value)">
                <option v-for="m in settings.currencyList" :key="m.code" :value="m.code">{{ m.symbol }} — {{ m.name }}</option>
              </select>
            </div>

            <hr class="border-[var(--border)]" />

            <!-- Cerrar sesión -->
            <button type="button" class="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition" @click="doLogout">
              Cerrar sesión
            </button>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useHistoryStore } from "../stores/useHistoryStore";
import userService from "../services/userService.js";
import { priceIn } from "../utils/currency";
import { getProductsByQuizResult } from "../data/productCatalog.js";

const router = useRouter();
const route  = useRoute();
const auth = useAuthStore();
const settings = useSettingsStore();
const history = useHistoryStore();

const { isDark, language, country, currency } = settings;

// Tab activo: 'cuenta' | 'settings' | 'historial'
const activeTab = computed(() => route.query.tab || 'cuenta');
function goTab(tab) { router.replace({ query: { tab } }); }

const currentUser = auth.user;
const editMode = ref(false);

const maxBirthDate = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 13)
  return d.toISOString().split('T')[0]
})

function _buildEditable(u) {
  const src = u || {}
  return {
    name: `${src.first_name || ''} ${src.last_name || ''}`.trim() || src.name || '',
    email: src.email || '',
    phone: src.phone || '',
    birth_date: src.birth_date || '',
    address: src.address || '',
    avatar: src.avatar || '',
  }
}

const editableUser = ref(_buildEditable(currentUser.value));

const currentInitial = computed(() => {
  return (auth.displayName.value || "U").charAt(0).toUpperCase();
});

const latestRoutine = computed(() => history.routines.value[0] || null);
const latestQuiz = computed(() => history.quizHistory.value[0] || null);
const latestDiagnostic = computed(() => history.diagnostics.value[0] || null);
const routineSource = computed(() => latestRoutine.value || latestQuiz.value);

const latestRoutineSteps = computed(() => {
  const routine = routineSource.value;
  if (!routine) return [];
  
  // Combinar todas las fuentes posibles de pasos
  let morning = routine.morningSteps || routine.morningRoutine || [];
  let night = routine.nightSteps || routine.nightRoutine || [];
  let generic = routine.routineSteps || routine.steps || [];
  
  // Respaldo: Si es un resultado de quiz sin pasos explícitos, generarlos
  if (!morning.length && !night.length && !generic.length && (routine.skinType || routine.skin_type)) {
    try {
      const quizPayload = {
        skinType: routine.skinType || routine.skin_type || 'normal',
        concerns: routine.concerns || [],
        sensitivity: routine.sensitivity || 'mild',
      };
      morning = getProductsByQuizResult(quizPayload, 'morning');
      night = getProductsByQuizResult(quizPayload, 'night');
    } catch (e) {
      console.warn('[Perfil] Fallback step generation failed:', e);
    }
  }

  const allSteps = [...morning, ...night, ...generic];
  
  if (allSteps.length) {
    const uniqueSteps = [];
    const seenTitles = new Set();
    
    for (const p of allSteps) {
      const isString = typeof p === 'string';
      const title = isString ? p : (p.name || p.title || p.product_name || '');
      
      if (title && !seenTitles.has(title)) {
        seenTitles.add(title);
        uniqueSteps.push({
          id: uniqueSteps.length,
          title,
          desc: isString ? '' : (p.category || p.type || p.note || p.desc || ''),
          icon: isString ? 'wb_sunny' : 'spa',
        });
      }
      if (uniqueSteps.length >= 5) break;
    }
    
    return uniqueSteps;
  }
  return [];
});

async function loadAddressFromDatabase() {
  try {
    // Try to load from localStorage first (fastest)
    const addresses = userService.getAddresses()
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses[0]
      editableUser.value.address = defaultAddress.address_line_1 || defaultAddress.address || ''
      console.log('[Perfil] Address loaded from localStorage:', editableUser.value.address)
      return
    }
  } catch (error) {
    console.warn('[Perfil] localStorage address load failed:', error)
  }

  // Fallback: load from Supabase
  try {
    const userId = auth.user?.value?.id
    if (!userId) {
      console.warn('[Perfil] No user ID available')
      return
    }
    
    // Query addresses table for user's addresses
    const supabase = (await import('../lib/supabaseClient.js')).supabase
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .limit(1)
    
    if (error) {
      console.warn('[Perfil] Supabase address query error:', error.message)
      return
    }
    
    if (data && data.length > 0) {
      const address = data[0]
      editableUser.value.address = address.address_line_1 || address.address || ''
      console.log('[Perfil] Address loaded from Supabase:', editableUser.value.address)
    } else {
      console.log('[Perfil] No address found in Supabase for user:', userId)
    }
  } catch (error) {
    console.warn('[Perfil] Supabase address load exception:', error)
  }
}

function toggleEditMode() {
  editableUser.value = _buildEditable(currentUser.value)
  loadAddressFromDatabase()
  editMode.value = !editMode.value;
}

function resetEditableUser() {
  editableUser.value = _buildEditable(currentUser.value)
}

function handleAvatarUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { editableUser.value.avatar = reader.result; };
  reader.readAsDataURL(file);
}

async function saveProfile() {
  const nameParts = (editableUser.value.name || '').trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const lastName  = nameParts.slice(1).join(' ') || ''
  
  // Update user profile (name, phone, birth_date)
  await auth.updateProfile({
    firstName,
    lastName,
    phone: editableUser.value.phone || null,
    birth_date: editableUser.value.birth_date || null,
  })

  // Save address to Supabase if user is authenticated
  try {
    const userId = auth.user?.value?.id
    if (userId && editableUser.value.address) {
      await userService.saveAddress({
        address: editableUser.value.address,
        city: editableUser.value.city || null,
        label: 'Mi dirección',
        address_line_1: editableUser.value.address,
        is_default: true,
      }, userId)
    }
  } catch (error) {
    console.warn('[Perfil] Address save failed:', error)
  }

  editMode.value = false;
}

function doLogout() {
  auth.logout();
  router.push("/login");
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return iso; }
}

function formatPrice(n) {
  return priceIn(Number(n) || 0, 'DOP', currency.value);
}
</script>

<style scoped>
.pd-root {
  --bg: #f8fafc;
  --text: #0f172a;
  --muted: #64748b;
  --surface: rgba(255, 255, 255, 0.92);
  --card: #ffffff;
  --soft: #f1f5f9;
  --border: #e2e8f0;
  --brand: #004e92;
  --link: #5dbcd2;
  --accent: #76b82a;
  --price: #004e92;
  --cta-bg: #ffffff;
  --cta-text: #004e92;
  --primary: #004e92;
}

.pd-dark.pd-root {
  --bg: #0b1220;
  --text: #e5e7eb;
  --muted: #9aa7ba;
  --surface: rgba(10, 18, 32, 0.92);
  --card: #0f1a2e;
  --soft: #0a162a;
  --border: #1c2b44;
  --brand: #8cc7ff;
  --link: #66d6ff;
  --accent: #9be15d;
  --price: #cfe9ff;
  --cta-bg: #0f1a2e;
  --cta-text: #cfe9ff;
  --primary: #183a6b;
}

.pd-root {
  background: var(--bg);
  color: var(--text);
}

.pd-muted { color: var(--muted); }
.pd-surface { background: var(--surface); backdrop-filter: blur(10px); }
.pd-card { background: var(--card); }
.pd-border { border: 1px solid var(--border); }
.pd-brand { color: var(--brand); }
.pd-accent { color: var(--accent); }
.pd-icon { color: var(--brand); }
.pd-link { color: var(--link); }
.pd-price { color: var(--price); }
.pd-primary { background: var(--primary); }

.pd-hero { background: linear-gradient(135deg, var(--brand), var(--link)); }
.pd-dark .pd-hero { background: linear-gradient(135deg, #102a4d, #0f3a57); }

.pd-cta { background: var(--cta-bg); color: var(--cta-text); }
.pd-cta:hover { filter: brightness(0.98); }

.pd-ghost-white {
  border: 1px solid rgba(255,255,255,0.42);
  color: #fff;
  background: rgba(255,255,255,0.08);
}
.pd-ghost-white:hover { background: rgba(255,255,255,0.14); }

.pd-profile-avatar-wrap { flex-shrink: 0; }

.pd-profile-avatar {
  width: 92px;
  height: 92px;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.12);
}

.pd-profile-avatar-fallback {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--brand), var(--link));
  color: white;
  font-size: 28px;
  font-weight: 900;
}

.pd-chip-inline {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: #eef6ff;
  color: #0f4c81;
  font-size: 12px;
  font-weight: 700;
}

.pd-dark .pd-chip-inline {
  background: rgba(102, 214, 255, 0.14);
  color: #b7ebff;
}

.pd-soft-btn {
  border: 1px solid var(--border);
  background: var(--soft);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 700;
  color: var(--text);
}

.pd-stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--link) 10%, white);
  color: var(--brand);
}

.pd-dark .pd-stat-icon {
  background: rgba(102, 214, 255, 0.12);
  color: #9adbff;
}

.pd-outline-btn {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
}

.pd-primary-btn {
  border: none;
  background: var(--primary);
  color: #fff;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 700;
}

.pd-secondary-btn {
  border: 1px solid var(--border);
  background: var(--soft);
  color: var(--text);
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 700;
}

.pd-field {
  display: grid;
  gap: 8px;
}

.pd-field span {
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
}

.pd-field input,
.pd-field select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--soft);
  color: var(--text);
  padding: 14px 16px;
  outline: none;
  font-size: 14px;
}

.pd-field input:disabled { opacity: 0.9; cursor: default; }

.pd-list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--soft) 85%, white);
}

.pd-dark .pd-list-row {
  background: color-mix(in srgb, var(--soft) 80%, transparent);
}

.pd-empty-box {
  padding: 24px;
  border: 1px dashed var(--border);
  border-radius: 18px;
  color: var(--muted);
  font-weight: 700;
  text-align: center;
}

.pd-routine-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--soft) 85%, white);
  border: 1px solid var(--border);
}

.pd-routine-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--link) 12%, white);
  color: var(--brand);
  flex-shrink: 0;
}

.pd-shortcut {
  width: 100%;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--soft) 88%, white);
  color: var(--text);
  border-radius: 16px;
  padding: 15px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
}

/* Toggle switch */
.pd-toggle {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--border);
  border: none;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.pd-toggle--on { background: var(--primary); }

.pd-toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: white;
  transition: transform 0.2s;
  pointer-events: none;
}

.pd-toggle--on .pd-toggle-thumb { transform: translateX(22px); }

/* Tabs */
.pd-tab-btn {
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
}
.pd-tab-btn:hover { background: var(--soft); color: var(--text); }
.pd-tab-btn--active {
  background: var(--brand);
  color: white;
  border-color: var(--brand);
}
.pd-dark .pd-tab-btn--active { background: #183a6b; border-color: var(--link); }

@media (max-width: 900px) {
  .pd-list-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 720px) {
  .pd-profile-avatar {
    width: 78px;
    height: 78px;
  }
}
</style>
