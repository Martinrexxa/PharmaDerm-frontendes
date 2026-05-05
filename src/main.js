import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import { useAuthStore } from "./stores/useAuthStore.js";
import { useSettingsStore } from "./stores/useSettingsStore.js";
import "./style.css";

const app = createApp(App);

// Initialize settings early so dark mode / language apply globally on first paint.
useSettingsStore();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

app.directive('reveal', {
  mounted(el, binding) {
    const delay = binding.value?.delay ?? 0;
    if (delay) el.style.transitionDelay = delay + 's';
    el.classList.add('pd-reveal');
    revealObserver.observe(el);
  },
  unmounted(el) {
    revealObserver.unobserve(el);
  }
});

app.use(router);

const isResetPasswordRoute = window.location.pathname === "/reset-password";
if (isResetPasswordRoute) {
  // Evita competir por el lock interno de Supabase Auth mientras se procesa el enlace de recuperación.
  app.mount("#app");
} else {
  const auth = useAuthStore();
  auth.initAuth().finally(() => {
    app.mount("#app");
  });
}
