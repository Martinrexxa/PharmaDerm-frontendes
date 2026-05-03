import { createRouter, createWebHistory } from "vue-router";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

// Auth
import Login from "../views/login.vue";
import Registro from "../views/Registro.vue";
import Olvide from "../views/olvide.vue";

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
import Checkout from "../views/Checkout.vue";
import ExpertAdvice from "../views/ExpertAdvice.vue";
import OurStory from "../views/OurStory.vue";
import Routine from "../views/Routine.vue";

const routes = [
  { path: "/", redirect: "/login" },

  // públicas
  { path: "/login", name: "Login", component: Login, meta: { public: true } },
  { path: "/registro", name: "Registro", component: Registro, meta: { public: true } },
  { path: "/olvide", name: "Olvide", component: Olvide, meta: { public: true } },

  // protegidas
  { path: "/inicio", name: "Inicio", component: Inicio },
  { path: "/quiz", name: "Quiz", component: Quiz },
  { path: "/coleccion", name: "Coleccion", component: Coleccion },
  { path: "/diagnostics", name: "Diagnostics", component: Diagnostics },
  {
    path: "/appointment-confirmation",
    name: "AppointmentConfirmation",
    component: AppointmentConfirmation,
  },
  { path: "/tienda", name: "Tienda", component: Tienda },
  {
    path: "/producto/:slug",
    name: "ProductoDetalle",
    component: ProductoDetalle,
  },
  { path: "/perfil", name: "Perfil", component: Perfil },
  { path: "/carrito", name: "Carrito", component: Carrito },
  { path: "/checkout", name: "Checkout", component: Checkout },
  { path: "/expert-advice", name: "ExpertAdvice", component: ExpertAdvice },
  { path: "/our-story", name: "OurStory", component: OurStory },
  { path: "/routine", name: "Routine", component: Routine },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  let isAuthenticated = false;

  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      isAuthenticated = !!session?.access_token;
    } catch {
      isAuthenticated = false;
    }
  } else {
    const s = JSON.parse(localStorage.getItem("pharmaderm_session") || "null");
    isAuthenticated = !!s?.isLoggedIn;
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