<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

import { useLayoutEditor } from '../composables/useLayoutEditor.ts'
import { usePatientQuery } from '../composables/usePatientQuery.ts'
import { WARDS } from '../demo/fixtures.ts'
import { CATALOG } from '../features/workspace/catalog.ts'
import LayoutCanvas from '../features/workspace/components/LayoutCanvas.vue'
import WidgetPreview from '../features/workspace/components/WidgetPreview.vue'
import { selectLayout } from '../features/workspace/initial-layouts.ts'
import { validateLayout } from '../features/workspace/layout.ts'
import { copyLayout, layoutName } from '../features/workspace/settings.ts'
import type { PatientDisplay } from '../features/workspace/types.ts'
import { useAuthStore } from '../stores/auth.ts'
import { useLayoutsStore } from '../stores/layouts.ts'
import { useNotificationStore } from '../stores/notification.ts'
import { useWorkspaceStore } from '../stores/workspace.ts'

defineProps<{ now: Date }>()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const layouts = useLayoutsStore()
const workspace = useWorkspaceStore()
const notifications = useNotificationStore()
const editor = useLayoutEditor(() => auth.user?.roleId || null)
const { draft, baseline, selected, target, readOnly, dirty, ghost, replaced } = editor
const saveError = ref('')
const selectComponent = (id: string) => {
  selected.value = selected.value === id ? null : id
  target.value = null
}
const replacedNames = computed(() =>
  replaced.value.map((id) => CATALOG.find((entry) => entry.id === id)?.name).join('、'),
)
const scopeOptions = [
  { title: '全病棟共通', value: 'all' },
  ...WARDS.map((ward) => ({ title: ward.name, value: ward.id })),
]
const selectedScope = computed({
  get: () => draft.value?.wardId || 'all',
  set: (value: string) => {
    if (!draft.value || readOnly.value) return
    const wardId = WARDS.find((ward) => ward.id === value)?.id
    if (value === 'all' || wardId) draft.value.wardId = wardId || null
  },
})
const validationError = computed(() => {
  if (!draft.value) return ''
  if (
    layouts.layouts.some(
      (layout) =>
        layout.id !== draft.value!.id &&
        layout.roleId === draft.value!.roleId &&
        layout.wardId === draft.value!.wardId,
    )
  )
    return '同じ職種・病棟の設定が既にあります。'
  try {
    validateLayout(draft.value.items, CATALOG)
    return ''
  } catch {
    return '配置が不正です。'
  }
})
const load = () => {
  saveError.value = ''
  const roleId = auth.user?.roleId
  if (!roleId) return
  if (route.name === 'screen-new') {
    if (
      !['all', 'ward'].includes(String(route.query.scope)) ||
      (route.query.scope === 'ward' && !workspace.wardId)
    ) {
      void router.replace('/settings/screens')
      return
    }
    const wardId = route.query.scope === 'ward' ? workspace.wardId : null
    const duplicate = layouts.layouts.find(
      (layout) => layout.roleId === roleId && layout.wardId === wardId,
    )
    if (duplicate) {
      void router.replace({ name: 'screen-edit', params: { screenId: duplicate.id } })
      return
    }
    const clone = copyLayout(selectLayout(layouts.layouts, roleId, workspace.wardId))
    editor.start(
      { ...clone, id: crypto.randomUUID(), roleId, wardId, name: layoutName({ roleId, wardId }) },
      true,
    )
  } else {
    const layout = layouts.layouts.find((entry) => entry.id === route.params.screenId)
    if (!layout || (layout.roleId !== null && layout.roleId !== roleId)) {
      void router.replace('/settings/screens')
      return
    }
    editor.start(layout)
  }
}
watch(() => [route.name, route.params.screenId, route.query.scope], load, { immediate: true })
const query = usePatientQuery(() => ({
  patientId: WARDS.find((ward) => ward.id === workspace.wardId)?.patientId || null,
  scenario: 'normal',
}))
const display = computed<PatientDisplay>(() => ({
  status: query.status.value,
  patient: query.data.value || null,
  error: query.error.value?.message,
}))
const save = () => {
  if (!draft.value || readOnly.value || !dirty.value || validationError.value) return
  if (!layouts.save(draft.value, baseline.value)) {
    saveError.value = `保存できませんでした。${layouts.error}`
    return
  }
  const id = draft.value.id
  editor.start(layouts.layouts.find((layout) => layout.id === id)!)
  saveError.value = ''
  notifications.show('業務画面設定を保存しました。')
  if (route.name === 'screen-new')
    void router.replace({ name: 'screen-edit', params: { screenId: id } })
}
const discardOpen = ref(false)
let pending: Promise<boolean> | null = null
let resolvePending: ((value: boolean) => void) | null = null
const confirmLeave = () => {
  if (!dirty.value) return true
  if (!pending) {
    discardOpen.value = true
    pending = new Promise<boolean>((resolve) => {
      resolvePending = resolve
    })
  }
  return pending
}
const finishLeave = (discard: boolean) => {
  if (discard) editor.discard()
  discardOpen.value = false
  resolvePending?.(discard)
  resolvePending = null
  pending = null
}
onBeforeRouteLeave(confirmLeave)
onBeforeRouteUpdate(confirmLeave)
const cancel = () => {
  editor.discard()
  void router.push('/settings/screens')
}
const beforeUnload = (event: BeforeUnloadEvent) => {
  if (dirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onScopeDispose(() => {
  window.removeEventListener('beforeunload', beforeUnload)
  resolvePending?.(false)
})
</script>
<template>
  <section v-if="draft" class="layout-editor">
    <header class="editor-header">
      <v-btn
        to="/settings/screens"
        variant="text"
        icon="mdi-arrow-left"
        aria-label="業務画面一覧へ"
      />
      <div class="editor-heading">
        <h1>{{ readOnly ? '業務画面の参照' : '業務画面の編集' }}</h1>
        <span>{{ readOnly ? draft.name : layoutName(draft) }}</span>
      </div>
      <v-chip :color="dirty ? 'warning' : undefined" size="small">{{
        readOnly ? '参照のみ' : dirty ? '編集中・未保存' : '未編集'
      }}</v-chip>
      <v-spacer />
      <v-btn variant="outlined" @click="cancel">{{ readOnly ? '一覧へ戻る' : '取消' }}</v-btn>
      <v-btn v-if="!readOnly" color="primary" :disabled="!dirty || !!validationError" @click="save"
        >決定</v-btn
      >
    </header>
    <v-alert
      v-if="saveError || validationError"
      type="error"
      density="compact"
      class="editor-error"
      >{{ saveError || validationError }}</v-alert
    >
    <div class="editor-body">
      <aside class="component-panel">
        <h2>コンポーネント <small>14種類</small></h2>
        <div class="component-list">
          <div
            v-for="entry in CATALOG"
            :key="entry.id"
            class="component-entry"
            :class="{ active: selected === entry.id }"
          >
            <button
              :data-select-component="entry.id"
              :aria-pressed="selected === entry.id"
              @click="selectComponent(entry.id)"
            >
              <span class="size-glyph" aria-hidden="true"
                ><i :style="{ width: `${entry.width * 12}px`, height: `${entry.height * 12}px` }"
              /></span>
              <span class="component-name">{{ entry.name }}</span>
              <small
                >{{ entry.width }}×{{ entry.height
                }}<b v-if="draft.items.some((item) => item.componentId === entry.id)"
                  >配置済</b
                ></small
              >
            </button>
            <section v-if="selected === entry.id" class="overview">
              <p>{{ entry.description }}</p>
              <p>固定サイズ：{{ entry.width }}列 × {{ entry.height }}行</p>
              <WidgetPreview :component-id="entry.id" :display="display" :now="now" preview />
              <v-btn
                v-if="!readOnly && draft.items.some((item) => item.componentId === entry.id)"
                block
                variant="outlined"
                color="error"
                class="mt-3"
                @click="editor.remove(entry.id)"
                >配置を外す</v-btn
              >
            </section>
          </div>
        </div>
      </aside>
      <main class="placement-panel">
        <div class="scope-row">
          <h2>配置プレビュー</h2>
          <v-select
            v-if="!readOnly"
            v-model="selectedScope"
            :items="scopeOptions"
            label="適用する病棟"
            density="compact"
            hide-details
            variant="outlined"
          /><v-chip v-else>病院全体・固定</v-chip>
        </div>
        <p class="guide" aria-live="polite">
          {{
            readOnly
              ? '病院全体の設定は参照のみです。自職種の設定として複製できます。'
              : selected
                ? '配置先をタップしてください。同じ種類は移動し、重なる部品全体を置き換えます。'
                : '左から種類を選び、右のセルに配置してください。×で配置を外せます。'
          }}
        </p>
        <LayoutCanvas
          :items="draft.items"
          :saved-items="baseline?.items || []"
          :display="display"
          :now="now"
          :selected="selected"
          :ghost="ghost"
          :replaced="replaced"
          :read-only="readOnly"
          @target="target = $event"
          @place="editor.place"
          @remove="editor.remove"
        />
        <p v-if="replaced.length" class="replacement-note" aria-live="polite">
          置き換え対象：{{ replacedNames }}
        </p>
        <p class="preview-note">
          1280×800の業務画面を縮小表示しています。プレビュー内の与薬・点検操作は無効です。
        </p>
      </main>
    </div>
    <v-dialog v-model="discardOpen" persistent max-width="440"
      ><v-card title="変更を破棄しますか？" text="未保存のレイアウト変更は失われます。"
        ><v-card-actions
          ><v-btn @click="finishLeave(false)">編集を続ける</v-btn
          ><v-btn color="error" @click="finishLeave(true)">破棄して移動</v-btn></v-card-actions
        ></v-card
      ></v-dialog
    >
  </section>
</template>
<style scoped>
.layout-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.editor-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  background: white;
  border-bottom: 1px solid #ced9d3;
  flex: none;
}
.editor-heading h1 {
  margin: 0;
  font-size: 19px;
}
.editor-heading span {
  font-size: 12px;
  color: #53655f;
}
.editor-body {
  display: flex;
  flex: 1;
  min-height: 0;
}
.component-panel {
  width: 340px;
  flex: none;
  background: white;
  overflow: auto;
  padding: 18px;
  border-right: 1px solid #ced9d3;
}
h2 {
  margin: 0;
  font-size: 17px;
}
h2 small {
  font-size: 12px;
  color: #64766d;
  font-weight: 400;
}
.editor-header .v-btn {
  min-height: 44px;
}
.component-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 14px 0;
}
.component-entry {
  border: 1px solid transparent;
  border-radius: 8px;
}
.component-entry.active {
  border-color: #0e6e66;
  background: #eef6f5;
}
.component-entry > button {
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 8px;
  text-align: left;
  min-height: 52px;
  font-size: 15px;
  line-height: 1.4;
  border-radius: 7px;
}
.component-name {
  flex: 1;
  min-width: 0;
}
.size-glyph {
  width: 27px;
  flex: none;
  display: flex;
  justify-content: center;
}
.size-glyph i {
  display: block;
  background: #9ab5b1;
  border-radius: 2px;
}
.active .size-glyph i {
  background: #0e6e66;
}
.component-entry small {
  flex: none;
  text-align: right;
  color: #63746d;
  font-size: 12px;
}
.component-entry b {
  display: block;
  font-size: 11px;
  color: #0e6e66;
  margin-top: 4px;
}
.overview {
  font-size: 14px;
  color: #53655f;
  padding: 0 12px 14px;
}
.overview p {
  margin: 8px 0 12px;
}
.placement-panel {
  flex: 1;
  min-width: 0;
  padding: 20px;
  overflow: auto;
}
.scope-row {
  display: flex;
  align-items: center;
  gap: 20px;
}
.scope-row .v-select {
  max-width: 290px;
  margin-left: auto;
}
.guide {
  font-size: 13px;
  color: #3b5b4f;
  margin: 18px 0 12px;
  min-height: 40px;
}
.preview-note {
  font-size: 12px;
  color: #64766d;
  margin-top: 16px;
}
.replacement-note {
  font-size: 13px;
  color: #a83c22;
  margin-top: 12px;
}
.editor-error {
  flex: none;
  margin: 8px 18px;
}
@media (max-width: 1100px) {
  .component-panel {
    width: 300px;
    padding: 12px;
  }
  .placement-panel {
    padding: 14px;
  }
  .editor-header {
    gap: 8px;
  }
}
</style>
