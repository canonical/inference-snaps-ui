<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import MessageBubble from './MessageBubble.vue'

const store = useChatStore()
const messagesContainer = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  retry: [index: number]
}>()

// True when the user has manually scrolled up away from the bottom.
// Reset when they scroll back to the bottom, or when a new message is sent.
const userScrolled = ref(false)

function onScroll() {
  const container = messagesContainer.value
  if (!container) return
  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
  userScrolled.value = distanceFromBottom > 30
}

function scrollToBottom(force = false) {
  const container = messagesContainer.value
  if (!container) return
  if (!force && userScrolled.value) return
  container.scrollTop = container.scrollHeight
}

// Watch messages length — force scroll and reset the user-scrolled flag on new messages
watch(
  () => store.messages.length,
  async () => {
    userScrolled.value = false
    await nextTick()
    scrollToBottom(true)
  },
)

// Watch the content of the last streaming message so we scroll on every chunk
const lastMessageContent = computed(() => {
  const last = store.messages.at(-1)
  return last?.isStreaming ? (last.content ?? '') + (last.reasoning ?? '') : null
})

watch(lastMessageContent, async () => {
  await nextTick()
  scrollToBottom()
})

defineExpose({ scrollToBottom })
</script>

<template>
  <div
    ref="messagesContainer"
    class="chat-messages"
    role="log"
    aria-live="polite"
    aria-label="Conversation history"
    @scroll="onScroll"
  >
    <div class="u-fixed-width chat-messages__inner">
      <!-- Empty state -->
      <div v-if="store.messages.length === 0" class="chat-empty-state">
        <p v-if="store.modelError" class="u-text--muted">
          Could not connect to <code>{{ store.config.openAIBaseURL }}</code>:
          <strong>{{ store.modelError }}</strong>
        </p>
        <p v-else class="u-text--muted">Start a conversation by typing a message below.</p>
      </div>

      <!-- Message list -->
      <MessageBubble
        v-for="(message, index) in store.messages"
        :key="index"
        :message="message"
        :index="index"
        @retry="(i) => emit('retry', i)"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0 0.5rem;
  display: flex;
  flex-direction: column;
}

.chat-messages__inner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.chat-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
  text-align: center;
}
</style>
