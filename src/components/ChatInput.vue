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
      <!-- Image preview -->
      <div v-if="attachedImage" class="chat-input-image-preview">
        <img
          :src="attachedImage"
          alt="Image to attach"
          class="chat-input-image-thumb"
          title="Click to view full size"
          @click="store.openLightbox(attachedImage!)"
        />
        <button
          class="p-button--negative is-small u-no-margin--bottom"
          aria-label="Remove attached image"
          @click="removeImage"
        >
          &#x2715; Remove
        </button>
      </div>

      <!-- Input row -->
      <div class="chat-input-row">
        <div class="chat-input-field">
          <textarea
            ref="textarea"
            v-model="userInput"
            placeholder="Type a message…"
            class="p-form__control chat-textarea"
            :class="{ 'chat-textarea--loading': store.isLoading }"
            :readonly="store.isLoading"
            rows="3"
            aria-label="Message input"
            @keydown="handleKeydown"
          ></textarea>
        </div>
        <div class="chat-input-actions">
          <label
            v-if="store.supportsVision"
            class="p-button u-no-margin--bottom"
            :class="{ 'is-disabled': store.isLoading }"
            title="Attach an image"
            role="button"
            :tabindex="store.isLoading ? -1 : 0"
            @keydown.enter.prevent="fileInput?.click()"
            @keydown.space.prevent="fileInput?.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              aria-hidden="true"
              :disabled="store.isLoading"
              @change="handleImageUpload"
            />
            &#128392; Attach
          </label>
          <button
            v-if="!store.isLoading"
            :disabled="!userInput.trim() && !attachedImage"
            class="p-button--positive u-no-margin--bottom"
            @click="handleSend"
          >
            Send
          </button>
          <button
            v-else
            class="p-button--negative u-no-margin--bottom"
            aria-label="Cancel generation"
            @click="emit('cancel')"
          >
            Cancel
          </button>
        </div>
      </div>

      <p class="chat-input-hint u-text--muted">
        <small>Enter to send &nbsp;&bull;&nbsp; Shift+Enter for new line</small>
      </p>
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

.chat-input-image-thumb {
  max-height: 60px;
  max-width: 120px;
  object-fit: contain;
  border-radius: 0.2rem;
  cursor: zoom-in;
}

.chat-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.chat-input-field {
  flex: 1;
}

.chat-textarea {
  width: 100%;
  resize: vertical;
  margin-bottom: 0;
  min-height: 2.5rem;
  max-height: 10rem;
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
  flex-direction: column;
  gap: 0.4rem;
  flex-shrink: 0;
}

.chat-input-actions > * {
  width: 100%;
}

.chat-input-actions label.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.thinking-switch {
  margin-bottom: 0;
}

.thinking-switch .p-switch__label {
  display: inline-block;
  width: auto;
  overflow: visible;
  white-space: nowrap;
  text-overflow: unset;
}

.chat-input-hint {
  margin: 0.25rem 0 0;
  color: #767676;
}

.attach-button {
  opacity: 0.6;
  transition: opacity 0.15s;
  cursor: pointer;
}

.attach-button:hover {
  opacity: 1;
}

@media (max-width: 600px) {
  .chat-input-actions {
    flex-direction: row;
  }
}
</style>

