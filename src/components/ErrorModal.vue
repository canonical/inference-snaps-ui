<script setup lang="ts">
import { useChatStore } from '@/stores/chat'

const store = useChatStore()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="store.activeErrorDetail"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Error details"
      @click.self="store.closeErrorModal"
    >
      <div class="error-modal">
        <div class="error-modal__header">
          <h4 class="u-no-margin--bottom">Error details</h4>
          <button class="lightbox__close error-modal__close" aria-label="Close" @click="store.closeErrorModal">
            &times;
          </button>
        </div>
        <pre class="error-modal__body">{{ store.activeErrorDetail }}</pre>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.15s ease-out;
}

.error-modal {
  background: #fff;
  border-radius: 0.4rem;
  width: min(600px, 90vw);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.error-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #d9d9d9;
}

.error-modal__close {
  position: static;
  transform: none;
  color: #333;
  font-size: 1.5rem;
  padding: 0 0.25rem;
}

.lightbox__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.2rem;
  transition: background-color 0.1s;
  line-height: 1;
}

.lightbox__close:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.error-modal__body {
  padding: 1rem;
  margin: 0;
  overflow: auto;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-all;
  color: #c7162b;
  background: #fff4f4;
  border-radius: 0 0 0.4rem 0.4rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

