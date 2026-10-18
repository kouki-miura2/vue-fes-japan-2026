<template>
  <WidgetCard
    title="注射・輸液指示"
    :meta="`体重 ${props.display.patient?.weightKg ?? '未測定'} kg・サンプル換算`"
  >
    <div v-if="p.pumps.length" class="tbl">
      <div class="tr th">
        <span>ポンプ</span><span>薬剤</span><span class="r">流量 mL/h</span><span>投与量</span
        ><span class="r">終了予定</span>
      </div>
      <div class="rows">
        <div v-for="u in p.pumps" :key="u[0]" class="tr" :class="{ crit: u[8] === 'crit' }">
          <span class="pump">{{ u[0] }}</span>
          <span class="drug"
            >{{ u[1]
            }}<small class="details">{{ u[2] }}<br />残量 {{ u[5] }} / {{ u[6] }} mL</small></span
          >
          <span class="r rate">{{ u[3] }}</span>
          <span class="dose">{{ u[4] }}</span>
          <span class="end">
            <span class="et" :class="{ 'lvfg-crit': u[8] === 'crit' }">{{ u[7] }}</span>
            <v-progress-linear
              v-if="u[6] > 0 && Number.isFinite(u[5])"
              :model-value="(u[5] / u[6]) * 100"
              :color="u[8] === 'crit' ? 'error' : 'primary'"
              bg-color="#C9D1CE"
              height="6"
              rounded
            />
          </span>
        </div>
      </div>
    </div>
    <div v-else class="empty">{{ p.infNote || '持続注射・輸液の指示なし' }}</div>
    <p v-for="note in p.inter" :key="note">{{ note }}</p>
    <div class="lines">
      <v-chip v-for="l in lines" :key="l[0]" :color="vColor(l[2])" variant="tonal"
        ><span class="b">{{ l[0] }}</span
        >　{{ l[1] }}</v-chip
      >
    </div>
  </WidgetCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { vColor } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)
const lines = computed(() => p.value.lines)
</script>

<style scoped>
.details {
  display: block;
  font-size: 16px;
  font-weight: 400;
  color: #5e6a67;
}

.tbl {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.rows {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
.tr {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr) 80px 110px 70px;
  column-gap: 8px;
  align-items: center;
  min-height: 48px;
  border-bottom: 1px solid #eef1f0;
  padding: 0 4px;
}
.th {
  min-height: 28px;
  color: #5e6a67;
  border-bottom-color: #d3dad7;
}
.tr.crit {
  background: #fff6f5;
}
.r {
  text-align: right;
}
.pump {
  font-weight: 700;
  color: #4a5653;
}
.drug {
  font-weight: 700;
  line-height: 1.25;
}
.rate {
  font-size: 22px;
  font-weight: 700;
}
.dose {
  line-height: 1.3;
}
.end {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 3px;
  text-align: right;
}
.et {
  font-weight: 700;
}
.empty {
  flex: 1;
  border: 1.5px dashed #c9d1ce;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5653;
  padding: 12px;
  text-align: center;
  line-height: 1.5;
}
.lines {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
