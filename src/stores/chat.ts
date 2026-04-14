import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppConfig, ChatMessage } from '@/types'

export const useChatStore = defineStore('chat', () => {
  // ── Config ──────────────────────────────────────────────────────────────
  const config = ref<AppConfig>({
    openAIBaseURL: '',
    capabilities: [],
    instanceName: '',
    engineName: '',
  })

  const modelName = ref<string | null>(null)
  const modelError = ref<string | null>(null)

  // ── Messages ─────────────────────────────────────────────────────────────
  const messages = ref<ChatMessage[]>([])

  // ── UI state ─────────────────────────────────────────────────────────────
  const isLoading = ref(false)
  const isSettingsPanelOpen = ref(false)
  const lightboxImage = ref<string | null>(null)
  const activeErrorDetail = ref<string | null>(null)

  // ── Computed ──────────────────────────────────────────────────────────────
  const uiTitle = computed(() => {
    const name = config.value.instanceName ?? ''
    return name.charAt(0).toUpperCase() + name.slice(1) + ' Inference Snap'
  })

  const supportsVision = computed(() =>
    config.value.capabilities?.includes('vision') ?? false,
  )

  // ── Actions ───────────────────────────────────────────────────────────────
  async function fetchConfig(): Promise<void> {
    const response = await fetch('/config')
    config.value = await response.json()
  }

  async function fetchModelName(): Promise<void> {
    try {
      const response = await fetch(`${config.value.openAIBaseURL}/models`)
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      const data = await response.json()
      const first = data.data?.[0]
      if (!first) throw new Error('No models returned by the API.')
      modelName.value = first.id
    } catch (err) {
      modelError.value = err instanceof Error ? err.message : String(err)
    }
  }

  function openLightbox(src: string) {
    lightboxImage.value = src
  }

  function closeLightbox() {
    lightboxImage.value = null
  }

  function openErrorModal(detail: string) {
    activeErrorDetail.value = detail
  }

  function closeErrorModal() {
    activeErrorDetail.value = null
  }

  return {
    config,
    modelName,
    modelError,
    messages,
    isLoading,
    isSettingsPanelOpen,
    lightboxImage,
    activeErrorDetail,
    uiTitle,
    supportsVision,
    fetchConfig,
    fetchModelName,
    openLightbox,
    closeLightbox,
    openErrorModal,
    closeErrorModal,
  }
})

