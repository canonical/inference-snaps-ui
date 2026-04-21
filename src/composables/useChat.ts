import { nextTick, ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import type { ChatMessage, MessageContent, MessageContentPart } from '@/types'

/**
 * Parses <think>…</think> out of raw streaming content into a separate
 * reasoning field, leaving the rest in `content`.
 */
function syncReasoning(msg: ChatMessage) {
  const raw = msg.rawContent
  const match = /<think>([\s\S]*?)(<\/think>|$)/.exec(raw)
  if (match) {
    msg.reasoning = match[1] ?? ''
    msg.content = raw.replace(/<think>[\s\S]*?(<\/think>|$)/g, '').trim()
  } else {
    msg.content = raw
  }
}

export function useChat(scrollToBottom: (force?: boolean) => void) {
  const store = useChatStore()
  const abortController = ref<AbortController | null>(null)

  // ── Stop generation ──────────────────────────────────────────────────────
  function cancelStream() {
    abortController.value?.abort()
  }

  // ── Retry ────────────────────────────────────────────────────────────────
  function retryMessage(assistantMsgIndex: number, onPopulate: (text: string, image: string | null) => void) {
    const userMsgIndex = assistantMsgIndex - 1
    const userMsg = store.messages[userMsgIndex]
    if (!userMsg || userMsg.role !== 'user') return

    const content = userMsg.content
    let text: string
    if (Array.isArray(content)) {
      text = (content as MessageContentPart[]).find((p) => p.type === 'text')?.text ?? ''
    } else {
      text = content
    }

    const firstImage = userMsg.images?.[0]
    const image: string | null = firstImage !== undefined ? firstImage : null

    store.messages.splice(userMsgIndex, 2)
    onPopulate(text, image)
  }

  // ── Send ─────────────────────────────────────────────────────────────────
  async function sendMessage(text: string, attachedImage: string | null) {
    if (store.isLoading) return
    if (!store.modelName) return
    if (!text.trim() && !attachedImage) return

    // Build content for API
    let apiContent: MessageContent
    if (attachedImage && store.supportsVision) {
      apiContent = [
        { type: 'text', text: text.trim() || '(image attached)' },
        { type: 'image_url', image_url: { url: attachedImage } },
      ]
    } else {
      apiContent = text.trim()
    }

    // Push user message
    store.messages.push({
      role: 'user',
      content: apiContent,
      rawContent: '',
      reasoning: '',
      images: attachedImage ? [attachedImage] : [],
      isStreaming: false,
      cancelled: false,
      friendlyError: null,
      errorDetail: null,
      reasoningOpen: false,
    })

    store.isLoading = true
    await nextTick()
    scrollToBottom(true)

    // Push placeholder assistant message
    store.messages.push({
      role: 'assistant',
      content: '',
      rawContent: '',
      reasoning: '',
      images: [],
      isStreaming: true,
      cancelled: false,
      friendlyError: null,
      errorDetail: null,
      reasoningOpen: true,
    })
    const msgIndex = store.messages.length - 1

    abortController.value = new AbortController()

    try {
      // Build context (exclude streaming/cancelled messages)
      const apiMessages = store.messages
        .filter((m) => !m.isStreaming && !m.cancelled)
        .map(({ role, content }) => ({ role, content }))

      const requestBody: Record<string, unknown> = {
        model: store.modelName,
        messages: apiMessages,
        stream: true,
      }

      if (store.showThinkingToggle) {
        requestBody['chat_template_kwargs'] = { enable_thinking: store.thinkingEnabled }
      }

      const response = await fetch(`${store.config.openAIBaseURL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.value.signal,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        const errMsg =
          `API error ${response.status}: ${response.statusText}` +
          (errorText ? '\n\n' + errorText : '')
        const msg = store.messages[msgIndex]
        if (msg) {
          msg.friendlyError = 'The request failed. Please try again.'
          msg.errorDetail = errMsg
        }
        return
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          const msg = store.messages[msgIndex]
          if (!msg) break
          try {
            const chunk = JSON.parse(data) as { choices?: { delta?: { reasoning_content?: string; content?: string } }[] }
            const delta = chunk.choices?.[0]?.delta ?? {}
            if (delta.reasoning_content) {
              msg.reasoning += delta.reasoning_content
            }
            if (delta.content) {
              msg.rawContent += delta.content
            }
          } catch {
            // ignore malformed chunks
          }
        }

        const currentMsg = store.messages[msgIndex]
        if (currentMsg) syncReasoning(currentMsg)
        await nextTick()
        scrollToBottom()
      }

      const currentMsg = store.messages[msgIndex]
      if (currentMsg) syncReasoning(currentMsg)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        const msg = store.messages[msgIndex]
        if (msg) msg.cancelled = true
        const userMsg = store.messages[msgIndex - 1]
        if (userMsg?.role === 'user') userMsg.cancelled = true
      } else {
        const msg = store.messages[msgIndex]
        if (msg) {
          msg.friendlyError = 'The request failed. Please try again.'
          msg.errorDetail = err instanceof Error ? err.message : String(err)
        }
      }
    } finally {
      const msg = store.messages[msgIndex]
      if (msg) msg.isStreaming = false
      store.isLoading = false
      abortController.value = null
      await nextTick()
      scrollToBottom()
    }
  }

  return { sendMessage, cancelStream, retryMessage }
}
