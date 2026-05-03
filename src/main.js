import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import { useAuthStore } from "./stores/useAuthStore.js";

const app = createApp(App);

app.directive('reveal', {
  mounted(el, binding) {
    const delay = binding.value?.delay ?? 0;
    if (delay) el.style.transitionDelay = delay + 's';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: binding.value?.threshold ?? 0.1 }
    );
    el.classList.add('pd-reveal');
    observer.observe(el);
  },
});

app.use(router);

const auth = useAuthStore();
auth.initAuth().finally(() => {
  app.mount("#app");
});
