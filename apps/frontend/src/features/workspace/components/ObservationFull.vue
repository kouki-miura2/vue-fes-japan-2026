<template>
  <WidgetCard title="観察項目（バイタルサイン・症状・体重・尿量・飲水量）" :meta="p.vt">
    <div class="of">
      <div class="col">
        <VitalSigns :items="p.vit" :columns="3" />
        <div>
          <div v-for="s in p.sym" :key="s[0]" class="dotrow">
            <span class="ink2">{{ s[0] }}</span
            ><span class="b r" :class="fg(s[2])">{{ s[1] }}</span>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="hd">
          <span class="lbl b">体重</span
          ><span class="b" :class="fg(p.wtDir)">{{
            bars.length > 1 ? p.wtDelta : '推移未取得'
          }}</span>
        </div>
        <p v-if="!bars.length" class="lbl">体重履歴なし</p>
        <div class="bars" :style="{ gridTemplateColumns: `repeat(${bars.length || 1}, 1fr)` }">
          <div v-for="w in bars" :key="w.d" class="bar">
            <span :class="{ b: w.last }">{{ w.v }}</span>
            <div class="fill" :class="{ last: w.last }" :style="{ height: w.h }"></div>
          </div>
        </div>
        <div class="days" :style="{ gridTemplateColumns: `repeat(${bars.length || 1}, 1fr)` }">
          <span v-for="w in bars" :key="w.d">{{ w.d }}</span>
        </div>
        <p v-if="bars.length" class="lbl">{{ p.wtTarget }}</p>
        <div class="lbl b io-h">水分出納 {{ io ? `（${io.d}・確定日）` : '未取得' }}</div>
        <div v-if="io" class="io">
          <span class="ink2">IN</span><span class="r">{{ io.i }} mL</span>
          <span class="ink2">尿量</span><span class="r">{{ io.o }} mL</span>
          <span class="ink2">バランス</span
          ><span class="r b" :class="{ 'lvfg-warn': io.pos }">{{ io.b }} mL</span>
        </div>
        <div class="lbl">{{ p.ioNote }}</div>
      </div>
    </div>
  </WidgetCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { fg } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import VitalSigns from './VitalSigns.vue'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)
const bars = computed(() => {
  const values = p.value.wt.filter((row) => Number.isFinite(row[1]))
  const min = Math.min(...values.map((row) => row[1]))
  const max = Math.max(...values.map((row) => row[1]))
  return values.map((row, index) => ({
    d: row[0],
    v: row[1].toFixed(1),
    last: index === values.length - 1,
    h: `${10 + ((row[1] - min) / (max - min || 1)) * 40}px`,
  }))
})
const io = computed(() => {
  const row = [...p.value.io].reverse().find((entry) => !entry[0].endsWith('*'))
  if (!row) return null
  const balance = row[1] - row[2]
  return {
    d: row[0],
    i: row[1].toLocaleString('ja-JP'),
    o: row[2].toLocaleString('ja-JP'),
    b: `${balance > 0 ? '+' : balance < 0 ? '−' : ''}${Math.abs(balance).toLocaleString('ja-JP')}`,
    pos: balance > 0,
  }
})
</script>

<style scoped>
.of {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 16px;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.lbl {
  color: #5e6a67;
}
.vit {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
.tile {
  padding: 4px 8px;
}
.val {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 3px;
  line-height: 1.2;
}
.big {
  font-size: 24px;
  font-weight: 700;
  white-space: nowrap;
}
.r {
  text-align: right;
}
.hd {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.bars {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
  align-items: end;
  height: 78px;
  border-bottom: 1px solid #c9d1ce;
}
.bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.fill {
  width: 100%;
  max-width: 28px;
  border-radius: 4px 4px 0 0;
  background: #b9d6d2;
}
.fill.last {
  background: #0e6e66;
}
.days {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
  text-align: center;
  margin-top: -6px;
  color: #5e6a67;
  letter-spacing: -0.03em;
}
.io-h {
  margin-top: 2px;
}
.io {
  display: grid;
  grid-template-columns: auto 1fr;
  row-gap: 0;
  margin-top: -6px;
}
</style>
