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

    <div
      class="relative flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
    >
      <div class="w-full max-w-sm mx-auto flex flex-col items-center">
        <!-- Logo -->
        <div class="mb-4 flex justify-center">
          <img :src="logoWordmarkSrc" alt="PharmaDerm" class="h-14 object-contain" />
        </div>

        <!-- Headline -->
        <h1
          class="text-brand-dark-blue tracking-tight text-3xl font-bold text-center pb-6 pt-2"
        >
          Create account
        </h1>

        <!-- Error -->
        <div v-if="errorMsg" class="w-full mb-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {{ errorMsg }}
        </div>

        <!-- Éxito (confirmación de email) -->
        <div v-if="successMsg" class="w-full mb-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {{ successMsg }}
        </div>

        <!-- Campos -->
        <div class="w-full flex flex-col gap-4">
          <!-- Nombre -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue text-sm font-medium pb-2">
              First name
            </p>
            <input
              v-model="nombre" maxlength="60"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 p-4 text-base font-normal leading-normal"
              placeholder="Your first name"
              type="text"
              pattern="[A-Za-zÀ-ÖØ-öø-ÿ\s'-]*"
              @beforeinput="blockNonLetterInput"
              @input="nombre = sanitizeLetters(nombre).slice(0, 60)"
            />
          </label>

          <!-- Apellido -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue text-sm font-medium pb-2">
              Last name
            </p>
            <input
              v-model="apellido" maxlength="60"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 p-4 text-base font-normal leading-normal"
              placeholder="Your last name"
              type="text"
              pattern="[A-Za-zÀ-ÖØ-öø-ÿ\s'-]*"
              @beforeinput="blockNonLetterInput"
              @input="apellido = sanitizeLetters(apellido).slice(0, 60)"
            />
          </label>

          <!-- Email -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue text-sm font-medium pb-2">
              Email address
            </p>
            <input
              v-model="email" maxlength="100"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 p-4 text-base font-normal leading-normal"
              placeholder="you@example.com"
              type="email"
            />
          </label>

          <!-- Teléfono -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue text-sm font-medium pb-2">
              Phone number
            </p>
            <input
              v-model="telefono"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 p-4 text-base font-normal leading-normal"
              placeholder="Ej: 8091234567"
              type="tel"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="10"
              @input="telefono = telefono.replace(/\D/g, '').slice(0, 10)"
            />
          </label>

          <!-- Fecha de nacimiento -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue text-sm font-medium pb-2">
              Date of birth
            </p>
            <input
              v-model="birthDate"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 p-4 text-base font-normal leading-normal"
              type="date"
              :max="maxBirthDate"
            />
          </label>

          <!-- Contraseña -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue text-sm font-medium pb-2">
              Password
            </p>
            <div class="flex w-full flex-1 items-stretch">
              <input
                v-model="password" maxlength="100"
                class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-brand-dark-blue focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 p-4 border-r-0 pr-2 text-base font-normal leading-normal"
                placeholder="Create a password"
                :type="showPassword ? 'text' : 'password'"
              />

              <button
                type="button"
                class="text-gray-500 flex border border-gray-300 bg-brand-soft-grey/50 items-center justify-center pr-4 rounded-r-lg border-l-0"
                @click="showPassword = !showPassword"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-gray-500 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"
                  />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
              </button>
            </div>
          </label>

          <!-- Confirm password -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue text-sm font-medium pb-2">
              Confirm password
            </p>
            <input
              v-model="confirmPassword" maxlength="100"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 p-4 text-base font-normal leading-normal"
              placeholder="Repeat your password"
              :type="showPassword ? 'text' : 'password'"
            />
          </label>
        </div>

        <!-- Botones -->
        <div class="w-full flex flex-col gap-4 mt-8">
          <button
            class="flex w-full items-center justify-center rounded-lg bg-brand-light-blue h-14 text-center text-base font-bold text-white shadow-sm hover:bg-opacity-90 transition-colors"
            type="button"
            @click="registrar"
          >
            Create account
          </button>

          <button
            class="flex w-full items-center justify-center rounded-lg border border-brand-dark-blue bg-transparent h-14 text-center text-base font-bold text-brand-dark-blue hover:bg-brand-dark-blue/5 transition-colors"
            type="button"
            @click="go('/login')"
          >
            I already have an account
          </button>
        </div>

        <!-- Texto final -->
        <p class="text-neutral-text text-xs text-center mt-6">
          By signing up, you accept our terms and policies.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore.js'
import Swal from 'sweetalert2'
import logoWordmarkSrc from '../assets/logo marca-Photoroom.png'

const router = useRouter()
const auth   = useAuthStore()

const nombre          = ref('')
const apellido        = ref('')
const email           = ref('')
const telefono        = ref('')
const birthDate       = ref('')
const password        = ref('')
const confirmPassword = ref('')
const showPassword    = ref(false)
const errorMsg        = ref('')
const successMsg      = ref('')
const loading         = ref(false)

const maxBirthDate = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 13)
  return d.toISOString().split('T')[0]
})

const go = (path) => router.push(path)

function sanitizeLetters(value) {
  return String(value || '').replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '')
}

function blockNonLetterInput(event) {
  const text = String(event?.data || '')
  if (!text) return
  if (/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/.test(text)) {
    event.preventDefault()
  }
}

async function registrar() {
  errorMsg.value  = ''
  successMsg.value = ''
  nombre.value = sanitizeLetters(nombre.value)
  apellido.value = sanitizeLetters(apellido.value)

  if (!nombre.value.trim() || !apellido.value.trim() || !email.value.trim() ||
      !telefono.value.trim() || !birthDate.value || !password.value || !confirmPassword.value) {
    errorMsg.value = 'Please fill in all fields.'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    const result = await auth.register({
      firstName: nombre.value.trim(),
      lastName:  apellido.value.trim(),
      email:     email.value.trim().slice(0, 100),
      phone:     telefono.value.trim(),
      birthDate: birthDate.value || null,
      password:  password.value,
    })

    if (result.needsEmailConfirmation) {
      await Swal.fire({
        icon: 'info',
        title: 'Account created',
        text: 'Check your email and confirm your account before signing in.',
        confirmButtonText: 'Go to login',
        confirmButtonColor: '#5DBCD2',
      })
      router.push('/login')
    } else {
      await Swal.fire({
        icon: 'success',
        title: 'Account created',
        text: 'You can now sign in.',
        timer: 1800,
        showConfirmButton: false,
      })
      router.push('/login')
    }
  } catch (err) {
    const msg = err?.message || ''
    if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('User already registered')) {
      errorMsg.value = 'An account with that email already exists. Please sign in.'
    } else if (msg.includes('weak') || msg.includes('password')) {
      errorMsg.value = 'Password is too weak. Use at least 6 characters.'
    } else if (msg.includes('valid email') || msg.includes('invalid email')) {
      errorMsg.value = 'Email address is not valid.'
    } else if (msg.includes('network') || msg.includes('fetch')) {
      errorMsg.value = 'Connection error. Check your internet and try again.'
    } else {
      errorMsg.value = msg || 'Error creating account. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>


