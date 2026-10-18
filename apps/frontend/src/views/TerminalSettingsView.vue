<script setup lang="ts">
import { computed, ref } from 'vue'

import { WARDS } from '../demo/fixtures.ts'
import { useNotificationStore } from '../stores/notification.ts'
import { useWorkspaceStore } from '../stores/workspace.ts'
const workspace = useWorkspaceStore()
const notification = useNotificationStore()
const ward = computed(() => WARDS.find((entry) => entry.id === workspace.wardId))
const selectionVersion = ref(0)
const selectWard = (value: unknown) => {
  if (value === workspace.wardId) return
  const success = workspace.saveWard(value)
  // Reset native radio state when storage rejects the new choice.
  if (!success) selectionVersion.value += 1
  notification.show(
    success ? `設置病棟を「${ward.value?.name}」に更新しました` : workspace.storageError,
  )
}
</script>
<template>
  <section class="terminal">
    <header class="view-bar">
      <v-btn to="/work" variant="outlined" prepend-icon="mdi-arrow-left">業務画面へ戻る</v-btn>
      <h1>端末設定</h1>
    </header>
    <div class="terminal-body">
      <v-card color="secondary" class="current-ward"
        ><p>この端末の設置病棟</p>
        <div class="floor">{{ ward?.floor }}</div>
        <h2>{{ ward?.name || '病棟未設定' }}</h2>
        <p>ログイン画面の病棟名と、職種に対応する業務画面の選択に使われます。</p></v-card
      >
      <div>
        <h2 class="list-title">病棟一覧（病棟マスタ）</h2>
        <v-alert v-if="workspace.storageError" type="error" class="mb-4">{{
          workspace.storageError
        }}</v-alert>
        <v-radio-group
          :key="selectionVersion"
          :model-value="workspace.wardId"
          aria-label="設置病棟"
          @update:model-value="selectWard"
          ><v-radio
            v-for="item in WARDS"
            :key="item.id"
            :value="item.id"
            color="primary"
            class="ward-option"
            ><template #label
              ><span
                ><span class="ward-floor">{{ item.floor }}</span
                ><strong>{{ item.name }}</strong></span
              ></template
            ></v-radio
          ></v-radio-group
        >
      </div>
    </div>
  </section>
</template>
<style scoped>
.terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.view-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  border-bottom: 1px solid #d3dad7;
  padding: 12px 16px;
}
h1 {
  font-size: 22px;
  margin: 0;
}
.terminal-body {
  display: grid;
  grid-template-columns: 400px minmax(0, 1fr);
  gap: 24px;
  padding: 28px 32px;
  overflow: auto;
}
.current-ward {
  padding: 28px;
  align-self: start;
}
.current-ward p {
  color: #d6e8e5;
  margin: 0;
  line-height: 1.6;
}
.floor {
  margin-top: 16px;
  font-size: 21px;
}
.current-ward h2 {
  margin: 4px 0 16px;
  font-size: 34px;
  line-height: 1.3;
}
.list-title {
  margin: 0 0 12px;
  font-size: 18px;
  color: #4a5653;
}
.ward-option {
  min-height: 80px;
  padding: 12px 20px;
  margin-bottom: 10px;
  background: white;
  border: 1px solid #c9d1ce;
  border-radius: 10px;
}
.ward-option :deep(.v-label) {
  opacity: 1;
}
.ward-option strong {
  display: block;
  font-size: 22px;
}
.ward-floor {
  color: #5e6a67;
}
@media (max-width: 1100px) {
  .terminal-body {
    grid-template-columns: 320px minmax(0, 1fr);
  }
}
</style>
