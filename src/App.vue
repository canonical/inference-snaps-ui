<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useChat } from '@/composables/useChat'
import AppHeader from '@/components/AppHeader.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import ChatMessages from '@/components/ChatMessages.vue'
import ChatInput from '@/components/ChatInput.vue'
import LightboxModal from '@/components/LightboxModal.vue'
import ErrorModal from '@/components/ErrorModal.vue'

const store = useChatStore()
const chatMessagesRef = ref<InstanceType<typeof ChatMessages> | null>(null)

function scrollToBottom(force = false) {
  chatMessagesRef.value?.scrollToBottom(force)
}

const { sendMessage, cancelStream, retryMessage } = useChat(scrollToBottom)

async function handleSend(text: string, image: string | null) {
  await sendMessage(text, image)
}

function handleCancel() {
  cancelStream()
}

function handleRetry(index: number) {
  retryMessage(index, (text, image) => {
    // Re-trigger send with the populated values
    sendMessage(text, image)
  })
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (store.lightboxImage) store.closeLightbox()
    if (store.activeErrorDetail) store.closeErrorModal()
  }
}

onMounted(async () => {
  await store.fetchConfig()
  document.title = store.uiTitle
  await store.fetchModelName()
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <SettingsPanel />
    <main class="chat-main">
      <ChatMessages ref="chatMessagesRef" @retry="handleRetry" />
      <ChatInput @send="handleSend" @cancel="handleCancel" />
    </main>
    <LightboxModal />
    <ErrorModal />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.chat-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background-color: #f5f5f5;
}
</style>
