<template>
  <div
    class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden"
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
          <svg
            class="h-12 text-brand-dark-blue dark:text-brand-light-blue"
            fill="currentColor"
            viewBox="0 0 200 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(40, 0)">
              <path
                d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"
              />
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" />
              <text
                x="30"
                y="18"
                font-family="Manrope, sans-serif"
                font-size="14"
                font-weight="800"
              >
                PharmaDerm
              </text>
            </g>
          </svg>
        </div>

        <!-- Headline -->
        <h1
          class="text-brand-dark-blue dark:text-white tracking-tight text-3xl font-bold text-center pb-6 pt-2"
        >
          Crear cuenta
        </h1>

        <!-- Error -->
        <div v-if="errorMsg" class="w-full mb-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {{ errorMsg }}
        </div>

        <!-- Éxito (confirmación de email) -->
        <div v-if="successMsg" class="w-full mb-2 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
          {{ successMsg }}
        </div>

        <!-- Campos -->
        <div class="w-full flex flex-col gap-4">
          <!-- Nombre -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue dark:text-gray-300 text-sm font-medium pb-2">
              Nombre
            </p>
            <input
              v-model="nombre"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue dark:text-white dark:bg-background-dark/50 focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 dark:border-gray-600 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
              placeholder="Tu nombre"
              type="text"
            />
          </label>

          <!-- Apellido -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue dark:text-gray-300 text-sm font-medium pb-2">
              Apellido
            </p>
            <input
              v-model="apellido"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue dark:text-white dark:bg-background-dark/50 focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 dark:border-gray-600 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
              placeholder="Tu apellido"
              type="text"
            />
          </label>

          <!-- Correo -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue dark:text-gray-300 text-sm font-medium pb-2">
              Correo electrónico
            </p>
            <input
              v-model="email"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue dark:text-white dark:bg-background-dark/50 focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 dark:border-gray-600 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
              placeholder="tucorreo@ejemplo.com"
              type="email"
            />
          </label>

          <!-- Teléfono -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue dark:text-gray-300 text-sm font-medium pb-2">
              Teléfono
            </p>
            <input
              v-model="telefono"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue dark:text-white dark:bg-background-dark/50 focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 dark:border-gray-600 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
              placeholder="Ej: 8091234567"
              type="tel"
            />
          </label>

          <!-- Fecha de nacimiento -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue dark:text-gray-300 text-sm font-medium pb-2">
              Fecha de nacimiento
            </p>
            <input
              v-model="birthDate"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue dark:text-white dark:bg-background-dark/50 focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 dark:border-gray-600 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
              type="date"
              :max="maxBirthDate"
            />
          </label>

          <!-- Contraseña -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue dark:text-gray-300 text-sm font-medium pb-2">
              Contraseña
            </p>
            <div class="flex w-full flex-1 items-stretch">
              <input
                v-model="password"
                class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-brand-dark-blue dark:text-white dark:bg-background-dark/50 focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 dark:border-gray-600 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 border-r-0 pr-2 text-base font-normal leading-normal"
                placeholder="Crea una contraseña"
                :type="showPassword ? 'text' : 'password'"
              />

              <button
                type="button"
                class="text-gray-500 flex border border-gray-300 dark:border-gray-600 bg-brand-soft-grey/50 dark:bg-background-dark/50 items-center justify-center pr-4 rounded-r-lg border-l-0"
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

          <!-- Confirmar contraseña -->
          <label class="flex flex-col w-full">
            <p class="text-brand-dark-blue dark:text-gray-300 text-sm font-medium pb-2">
              Confirmar contraseña
            </p>
            <input
              v-model="confirmPassword"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-brand-dark-blue dark:text-white dark:bg-background-dark/50 focus:outline-0 focus:ring-2 focus:ring-brand-light-blue/50 border border-gray-300 dark:border-gray-600 bg-brand-soft-grey/50 focus:border-brand-light-blue h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
              placeholder="Repite tu contraseña"
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
            Crear cuenta
          </button>

          <button
            class="flex w-full items-center justify-center rounded-lg border border-brand-dark-blue bg-transparent h-14 text-center text-base font-bold text-brand-dark-blue dark:text-white dark:border-brand-light-blue hover:bg-brand-dark-blue/5 dark:hover:bg-brand-light-blue/10 transition-colors"
            type="button"
            @click="go('/login')"
          >
            Ya tengo cuenta
          </button>
        </div>

        <!-- Texto final -->
        <p class="text-neutral-text dark:text-gray-400 text-xs text-center mt-6">
          Al registrarte, aceptas nuestros términos y políticas.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore.js'

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

async function registrar() {
  errorMsg.value  = ''
  successMsg.value = ''

  if (!nombre.value.trim() || !apellido.value.trim() || !email.value.trim() ||
      !telefono.value.trim() || !birthDate.value || !password.value || !confirmPassword.value) {
    errorMsg.value = 'Por favor, completa todos los campos.'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Las contraseñas no coinciden.'
    return
  }

  loading.value = true
  try {
    const result = await auth.register({
      firstName: nombre.value.trim(),
      lastName:  apellido.value.trim(),
      email:     email.value.trim(),
      phone:     telefono.value.trim(),
      birthDate: birthDate.value || null,
      password:  password.value,
    })

    if (result.needsEmailConfirmation) {
      successMsg.value = 'Cuenta creada. Revisa tu correo y confirma tu cuenta antes de iniciar sesión.'
    } else {
      router.push('/inicio')
    }
  } catch (err) {
    const msg = err?.message || ''
    if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('User already registered')) {
      errorMsg.value = 'Ya existe una cuenta con ese correo electrónico. Inicia sesión.'
    } else if (msg.includes('weak') || msg.includes('password')) {
      errorMsg.value = 'La contraseña es muy débil. Usa al menos 6 caracteres.'
    } else if (msg.includes('valid email') || msg.includes('invalid email')) {
      errorMsg.value = 'El correo electrónico no es válido.'
    } else if (msg.includes('network') || msg.includes('fetch')) {
      errorMsg.value = 'Error de conexión. Verifica tu internet e intenta de nuevo.'
    } else {
      errorMsg.value = msg || 'Error al crear la cuenta. Intenta de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>