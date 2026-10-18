<template>
  <WidgetCard title="前回退院日・入院日・退院予定日">
    <div class="d">
      <div class="lbl">前回退院日</div>
      <div class="dt">
        {{ dateText(p.dates.prev, p.dates.prev === '—' ? '前回退院なし' : '未登録') }}
      </div>
      <div class="ink2">
        {{
          admission && previous
            ? `今回入院まで ${diffInDays(admission, previous)}日`
            : p.dates.prevSub || '前回退院日未登録'
        }}
      </div>
    </div>
    <div class="d">
      <div class="lbl">入院日</div>
      <div class="dt">{{ dateText(p.dates.adm, '未登録') }}</div>
      <div class="sub">
        {{
          admission && diffInDays(props.now, admission) >= 0
            ? `入院 ${diffInDays(props.now, admission) + 1}日目`
            : '入院日を確認してください'
        }}
      </div>
    </div>
    <div class="d">
      <div class="lbl">退院予定日</div>
      <div class="line">
        <span class="dt">{{ dateText(p.dates.plan) }}</span
        ><span class="sub">{{ remainingDays(p.dates.plan, props.now) }}</span>
      </div>
    </div>
    <div class="dpc">
      <div class="ink2">{{ p.dates.dpc }}（サンプル）</div>
      <v-progress-linear
        :model-value="p.dates.dpcPct"
        :color="p.dates.dpcL === 'warn' ? '#D08A12' : 'primary'"
        bg-color="#C9D1CE"
        bg-opacity="0.5"
        height="10"
        rounded
      />
    </div>
  </WidgetCard>
</template>

<script setup lang="ts">
import { diffInDays } from 'utils'
import { computed } from 'vue'

import { calendarDate, dateText, remainingDays } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)

const admission = computed(() => calendarDate(p.value.dates.adm))
const previous = computed(() => calendarDate(p.value.dates.prev))
</script>

<style scoped>
.lbl {
  color: #5e6a67;
}
.d {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.dt {
  font-size: 22px;
  font-weight: 700;
}
.line {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.sub {
  font-weight: 700;
  color: #0e5f58;
}
.dpc {
  margin-top: auto;
  border-top: 1px solid #e6eae8;
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  line-height: 1.35;
}
</style>
