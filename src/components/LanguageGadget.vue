<template>
  <div ref="gadgetRef" class="language-gadget">
    <Transition name="language-menu">
      <div v-if="open" class="language-menu" role="menu" :aria-label="t('language.label')">
        <button
          v-for="option in options"
          :key="option.code"
          type="button"
          role="menuitemradio"
          class="language-option"
          :class="{ active: lang === option.code }"
          :aria-checked="lang === option.code"
          @click="selectLanguage(option.code)"
        >
          <span>{{ option.label }}</span>
          <strong>{{ option.code.toUpperCase() }}</strong>
        </button>
      </div>
    </Transition>

    <button
      type="button"
      class="language-trigger"
      :aria-label="t('language.toggle')"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="open = !open"
    >
      <span class="material-symbols-outlined" aria-hidden="true">language</span>
      <span class="language-code">{{ t('language.current') }}</span>
    </button>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from '../lib/i18n.js'
import { useSettingsStore } from '../stores/useSettingsStore.js'

const { t, lang } = useI18n()
const settings = useSettingsStore()
const open = ref(false)
const gadgetRef = ref(null)

const options = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

function selectLanguage(code) {
  settings.setLanguage(code)
  open.value = false
}

function onDocumentClick(event) {
  if (!gadgetRef.value?.contains(event.target)) {
    open.value = false
  }
}

function onKeydown(event) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.language-gadget {
  position: fixed;
  right: 18px;
  bottom: 148px;
  z-index: 95;
  display: grid;
  justify-items: end;
  gap: 10px;
}

.language-trigger {
  height: 44px;
  min-width: 86px;
  border: 1px solid rgba(132, 182, 244, 0.62);
  border-radius: 999px;
  background: rgba(252, 255, 255, 0.92);
  color: #005187;
  box-shadow: 0 14px 34px rgba(0, 81, 135, 0.18);
  backdrop-filter: blur(14px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
}

.language-trigger:hover {
  transform: translateY(-2px);
  background: #fcffff;
  box-shadow: 0 18px 38px rgba(0, 81, 135, 0.24);
}

.language-trigger .material-symbols-outlined {
  font-size: 19px;
}

.language-code {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .08em;
}

.language-menu {
  width: 154px;
  padding: 8px;
  border: 1px solid rgba(196, 218, 250, 0.95);
  border-radius: 18px;
  background: rgba(252, 255, 255, 0.96);
  box-shadow: 0 20px 48px rgba(0, 81, 135, 0.18);
  backdrop-filter: blur(18px);
}

.language-option {
  width: 100%;
  border: 0;
  background: transparent;
  color: #005187;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 11px;
  cursor: pointer;
  font-size: 13px;
  transition: background .16s ease, color .16s ease, transform .16s ease;
}

.language-option:hover {
  background: #edf6ff;
  transform: translateX(-2px);
}

.language-option.active {
  background: #005187;
  color: #fcffff;
}

.language-option strong {
  font-size: 11px;
  letter-spacing: .08em;
}

.language-menu-enter-active,
.language-menu-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}

.language-menu-enter-from,
.language-menu-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(.98);
}

@media (max-width: 760px) {
  .language-gadget {
    right: 14px;
    bottom: 154px;
  }

  .language-trigger {
    min-width: 78px;
    height: 42px;
    padding: 0 12px;
  }
}
</style>
