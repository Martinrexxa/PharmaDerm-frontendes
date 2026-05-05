<template>
  <img :src="displaySrc" :alt="alt" :class="imgClass" @error="onError" />
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  class: { type: [String, Object, Array], default: '' },
})
const emit = defineEmits(['error'])

const imgClass = props.class
const displaySrc = ref(props.src)
const fallbackSrc = ref(props.src)

const _cache = (globalThis.__pdTransparentImgCache ||= new Map())

function shouldProcess(url) {
  if (!url) return false
  const lower = url.toLowerCase()
  // Process raster images; many catalog assets ship with a white background.
  return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')
}

function onError(e) {
  displaySrc.value = fallbackSrc.value || props.src
  emit('error', e)
}

async function toTransparentDataUrl(url) {
  if (_cache.has(url)) return _cache.get(url)

  const dataUrl = await new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const d = imageData.data

        // Simple white/near-white background removal.
        // Keeps edges by using a soft threshold.
        const cutoff = 245
        const soft = 18

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i]
          const g = d[i + 1]
          const b = d[i + 2]

          const min = Math.min(r, g, b)
          const max = Math.max(r, g, b)

          // Only treat "near-white" pixels as background if they are also low-saturation.
          if (min >= cutoff && (max - min) <= 20) {
            d[i + 3] = 0
            continue
          }

          // Soft fade for bright pixels to reduce white halos
          if (min >= cutoff - soft && (max - min) <= 30) {
            const t = (min - (cutoff - soft)) / soft // 0..1
            d[i + 3] = Math.round(255 * (1 - t))
          }
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = reject
    img.src = url
  })

  _cache.set(url, dataUrl)
  return dataUrl
}

watch(
  () => props.src,
  async (next) => {
    fallbackSrc.value = next
    displaySrc.value = next

    if (!shouldProcess(next)) return

    try {
      displaySrc.value = await toTransparentDataUrl(next)
    } catch {
      displaySrc.value = next
    }
  },
  { immediate: true }
)
</script>
