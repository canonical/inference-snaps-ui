<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import cofWhite from '@/assets/CoF_white.svg'

const store = useChatStore()
</script>

<template>
  <header class="p-navigation" role="banner">
    <div class="p-navigation__row">
      <div class="p-navigation__banner">
        <div class="p-navigation__tagged-logo">
          <a class="p-navigation__link" href="#">
            <div class="p-navigation__logo-tag">
              <img class="p-navigation__logo-icon" :src="cofWhite" alt="" />
            </div>
            <span class="p-navigation__logo-title">{{ store.uiTitle }}</span>
          </a>
        </div>
        <ul class="p-navigation__items">
          <!-- Mobile view menu items -->
          <li class="p-navigation__item">
            <button
              class="p-navigation__link settings-toggle"
              :aria-expanded="store.isSettingsPanelOpen"
              :aria-label="store.isSettingsPanelOpen ? 'Hide settings' : 'Show settings'"
              title="Settings"
              @click="store.isSettingsPanelOpen = !store.isSettingsPanelOpen"
            >
              <i class="settings-toggle__icon" aria-hidden="true"></i>
            </button>
          </li>
        </ul>
      </div>
      <nav class="p-navigation__nav" aria-label="Main navigation">
        <ul class="p-navigation__items">
          <!-- Left aligned menu items -->
        </ul>
        <ul class="p-navigation__items">
          <!-- Right aligned menu items -->
          <li class="p-navigation__item">
            <button
              class="p-navigation__link settings-toggle"
              :aria-expanded="store.isSettingsPanelOpen"
              :aria-label="store.isSettingsPanelOpen ? 'Hide settings' : 'Show settings'"
              title="Settings"
              @click="store.isSettingsPanelOpen = !store.isSettingsPanelOpen"
            >
              <i class="settings-toggle__icon" aria-hidden="true"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.settings-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.settings-toggle:hover {
  opacity: 1;
}

.settings-toggle__icon {
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  /* Dark information SVG for the light navigation bar */
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 1a7 7 0 110 14A7 7 0 018 1zm0 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM8.75 7v5.02h-1.5V7h1.5zM8.5 3.944a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h1z' fill='%23000' fill-rule='nonzero'/%3E%3C/svg%3E");
}
</style>
