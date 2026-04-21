<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useImageResize } from '@/composables/useImageResize'

const emit = defineEmits<{
  send: [text: string, image: string | null]
  cancel: []
}>()

const store = useChatStore()
const { resizeImage } = useImageResize()

const userInput = ref('')
const attachedImage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const textarea = ref<HTMLTextAreaElement | null>(null)

watch(
  () => store.isLoading,
  async (loading) => {
    if (!loading) {
      await nextTick()
      textarea.value?.focus()
    }
  },
)

onMounted(() => {
  textarea.value?.focus()
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
  // Shift+Enter falls through to textarea's default (inserts newline)
}

function handleSend() {
  if (!userInput.value.trim() && !attachedImage.value) return
  emit('send', userInput.value, attachedImage.value)
  userInput.value = ''
  attachedImage.value = null
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('Only image files are supported.')
    input.value = ''
    return
  }
  try {
    attachedImage.value = await resizeImage(file)
  } catch (err) {
    alert(`Could not load image: ${err instanceof Error ? err.message : err}`)
  }
  input.value = ''
}

function removeImage() {
  attachedImage.value = null
}
</script>

<template>
  <div class="chat-input-area">
    <div class="u-fixed-width">
      <!-- Input row -->
      <div class="chat-input-row">
        <div class="chat-input-field">
          <!-- Image preview -->
          <div v-if="attachedImage" class="chat-input-image-preview">
            <div class="chat-input-image-thumb-wrapper">
              <img
                :src="attachedImage"
                alt="Image to attach"
                class="chat-input-image-thumb"
                title="Click to view full size"
                @click="store.openLightbox(attachedImage!)"
              />
              <button
                class="p-button--negative is-small has-icon chat-input-image-remove"
                aria-label="Remove attached image"
                type="button"
                @click="removeImage"
              >
                <i class="p-icon--close is-light"></i>
              </button>
            </div>
          </div>
          <textarea
            ref="textarea"
            v-model="userInput"
            rows="3"
            placeholder="Type a message…"
            class="p-form__control chat-textarea"
            :class="{ 'chat-textarea--loading': store.isLoading }"
            :readonly="store.isLoading"
            aria-label="Message input"
            @keydown="handleKeydown"
          ></textarea>
        </div>
      </div>
      <!-- Actions row -->
      <div class="chat-input-actions">
        <div class="chat-input-actions-left">
          <button
            v-if="store.supportsVision"
            :disabled="store.isLoading"
            class="p-button has-icon u-no-margin--bottom"
            title="Attach an image"
            type="button"
            @click="fileInput?.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              aria-hidden="true"
              tabindex="-1"
              @change="handleImageUpload"
            />
<!--            <i class="p-icon&#45;&#45;upload"></i>-->
            <span>Attach</span>
          </button>
          <label
            v-if="store.showThinkingToggle"
            class="p-switch u-no-margin--bottom thinking-switch"
          >
            <input
              v-model="store.thinkingEnabled"
              type="checkbox"
              class="p-switch__input"
              role="switch"
              :disabled="store.isLoading"
            />
            <span class="p-switch__slider"></span>
            <span class="p-switch__label">{{
              store.thinkingEnabled ? 'Thinking on' : 'Thinking off'
            }}</span>
          </label>
        </div>
        <div class="chat-input-actions-right">
          <p class="chat-input-hint u-text--muted">
            <small>Enter to send &nbsp;&bull;&nbsp; Shift+Enter for new line</small>
          </p>
          <button
            v-if="!store.isLoading"
            :disabled="!userInput.trim() && !attachedImage"
            class="p-button--positive has-icon u-no-margin--bottom"
            @click="handleSend"
          >
<!--            <i class="p-icon&#45;&#45;play is-light"></i>-->
            <span>Send</span>
          </button>
          <button
            v-else
            class="p-button--negative has-icon u-no-margin--bottom"
            aria-label="Cancel generation"
            @click="emit('cancel')"
          >
<!--            <i class="p-icon&#45;&#45;stop is-light"></i>-->
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-input-area {
  flex-shrink: 0;
  background-color: #fff;
  border-top: 1px solid #d9d9d9;
  padding-top: 0.75rem;
  padding-bottom: 0.5rem;
}

.chat-input-image-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.4rem 0.6rem;
  background-color: #f5f5f5;
  border-radius: 0.25rem;
  border: 1px solid #d9d9d9;
}

.chat-input-image-thumb-wrapper {
  position: relative;
  display: inline-flex;
}

.chat-input-image-thumb {
  max-height: 60px;
  max-width: 120px;
  object-fit: contain;
  border-radius: 0.2rem;
  cursor: zoom-in;
  display: block;
}

.chat-input-image-remove {
  position: absolute;
  top: 0rem;
  right: 0rem;
  transform: scale(0.7);
  transform-origin: top right;
}

.chat-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.chat-input-field {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-textarea {
  width: 100%;
  resize: vertical;
  margin-bottom: 0;
  font-family: inherit;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d9d9d9;
  border-radius: 0.25rem;
  line-height: 1.5;
  transition: border-color 0.15s;
}

.chat-textarea:focus {
  outline: none;
  border-color: #06c;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.chat-textarea:disabled,
.chat-textarea--loading {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.chat-input-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.chat-input-actions-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.chat-input-actions-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.thinking-switch {
  align-self: center;
  margin-bottom: 0 !important;
  margin-top: 0;
  padding-top: 0 !important;
}

.thinking-switch .p-switch__label {
  display: inline-block;
  width: auto;
  overflow: visible;
  white-space: nowrap;
  text-overflow: unset;
}

.chat-input-hint {
  margin: 0;
  padding-top: 0 !important;
  color: #767676;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .chat-input-row {
    flex-wrap: wrap;
  }

  .chat-input-field {
    flex: 1 1 100%;
  }

  .chat-input-actions {
    justify-content: flex-end;
  }

  .thinking-switch {
    flex: 0 0 auto;
  }

  .chat-input-hint {
    display: none;
  }
}
</style>
