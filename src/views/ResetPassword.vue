<template>
  <div
    class="relative flex min-h-screen w-full flex-col bg-background-light group/design-root overflow-x-hidden"
  >
    <div class="relative flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div class="w-full max-w-sm mx-auto flex flex-col items-center">
        <h1 class="text-brand-dark-blue tracking-tight text-3xl font-bold text-center pb-4 pt-2">
          Reset password
        </h1>

        <p class="text-neutral-text text-sm text-center mb-6">
          Create a new password for your account.
        </p>

        <div
          v-if="initializing"
          class="w-full mb-4 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm"
        >
          Validating recovery link...
        </div>

        <div v-if="errorMsg" class="w-full mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {{ errorMsg }}
        </div>

        <div class="w-full flex flex-col gap-4">
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue text-sm font-medium pb-2">
              New password
            </p>
            <input
              v-model="password" maxlength="100"
              class="form-input flex w-full rounded-lg text-brand-dark-blue focus:ring-2 focus:ring-brand-light-blue/50
                     border border-gray-300 bg-brand-soft-grey/50
                     h-14 p-4 text-base"
              placeholder="Enter your new password"
              :type="showPassword ? 'text' : 'password'"
              :disabled="initializing"
            />
          </label>

          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue text-sm font-medium pb-2">
              Confirm password
            </p>
            <input
              v-model="confirmPassword" maxlength="100"
              class="form-input flex w-full rounded-lg text-brand-dark-blue focus:ring-2 focus:ring-brand-light-blue/50
                     border border-gray-300 bg-brand-soft-grey/50
                     h-14 p-4 text-base"
              placeholder="Repeat your new password"
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
            {{ loading ? "Updating..." : "Update password" }}
          </button>

          <button
            type="button"
            @click="go('/login')"
            :disabled="loading"
            class="w-full h-14 rounded-lg border border-brand-dark-blue text-brand-dark-blue font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Back to sign in
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
import { API_BASE_URL, isBackendMode, supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

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
      // Clear the hash to avoid retries
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

  // In backend mode, the token comes as ?token=
  if (isBackendMode) return;

  if (!isSupabaseConfigured) {
    errorMsg.value = "This screen requires 'supabase' or 'backend' mode.";
    return;
  }

  initializing.value = true;
  try {
    const ok = await ensureSupabaseRecoverySession();
    if (!ok) {
      errorMsg.value = "Invalid or expired link. Request password recovery again.";
      recoveryReady.value = false;
    } else {
      recoveryReady.value = true;
    }
  } catch (e) {
    errorMsg.value = e?.message || "Could not validate the recovery link.";
    recoveryReady.value = false;
  } finally {
    initializing.value = false;
  }
});

async function reset() {
  errorMsg.value = "";

  // Backend mode
  if (isBackendMode) {
    const token = String(route.query.token || "").trim();
    if (!token) {
      errorMsg.value = "Recovery token is missing.";
      return;
    }

    if (!password.value || password.value.length < 6) {
      errorMsg.value = "The password must be at least 6 characters.";
      return;
    }
    if (password.value !== confirmPassword.value) {
      errorMsg.value = "Passwords do not match.";
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
      if (!res.ok) throw new Error(data?.error || "Could not update the password");

      await Swal.fire({
        icon: "success",
        title: "Password updated",
        text: "You can now sign in with your new password.",
        confirmButtonColor: "#5DBCD2",
      });
      go("/login");
    } catch (e) {
      errorMsg.value = e?.message || "Error updating the password.";
    } finally {
      loading.value = false;
    }
    return;
  }

  // Supabase mode
  if (!isSupabaseConfigured) {
    errorMsg.value = "This screen requires 'supabase' or 'backend' mode.";
    return;
  }

  if (!password.value || password.value.length < 6) {
    errorMsg.value = "The password must be at least 6 characters.";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = "Passwords do not match.";
    return;
  }

  loading.value = true;
  try {
    if (!recoveryReady.value) {
      const ok = await ensureSupabaseRecoverySession();
      if (!ok) throw new Error("Invalid or expired link.");
      recoveryReady.value = true;
    }

    const { error } = await supabase.auth.updateUser({ password: password.value });
    if (error) throw error;

    // For security, sign out and force sign-in with the new password.
    await supabase.auth.signOut();

    await Swal.fire({
      icon: "success",
      title: "Password updated",
      text: "You can now sign in with your new password.",
      confirmButtonColor: "#5DBCD2",
    });
    go("/login");
  } catch (e) {
    errorMsg.value = e?.message || "Error updating the password.";
  } finally {
    loading.value = false;
  }
}
</script>

