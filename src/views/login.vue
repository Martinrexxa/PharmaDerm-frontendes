<template>
  <div
    class="relative flex min-h-screen w-full flex-col bg-background-light group/design-root overflow-x-hidden"
  >
    <!-- Fondo -->
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
          <img :src="logofullSrc" alt="PharmaDerm" class="h-14 object-contain" />
        </div>

        <h1 class="text-brand-dark-blue tracking-tight text-3xl font-bold text-center pb-6 pt-2">
          Welcome back
        </h1>

        <!-- Error -->
        <div v-if="errorMsg" class="w-full mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {{ errorMsg }}
        </div>

        <!-- Formulario -->
        <div class="w-full flex flex-col gap-4">
          <!-- Email -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue text-sm font-medium pb-2">
              Email address
            </p>
            <input
              v-model="email" maxlength="100"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              @keyup.enter="handleLogin"
              class="form-input flex w-full rounded-lg text-brand-dark-blue focus:ring-2 focus:ring-brand-light-blue/50
                     border border-gray-300 bg-brand-soft-grey/50
                     h-14 p-4 text-base"
            />
          </label>

          <!-- Password -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue text-sm font-medium pb-2">
              Password
            </p>
            <div class="flex w-full items-stretch">
              <input
                v-model="password" maxlength="100"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                autocomplete="current-password"
                @keyup.enter="handleLogin"
                class="form-input flex w-full rounded-l-lg text-brand-dark-blue focus:ring-2 focus:ring-brand-light-blue/50
                       border border-gray-300 bg-brand-soft-grey/50
                       h-14 p-4 text-base border-r-0"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="flex items-center justify-center px-4 border border-l-0
                       border-gray-300
                       bg-brand-soft-grey/50 rounded-r-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
              </button>
            </div>
          </label>
        </div>

        <!-- OlvidÃ© -->
        <div class="w-full text-right mt-2">
          <button
            type="button"
            @click="go('/olvide')"
            class="text-brand-dark-blue text-sm underline hover:text-brand-light-blue"
          >
            Forgot your password?
          </button>
        </div>

        <!-- Botones -->
        <div class="w-full flex flex-col gap-4 mt-8">
          <button
            @click="handleLogin"
            :disabled="loading"
            class="w-full h-14 rounded-lg bg-brand-light-blue text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            {{ loading ? 'Logging in...' : 'Log in' }}
          </button>

          <button
            @click="go('/registro')"
            class="w-full h-14 rounded-lg border border-brand-dark-blue text-brand-dark-blue font-bold"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore.js'
import Swal from 'sweetalert2'
import logofullSrc from '../assets/logo -Photoroom.png'

const router   = useRouter()
const auth     = useAuthStore()
const email    = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
const loading  = ref(false)

const go = (path) => router.push(path)

async function handleLogin() {
  errorMsg.value = ''

  if (!email.value.trim()) {
    errorMsg.value = 'Please enter your email address.'
    return
  }
  if (!password.value) {
    errorMsg.value = 'Please enter your password.'
    return
  }

  loading.value = true
  try {
    await auth.login(email.value.trim().slice(0, 100), password.value.slice(0, 100))
    await Swal.fire({
      toast: true,
      position: 'top',
      icon: 'success',
      title: 'Logged in',
      timer: 1600,
      timerProgressBar: true,
      showConfirmButton: false,
      background: 'linear-gradient(135deg, #004E92 0%, #5DBCD2 100%)',
      color: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-white/10',
        title: 'font-bold',
      },
      didOpen: (popup) => {
        popup.addEventListener('mouseenter', Swal.stopTimer)
        popup.addEventListener('mouseleave', Swal.resumeTimer)
      },
    })
    router.push('/inicio')
  } catch (err) {
    const msg = err?.message || ''
    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
      errorMsg.value = 'Incorrect email or password.'
    } else if (msg.includes('Email not confirmed')) {
      errorMsg.value = 'Please confirm your email before signing in. Check your inbox.'
    } else if (msg.includes('Too many requests')) {
      errorMsg.value = 'Too many attempts. Please wait a few minutes and try again.'
    } else if (msg.includes('network') || msg.includes('fetch')) {
      errorMsg.value = 'Connection error. Check your internet and try again.'
    } else {
      errorMsg.value = msg || 'Sign-in error. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

