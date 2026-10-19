<script setup lang="ts">
import { computed, ref } from 'vue'

import { usePatientQuery } from '../composables/usePatientQuery.ts'
import { WARDS } from '../demo/fixtures.ts'
import { CATALOG } from '../features/workspace/catalog.ts'
import WidgetHost from '../features/workspace/components/WidgetHost.vue'
import type { PatientDisplay } from '../features/workspace/types.ts'

defineProps<{ now: Date }>()
const selectedId = ref<string | null>(null)
// A widget's chunk is fetched once; later clicks reuse the cached module without a request.
const loaded = ref(new Set<string>())
const select = (id: string) => {
  selectedId.value = id
  loaded.value.add(id)
}
const selected = computed(() => CATALOG.find((entry) => entry.id === selectedId.value))
const query = usePatientQuery(
  computed(() => ({
    patientId: WARDS.find((ward) => ward.id === 'c5e')?.patientId || null,
    scenario: 'normal' as const,
  })),
)
const display = computed<PatientDisplay>(() => ({
  status: query.status.value,
  patient: query.data.value || null,
  error: query.error.value?.message,
  scenario: 'normal',
}))
</script>

<template>
  <section class="lazy-demo">
    <header>
      <p class="eyebrow">DEVELOPMENT · LAZY LOADING</p>
      <h1>動的コンポーネントと遅延読み込みの確認</h1>
      <p>
        開発者ツールのネットワークタブを開いてからボタンを押すと、対応する .vue
        ファイルが初回だけ読み込まれ、その後に描画されます。
      </p>
    </header>
    <nav class="buttons" aria-label="表示するコンポーネント">
      <v-btn
        v-for="entry in CATALOG"
        :key="entry.id"
        :variant="entry.id === selectedId ? 'flat' : 'outlined'"
        color="primary"
        :append-icon="loaded.has(entry.id) ? 'mdi-check' : undefined"
        @click="select(entry.id)"
        >{{ entry.short }}</v-btn
      >
    </nav>
    <section class="preview">
      <template v-if="selected">
        <h2>
          {{ selected.name }}
          <v-chip size="small">{{ selected.width }}×{{ selected.height }}</v-chip>
        </h2>
        <div class="stage">
          <div
            class="widget"
            :style="{
              width: `${310 * selected.width + 8 * (selected.width - 1)}px`,
              height: `${358 * selected.height + 8 * (selected.height - 1)}px`,
            }"
          >
            <WidgetHost :component-id="selected.id" :display="display" :now="now" />
          </div>
        </div>
      </template>
      <p v-else class="empty">上のボタンを押すと、ここにコンポーネントを読み込んで表示します。</p>
    </section>
  </section>
</template>

<style scoped>
.lazy-demo {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
h1 {
  font-size: 26px;
}
h2 {
  font-size: 18px;
  margin-bottom: 12px;
}
.eyebrow {
  font-size: 14px;
  color: #0e6e66;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.buttons {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.buttons .v-btn {
  min-width: 0;
}
.buttons :deep(.v-btn__content) {
  overflow: hidden;
  text-overflow: ellipsis;
}
.preview {
  padding: 16px;
  min-height: 420px;
  background: #f6f8f7;
  border-radius: 10px;
}
.stage {
  overflow: auto;
}
.widget {
  flex: none;
}
.empty {
  color: #5e6a67;
}
</style>
