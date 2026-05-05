<template>
  <div
    class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden"
  >
    <div class="relative flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div class="w-full max-w-sm mx-auto flex flex-col items-center">
        <h1 class="text-brand-dark-blue dark:text-white tracking-tight text-3xl font-bold text-center pb-4 pt-2">
          Restablecer contraseña
        </h1>

        <p class="text-neutral-text dark:text-gray-400 text-sm text-center mb-6">
          Crea una nueva contraseña para tu cuenta.
        </p>

        <div
          v-if="initializing"
          class="w-full mb-4 px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm"
        >
          Validando enlace de recuperación…
        </div>

        <div v-if="errorMsg" class="w-full mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {{ errorMsg }}
        </div>

        <div class="w-full flex flex-col gap-4">
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue dark:text-gray-300 text-sm font-medium pb-2">
              Nueva contraseña
            </p>
            <input
              v-model="password"
              class="form-input flex w-full rounded-lg text-brand-dark-blue dark:text-white
                     dark:bg-background-dark/50 focus:ring-2 focus:ring-brand-light-blue/50
                     border border-gray-300 dark:border-gray-600 bg-brand-soft-grey/50
                     h-14 p-4 text-base"
              placeholder="Introduce tu nueva contraseña"
              :type="showPassword ? 'text' : 'password'"
              :disabled="initializing"
            />
          </label>

          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue dark:text-gray-300 text-sm font-medium pb-2">
              Confirmar contraseña
            </p>
            <input
              v-model="confirmPassword"
              class="form-input flex w-full rounded-lg text-brand-dark-blue dark:text-white
                     dark:bg-background-dark/50 focus:ring-2 focus:ring-brand-light-blue/50
                     border border-gray-300 dark:border-gray-600 bg-brand-soft-grey/50
                     h-14 p-4 text-base"
              placeholder="Repite tu nueva contraseña"
              :type="showPassword ? 'text' : 'password'"
              :disabled="initializing"
            />
          </label>

          <button
            type="button"
            @click="reset"
            :disabled="loading || initializing"
            class="w-full h-14 rounded-lg bg-brand-light-blue text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ loading ? "Actualizando..." : "Actualizar contraseña" }}
          </button>

          <button
            type="button"
            @click="go('/login')"
            :disabled="loading"
            class="w-full h-14 rounded-lg border border-brand-dark-blue text-brand-dark-blue font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Volver a iniciar sesión
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import { DATA_MODE, API_BASE_URL, supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

const route = useRoute();
const router = useRouter();

const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const loading = ref(false);
const initializing = ref(false);
const errorMsg = ref("");
const recoveryReady = ref(false);
let recoveryInitPromise = null;

const go = (path) => router.push(path);

async function ensureSupabaseRecoverySession() {
  if (!isSupabaseConfigured) return false;

  if (recoveryInitPromise) return recoveryInitPromise;
  recoveryInitPromise = (async () => {
  // 1) PKCE flow: ?code=...
  const code = String(route.query.code || "").trim();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  }

  // 2) Implicit flow: #access_token=...&refresh_token=...
  const hash = String(window.location.hash || "").replace(/^#/, "");
  if (hash) {
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) throw error;
      // Limpia el hash para evitar reintentos
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  const { data } = await supabase.auth.getSession();
  return !!data?.session;
  })().finally(() => {
    recoveryInitPromise = null;
  });

  return recoveryInitPromise;
}

onMounted(async () => {
  errorMsg.value = "";

  // En modo backend, el token viene como ?token=
  if (DATA_MODE === "backend") return;

  if (!isSupabaseConfigured) {
    errorMsg.value = "Esta pantalla requiere modo 'supabase' o 'backend'.";
    return;
  }

  initializing.value = true;
  try {
    const ok = await ensureSupabaseRecoverySession();
    if (!ok) {
      errorMsg.value = "Enlace inválido o expirado. Vuelve a solicitar la recuperación.";
      recoveryReady.value = false;
    } else {
      recoveryReady.value = true;
    }
  } catch (e) {
    errorMsg.value = e?.message || "No se pudo validar el enlace de recuperación.";
    recoveryReady.value = false;
  } finally {
    initializing.value = false;
  }
});

async function reset() {
  errorMsg.value = "";

  // Backend mode
  if (DATA_MODE === "backend") {
    const token = String(route.query.token || "").trim();
    if (!token) {
      errorMsg.value = "Falta el token de recuperación.";
      return;
    }

    if (!password.value || password.value.length < 6) {
      errorMsg.value = "La contraseña debe tener al menos 6 caracteres.";
      return;
    }
    if (password.value !== confirmPassword.value) {
      errorMsg.value = "Las contraseñas no coinciden.";
      return;
    }

    loading.value = true;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, Contrasena: password.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "No se pudo actualizar la contraseña");

      await Swal.fire({
        icon: "success",
        title: "Contraseña actualizada",
        text: "Ya puedes iniciar sesión con tu nueva contraseña.",
        confirmButtonColor: "#5DBCD2",
      });
      go("/login");
    } catch (e) {
      errorMsg.value = e?.message || "Error al actualizar la contraseña.";
    } finally {
      loading.value = false;
    }
    return;
  }

  // Supabase mode
  if (!isSupabaseConfigured) {
    errorMsg.value = "Esta pantalla requiere modo 'supabase' o 'backend'.";
    return;
  }

  if (!password.value || password.value.length < 6) {
    errorMsg.value = "La contraseña debe tener al menos 6 caracteres.";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = "Las contraseñas no coinciden.";
    return;
  }

  loading.value = true;
  try {
    if (!recoveryReady.value) {
      const ok = await ensureSupabaseRecoverySession();
      if (!ok) throw new Error("Enlace inválido o expirado.");
      recoveryReady.value = true;
    }

    const { error } = await supabase.auth.updateUser({ password: password.value });
    if (error) throw error;

    // Por seguridad, cierra sesión y fuerza a iniciar con la nueva contraseña
    await supabase.auth.signOut();

    await Swal.fire({
      icon: "success",
      title: "Contraseña actualizada",
      text: "Ya puedes iniciar sesión con tu nueva contraseña.",
      confirmButtonColor: "#5DBCD2",
    });
    go("/login");
  } catch (e) {
    errorMsg.value = e?.message || "Error al actualizar la contraseña.";
  } finally {
    loading.value = false;
  }
}
</script>
