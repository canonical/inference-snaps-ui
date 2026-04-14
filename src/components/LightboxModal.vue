<script setup lang="ts">
import { useChatStore } from '@/stores/chat'

const store = useChatStore()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="store.lightboxImage"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Full-size image"
      @click.self="store.closeLightbox"
    >
      <div class="lightbox__content">
        <button class="lightbox__close" aria-label="Close" @click="store.closeLightbox">
          &times;
        </button>
        <img :src="store.lightboxImage" alt="Full-size image" class="lightbox__image" />
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

.lightbox__content {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox__image {
  max-width: 95vw;
  max-height: 95vh;
  object-fit: contain;
  border-radius: 0.25rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.lightbox__close {
  position: absolute;
  top: -2.5rem;
  right: 0;
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.2rem;
  transition: background-color 0.1s;
}

.lightbox__close:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

