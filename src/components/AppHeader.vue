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
              class="p-navigation__link p-button--base has-icon"
              :aria-expanded="store.isSettingsPanelOpen"
              :aria-label="store.isSettingsPanelOpen ? 'Hide settings' : 'Show settings'"
              title="Settings"
              @click="store.isSettingsPanelOpen = !store.isSettingsPanelOpen"
            >
              <i class="p-icon--settings"></i>
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
              class="p-navigation__link p-button--base has-icon"
              :aria-expanded="store.isSettingsPanelOpen"
              :aria-label="store.isSettingsPanelOpen ? 'Hide settings' : 'Show settings'"
              title="Settings"
              @click="store.isSettingsPanelOpen = !store.isSettingsPanelOpen"
            >
              <i class="p-icon--settings"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
