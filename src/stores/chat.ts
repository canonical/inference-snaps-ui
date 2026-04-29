import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppConfig, ChatMessage } from '@/types'

/**
 * Rewrite an OpenAI base URL to use the current page hostname when the
 * configured URL points to a local development host (localhost or 127.0.0.1).
 *
 * Behavior:
 * - If `baseURL` is not an absolute URL, returns it unchanged.
 * - If not running in a browser environment (`window` undefined), returns the original.
 * - If the current page hostname is `localhost` or `127.0.0.1`, returns the original.
 * - Only rewrites when `baseURL`'s hostname is `localhost` or `127.0.0.1` and the
 *   current page hostname is a non-local hostname — port and path are preserved.
 *
 * Example:
 * patchOpenAIBaseURLForCurrentHost('http://localhost:8334/v1', { hostname: 'app.example.com', href: 'https://app.example.com/' })
 * -> 'http://app.example.com:8334/v1'
 *
 * @param baseURL - The configured OpenAI base URL (absolute or otherwise)
 * @param currentLocation - Optional location object (defaults to `window.location`)
 * @returns The rewritten absolute URL string, or the original `baseURL` if no rewrite is performed
 */
export function patchOpenAIBaseURLForCurrentHost(
  baseURL: string,
  currentLocation: Pick<Location, 'hostname' | 'href'> = window.location,
): string {

  let url: URL
  try {
    // Only accept absolute URLs — reject relative or invalid inputs.
    url = new URL(baseURL)
  } catch {
    return baseURL
  }

  if (typeof window === 'undefined')
    return baseURL

  const pageHostname = currentLocation.hostname
  if (!pageHostname || pageHostname === 'localhost' || pageHostname === '127.0.0.1') {
    return baseURL
  }

  // Only rewrite localhost/127.0.0.1 targets when the page hostname is not local.
  if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    return baseURL
  }

  // preserve port and path
  url.hostname = pageHostname
  return url.toString()
}

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

  // ── Thinking toggle ───────────────────────────────────────────────────────
  const thinkingEnabled = ref(true)

  // ── Computed ──────────────────────────────────────────────────────────────
  const uiTitle = computed(() => {
    const name = config.value.instanceName ?? ''
    return name.charAt(0).toUpperCase() + name.slice(1) + ' Inference Snap'
  })

  const supportsVision = computed(() =>
    config.value.capabilities?.includes('vision') ?? false,
  )

  const showThinkingToggle = computed(() =>
    config.value.instanceName?.includes('nemotron-3') ?? false,
  )

  const isMarkdown = computed(() => config.value.capabilities?.includes('text:markdown') ?? false)

  // ── Actions ───────────────────────────────────────────────────────────────
  async function fetchConfig(): Promise<void> {
    const response = await fetch(import.meta.env.VITE_CONFIG_URL)
    const fetchedConfig = await response.json()
    config.value = {
      ...fetchedConfig,
      openAIBaseURL: patchOpenAIBaseURLForCurrentHost(fetchedConfig.openAIBaseURL),
    }
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
    thinkingEnabled,
    uiTitle,
    supportsVision,
    showThinkingToggle,
    isMarkdown,
    fetchConfig,
    fetchModelName,
    openLightbox,
    closeLightbox,
    openErrorModal,
    closeErrorModal,
  }
})

