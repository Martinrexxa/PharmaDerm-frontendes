<template>
  <div
    class="relative flex min-h-screen w-full flex-col bg-background-light group/design-root overflow-x-hidden"
  >
    <!-- Background -->
    <div class="absolute inset-0 h-full w-full">
      <div
        class="w-full h-full bg-center bg-no-repeat bg-cover aspect-auto"
        style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuB2Rs3gLpz6hSpao11yuzIi-FP4Qad3nx8XKcT3g4uPZarCasEuW6FwliPMFmPy1ESe8gZRN9zr_56RY88oo0w1vwd6O3A5SoI0UgvWHwo2Jjo6siNfs7b75gnzfXEpAyto203eQgXN9GLvVT3p6MQU4Rl2DfxpLM7UNJG3BKYX7j7BJLQziwJQT7PIiJ-IYCzA6pvgqcHfhYB8vvJMr1_UaHWkZzrwgKx86vpj73k3qq1Z4C3toiWEusADTSh79FReQLf7V8q1zlU"); opacity: 0.1;'
      ></div>
    </div>

    <div class="relative flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div class="w-full max-w-sm mx-auto flex flex-col items-center">

        <!-- Logo -->
        <div class="mb-4 flex justify-center">
          <svg
            class="h-12 text-brand-dark-blue"
            fill="currentColor"
            viewBox="0 0 200 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(40, 0)">
              <path
                d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"
              />
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" />
              <text x="30" y="18" font-family="Manrope, sans-serif" font-size="14" font-weight="800">
                PharmaDerm
              </text>
            </g>
          </svg>
        </div>

        <h1 class="text-brand-dark-blue tracking-tight text-3xl font-bold text-center pb-4 pt-2">
          Recover password
        </h1>

        <p class="text-neutral-text text-sm text-center mb-6">
          Enter your email and we will send instructions to reset your password.
        </p>

        <!-- Email -->
        <label class="flex flex-col w-full">
          <p class="text-brand-dark-blue text-sm font-medium pb-2">
            Email address
          </p>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="form-input flex w-full rounded-lg text-brand-dark-blue focus:ring-2 focus:ring-brand-light-blue/50
                   border border-gray-300 bg-brand-soft-grey/50
                   h-14 p-4 text-base"
          />
        </label>

        <!-- Buttons -->
        <div class="w-full flex flex-col gap-4 mt-8">
          <button
            @click="enviar"
            :disabled="loading"
            class="w-full h-14 rounded-lg bg-brand-light-blue text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ loading ? "Sending..." : "Send link" }}
          </button>

          <button
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { API_BASE_URL, supabase, isBackendMode, isSupabaseConfigured } from "../lib/supabaseClient.js";
import Swal from "sweetalert2";

const router = useRouter();
const email = ref("");
const loading = ref(false);

const go = (path) => router.push(path);

const enviar = async () => {
  const e = email.value.trim();
  if (!e) {
    await Swal.fire({
      icon: "warning",
      title: "Email required",
      text: "Please enter your email address.",
      confirmButtonColor: "#5DBCD2",
    });
    return;
  }

  loading.value = true;
  try {
    if (isBackendMode) {
      await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: e }),
      });
    } else if (isSupabaseConfigured) {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(e, { redirectTo });
      if (error) throw error;
    } else {
      throw new Error("This feature requires backend or supabase mode.");
    }

    await Swal.fire({
      icon: "success",
      title: "Done",
      text: "If the email exists, we will send a recovery link.",
      confirmButtonColor: "#5DBCD2",
    });
    go("/login");
  } catch (err) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: err?.message || "Could not send the link. Please try again.",
      confirmButtonColor: "#5DBCD2",
    });
  } finally {
    loading.value = false;
  }
};
</script>
