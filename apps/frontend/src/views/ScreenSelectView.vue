<script setup lang="ts">
import { computed } from 'vue'

import { WARDS } from '../demo/fixtures.ts'
import LayoutThumbnail from '../features/workspace/components/LayoutThumbnail.vue'
import { selectLayout } from '../features/workspace/initial-layouts.ts'
import { useAuthStore } from '../stores/auth.ts'
import { useLayoutsStore } from '../stores/layouts.ts'
import { useWorkspaceStore } from '../stores/workspace.ts'
const auth = useAuthStore()
const workspace = useWorkspaceStore()
const layouts = useLayoutsStore()
const visible = computed(() =>
  layouts.layouts.filter((layout) => layout.roleId === null || layout.roleId === auth.user?.roleId),
)
const active = computed(() =>
  selectLayout(layouts.layouts, auth.user?.roleId || null, workspace.wardId),
)
const exists = (wardId: string | null) =>
  visible.value.some((layout) => layout.roleId === auth.user?.roleId && layout.wardId === wardId)
const wardName = computed(() => WARDS.find((ward) => ward.id === workspace.wardId)?.name)
</script>
<template>
  <section class="screen-settings">
    <header>
      <v-btn to="/work" variant="text" prepend-icon="mdi-arrow-left">業務画面へ</v-btn>
      <h1>業務画面設定</h1>
    </header>
    <p class="description">
      {{ auth.user?.roleName }}の設定を編集します。病棟別 → 全病棟共通 → 病院全体の順に適用します。
    </p>
    <div class="add-actions">
      <v-btn
        to="/settings/screens/new?scope=all"
        :disabled="exists(null)"
        prepend-icon="mdi-plus"
        variant="outlined"
        >全病棟共通を追加</v-btn
      >
      <v-btn
        to="/settings/screens/new?scope=ward"
        :disabled="!workspace.wardId || exists(workspace.wardId)"
        prepend-icon="mdi-plus"
        variant="outlined"
        >{{ wardName || '端末病棟' }}の設定を追加</v-btn
      >
      <span>現在有効な配置を複製して編集できます。</span>
    </div>
    <div class="layout-list">
      <v-card v-for="layout in visible" :key="layout.id" class="layout-card" variant="flat" border>
        <div class="card-title">
          <h2>{{ layout.name }}</h2>
          <div>
            <v-chip v-if="active.id === layout.id" size="small" color="primary">使用中</v-chip>
            <v-chip v-if="!layout.roleId" size="small">参照のみ</v-chip>
          </div>
        </div>
        <LayoutThumbnail :items="layout.items" />
        <v-btn
          :to="{ name: 'screen-edit', params: { screenId: layout.id } }"
          block
          variant="tonal"
          :prepend-icon="layout.roleId ? 'mdi-pencil-outline' : 'mdi-eye-outline'"
          >{{ layout.roleId ? '編集する' : '参照する' }}</v-btn
        >
      </v-card>
    </div>
  </section>
</template>
<style scoped>
.screen-settings {
  padding: 24px;
  overflow: auto;
  flex: 1;
}
header,
.add-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
h1 {
  margin: 0;
  font-size: 22px;
}
.description {
  margin: 16px 0;
  color: #53655f;
}
.add-actions {
  margin-bottom: 24px;
}
.add-actions span {
  font-size: 13px;
  color: #53655f;
}
.layout-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 18px;
}
.layout-card {
  padding: 18px;
  max-width: 600px;
}
.card-title {
  min-height: 76px;
}
h2 {
  font-size: 17px;
  margin-bottom: 8px;
}
.layout-card .v-btn {
  margin-top: 16px;
}
</style>
