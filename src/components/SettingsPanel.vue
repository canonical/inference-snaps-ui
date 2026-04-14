<script setup lang="ts">
import { useChatStore } from '@/stores/chat'

const store = useChatStore()
</script>

<template>
  <aside
    v-show="store.isSettingsPanelOpen"
    class="settings-panel p-strip--light u-no-padding--top u-no-padding--bottom"
  >
    <div class="row">
      <div class="col-12">
        <div class="settings-content">
          <h4 class="u-no-margin--bottom">Settings</h4>

          <table class="p-table--mobile-card settings-table" aria-label="Settings">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-heading="Setting"><strong>Engine</strong></td>
                <td data-heading="Value">
                  <code>{{ store.config.engineName }}</code>
                </td>
              </tr>
              <tr>
                <td data-heading="Setting"><strong>API Endpoint</strong></td>
                <td data-heading="Value">
                  <code>{{ store.config.openAIBaseURL }}</code>
                </td>
              </tr>
              <tr>
                <td data-heading="Setting"><strong>Model</strong></td>
                <td data-heading="Value">
                  <code v-if="store.modelName">{{ store.modelName }}</code>
                  <span v-else-if="store.modelError" class="u-text--muted">Unavailable</span>
                  <span v-else class="u-text--muted">Loading…</span>
                </td>
              </tr>
              <tr>
                <td data-heading="Setting"><strong>Capabilities</strong></td>
                <td data-heading="Value">
                  <div v-if="store.config.capabilities?.length" class="capabilities-list">
                    <span
                      v-for="cap in store.config.capabilities"
                      :key="cap"
                      class="p-status-label p-status-label--positive"
                    >{{ cap }}</span>
                  </div>
                  <span v-else class="p-status-label">none</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Model warning notification -->
          <div v-if="store.modelError" class="p-notification--caution" role="alert">
            <div class="p-notification__content">
              <p class="p-notification__message">
                Could not retrieve model name from the API: {{ store.modelError }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.settings-panel {
  border-bottom: 1px solid #d9d9d9;
  flex-shrink: 0;
}

.settings-content {
  padding: 0.75rem 0;
}

.settings-table {
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.settings-table td,
.settings-table th {
  padding: 0.4rem 0.75rem;
}

.capabilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.p-status-label {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #d9d9d9;
  color: #333;
}

.p-status-label--positive {
  background-color: #0e8420;
  color: #fff;
}
</style>

