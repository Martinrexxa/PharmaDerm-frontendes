import { createRouter, createWebHistory } from "vue-router";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

// Auth
import Login from "../views/login.vue";
import Registro from "../views/Registro.vue";
import Olvide from "../views/olvide.vue";
import ResetPassword from "../views/ResetPassword.vue";

// Main
import Inicio from "../views/Inicio.vue";

// Extras
import Quiz from "../views/Quiz.vue";
import Coleccion from "../views/Coleccion.vue";
import Tienda from "../views/Tienda.vue";
import ProductoDetalle from "../views/ProductoDetalle.vue";
import Perfil from "../views/Perfil.vue";
import Carrito from "../views/Carrito.vue";
import Diagnostics from "../views/Diagnostics.vue";
import AppointmentConfirmation from "../views/AppointmentConfirmation.vue";
import AppointmentBooking from "../views/AppointmentBooking.vue";
import Checkout from "../views/Checkout.vue";
import ExpertAdvice from "../views/ExpertAdvice.vue";
import OurStory from "../views/OurStory.vue";
import Routine from "../views/Routine.vue";
import MisPedidos from "../views/MisPedidos.vue";
import MisCitas from "../views/MisCitas.vue";
import FAQ from "../views/FAQ.vue";
import Contact from "../views/Contact.vue";
import PrivacyPolicy from "../views/PrivacyPolicy.vue";
import Terms from "../views/Terms.vue";
import ShippingReturns from "../views/ShippingReturns.vue";
import Accessibility from "../views/Accessibility.vue";

const routes = [
  { path: "/", redirect: "/login" },

  // públicas
  { path: "/login", name: "Login", component: Login, meta: { public: true } },
  { path: "/registro", name: "Registro", component: Registro, meta: { public: true } },
  { path: "/olvide", name: "Olvide", component: Olvide, meta: { public: true } },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword, meta: { public: true } },

  // protegidas
  { path: "/inicio", name: "Inicio", component: Inicio },
  { path: "/quiz", name: "Quiz", component: Quiz },
  { path: "/coleccion", name: "Coleccion", component: Coleccion },
  { path: "/diagnostics", name: "Diagnostics", component: Diagnostics },
  {
    path: "/appointment-confirmation",
    name: "AppointmentConfirmation",
    component: AppointmentConfirmation,
    meta: { public: true },
  },
  { path: "/citas/agendar", name: "AppointmentBooking", component: AppointmentBooking },
  { path: "/tienda", name: "Tienda", component: Tienda },
  {
    path: "/producto/:slug",
    name: "ProductoDetalle",
    component: ProductoDetalle,
  },
  { path: "/perfil", name: "Perfil", component: Perfil },
  { path: "/pedidos", name: "MisPedidos", component: MisPedidos },
  { path: "/citas", name: "MisCitas", component: MisCitas },
  { path: "/carrito", name: "Carrito", component: Carrito },
  { path: "/checkout", name: "Checkout", component: Checkout },
  { path: "/expert-advice", name: "ExpertAdvice", component: ExpertAdvice },
  { path: "/our-story", name: "OurStory", component: OurStory },
  { path: "/routine", name: "Routine", component: Routine },

  // Informational pages
  { path: "/faq", name: "FAQ", component: FAQ },
  { path: "/contact", name: "Contact", component: Contact },
  { path: "/privacy-policy", name: "PrivacyPolicy", component: PrivacyPolicy },
  { path: "/terms", name: "Terms", component: Terms },
  { path: "/shipping-returns", name: "ShippingReturns", component: ShippingReturns },
  { path: "/accessibility", name: "Accessibility", component: Accessibility },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, left: 0 };
  },
});

async function getSupabaseSessionWithTimeout(ms = 350) {
  if (!isSupabaseConfigured || !supabase) return { session: null, timedOut: false };

  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise((resolve) => setTimeout(() => resolve({ data: { session: null }, timeout: true }), ms)),
    ]);

    return {
      session: result?.data?.session || null,
      timedOut: result?.timeout === true,
    };
  } catch {
    return { session: null, timedOut: false };
  }
}

router.beforeEach(async (to, from, next) => {
  let isAuthenticated = false;
  let localSession = null;

  try {
    localSession = JSON.parse(localStorage.getItem("pharmaderm_session") || "null");
  } catch {
    localSession = null;
  }

  if (localSession?.isLoggedIn || localSession?.token) {
    isAuthenticated = true;
  }

  if (!isAuthenticated && isSupabaseConfigured) {
    const { session, timedOut } = await getSupabaseSessionWithTimeout();
    isAuthenticated = !!session?.access_token;
    if (timedOut && !to.meta.public && from.path !== "/login") {
      isAuthenticated = true;
    }
  } else if (!isAuthenticated) {
    isAuthenticated = !!localSession?.isLoggedIn;
  }

  if (!to.meta.public && !isAuthenticated) {
    return next("/login");
  }

  if ((to.path === "/login" || to.path === "/registro") && isAuthenticated) {
    return next("/inicio");
  }

  next();
});

export default router;

