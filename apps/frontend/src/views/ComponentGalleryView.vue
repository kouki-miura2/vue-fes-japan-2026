<script setup lang="ts">
import { LIMITS } from 'utils'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { usePatientQuery } from '../composables/usePatientQuery.ts'
import { WARDS } from '../demo/fixtures.ts'
import type { PatientScenario } from '../demo/types.ts'
import { CATALOG } from '../features/workspace/catalog.ts'
import LayoutGrid from '../features/workspace/components/LayoutGrid.vue'
import WidgetHost from '../features/workspace/components/WidgetHost.vue'
import WidgetPreview from '../features/workspace/components/WidgetPreview.vue'
import { placeComponent, layoutKey } from '../features/workspace/layout.ts'
import type { PatientDisplay, Placement } from '../features/workspace/types.ts'
import { useNotificationStore } from '../stores/notification.ts'
import { useWorkspaceStore } from '../stores/workspace.ts'

defineProps<{ now: Date }>()
const workspace = useWorkspaceStore()
const notification = useNotificationStore()
const route = useRoute()
const allowedStates: PatientScenario[] = [
  'normal',
  'empty',
  'error',
  'loading',
  'missing',
  'long',
  'sparse',
]
const scenario = ref<PatientScenario>(
  allowedStates.find((state) => state === route.query.state) || 'normal',
)
const requestedWard = WARDS.find((ward) => ward.id === route.query.ward)
const galleryWardId = ref(requestedWard?.id || workspace.wardId || 'c5e')
const selectedId = ref(CATALOG.find((entry) => entry.id === route.query.component)?.id || 'patient')
const items = ref<Placement[]>([{ componentId: 'patient', column: 0, row: 0 }])
const original = layoutKey(items.value)
const selected = computed(
  () => CATALOG.find((entry) => entry.id === selectedId.value) || CATALOG[0],
)
const request = computed(() => ({
  patientId: WARDS.find((ward) => ward.id === galleryWardId.value)?.patientId || null,
  scenario: scenario.value,
}))
const query = usePatientQuery(request)
const display = computed<PatientDisplay>(() => ({
  status: query.status.value,
  patient: query.data.value || null,
  error: query.error.value?.message,
  scenario: scenario.value,
}))
const scenarios = [
  { title: '通常', value: 'normal' },
  { title: '患者なし', value: 'empty' },
  { title: '取得エラー', value: 'error' },
  { title: '読み込み中', value: 'loading' },
  { title: '欠損値', value: 'missing' },
  { title: '長い内容', value: 'long' },
  { title: '空の項目・履歴なし', value: 'sparse' },
]
const cells = Array.from({ length: LIMITS.layoutColumns * LIMITS.layoutRows }, (_, index) => ({
  column: index % LIMITS.layoutColumns,
  row: Math.floor(index / LIMITS.layoutColumns),
}))
const place = (column: number, row: number) => {
  items.value = placeComponent(items.value, { componentId: selectedId.value, column, row }, CATALOG)
  notification.show(`${selected.value.short}を配置しました（確認用・未保存）`)
}
const reset = () => {
  items.value = [{ componentId: 'patient', column: 0, row: 0 }]
}
</script>

<template>
  <section class="gallery">
    <header>
      <div>
        <p class="eyebrow">DEVELOPMENT · COMPONENT LAB</p>
        <h1>画面コンポーネントの確認</h1>
        <p>業務コンポーネントのデータ・表示・操作を確認できます。</p>
      </div>
      <v-chip color="info">保存しない開発用画面</v-chip>
    </header>
    <div class="controls">
      <v-select
        v-model="galleryWardId"
        label="確認する病棟"
        :items="WARDS"
        item-title="name"
        item-value="id"
        hide-details
      />
      <v-select v-model="scenario" label="データの状態" :items="scenarios" hide-details />
      <v-select
        v-model="selectedId"
        label="コンポーネント"
        :items="CATALOG"
        item-title="name"
        item-value="id"
        hide-details
      />
    </div>
    <nav class="scene-buttons" aria-label="職種別初期画面">
      <v-btn to="/dev/work?scene=doctor" variant="outlined">医師の初期画面</v-btn>
      <v-btn to="/dev/work?scene=pharm" variant="outlined">薬剤師の初期画面</v-btn>
      <v-btn to="/dev/work?scene=ce" variant="outlined">臨床工学技士の初期画面</v-btn>
      <v-btn to="/dev/work?scene=default" variant="outlined">病院全体の初期画面</v-btn>
    </nav>
    <div class="detail-row">
      <section class="description">
        <h2>{{ selected.name }}</h2>
        <p>{{ selected.description }}</p>
        <v-chip color="success">登録済み</v-chip>
        <p>定義サイズ {{ selected.width }}×{{ selected.height }}</p>
        <p>下の配置先を押すと、同じ種類は移動し、重なった部品は置き換わります。</p>
        <p>架空患者のデモデータです。記録の保存は行いません。</p>
      </section>
      <section>
        <h2>原寸（1280×800基準）</h2>
        <div class="raw-scroll">
          <div
            class="raw-widget"
            :style="{
              width: `${310 * selected.width + 8 * (selected.width - 1)}px`,
              height: `${358 * selected.height + 8 * (selected.height - 1)}px`,
            }"
          >
            <WidgetHost :component-id="selectedId" :display="display" :now="now" />
          </div>
        </div>
      </section>
      <section class="preview-panel">
        <h2>縮小プレビュー・操作不可</h2>
        <WidgetPreview :component-id="selectedId" :display="display" :now="now" />
      </section>
    </div>
    <section class="placement-panel">
      <div class="placement-title">
        <h2>動的グリッドの確認</h2>
        <v-chip :color="layoutKey(items) === original ? 'success' : 'warning'">{{
          layoutKey(items) === original ? '未変更' : '配置変更あり'
        }}</v-chip
        ><v-btn variant="outlined" @click="reset">初期配置へ戻す</v-btn
        ><v-btn variant="outlined" @click="items = []">すべて外す</v-btn>
      </div>
      <div class="position-buttons">
        <v-btn
          v-for="cell in cells"
          :key="`${cell.column}:${cell.row}`"
          variant="outlined"
          :aria-label="`${cell.row + 1}行${cell.column + 1}列に配置`"
          @click="place(cell.column, cell.row)"
          >{{ cell.row + 1 }}行 {{ cell.column + 1 }}列</v-btn
        >
      </div>
      <div class="board-scroll">
        <div class="board"><LayoutGrid :items="items" :display="display" :now="now" /></div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.scene-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.gallery {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 20px;
}
h1 {
  font-size: 26px;
}
h2 {
  font-size: 18px;
  margin-bottom: 12px;
}
p {
  margin-bottom: 10px;
}
.eyebrow {
  font-size: 14px;
  color: #0e6e66;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.controls {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 16px;
}
.detail-row {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(326px, 1.2fr) 296px;
  gap: 20px;
  align-items: start;
}
.description,
.preview-panel {
  padding: 16px;
  background: #f6f8f7;
  border-radius: 10px;
}
.raw-scroll {
  overflow: auto;
  max-height: 740px;
}
.raw-widget {
  flex: none;
}
.placement-title {
  display: flex;
  gap: 16px;
  align-items: baseline;
  flex-wrap: wrap;
}
.position-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 12px 0;
}
.board-scroll {
  overflow: auto;
  border: 1px solid #b9c2bf;
  border-radius: 10px;
}
.board {
  width: 1280px;
  height: 740px;
}
</style>
