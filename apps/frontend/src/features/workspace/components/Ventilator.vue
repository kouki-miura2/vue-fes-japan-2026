<template>
  <WidgetCard title="人工呼吸器指示" :meta="v ? v.since.split('・')[1] : ''" :scroll="!!v">
    <template v-if="v">
      <div class="mode">
        <span class="mt">{{ v.mode }}</span
        ><span class="ink2">IBW {{ v.ibw }} kg</span>
      </div>
      <section>
        <div class="sec">設定</div>
        <div class="set">
          <div v-for="s in v.set" :key="s[0]" class="si">
            <div class="lbl">{{ s[0].replace(/ .*/, '') }}</div>
            <div class="sv">
              {{ s[1] }} <span class="lbl n">{{ s[2] }}</span>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div class="sec">実測と目標（サンプル）</div>
        <div v-for="m in meas" :key="m.k" class="mr">
          <span class="ink2">{{ m.k }}</span>
          <span class="b nw">{{ m.v }}</span>
          <v-chip :color="vColor(m.l)" variant="tonal" class="tg"
            >{{ m.l === 'ok' ? '✓ ' : '' }}{{ m.t }}</v-chip
          >
        </div>
      </section>
      <section>
        <div class="sec">血液ガス {{ v.abgT.split(' ')[1] }}</div>
        <div class="abg">
          <div v-for="g in v.abg" :key="g[0]">
            <div class="lbl">{{ g[0] }}</div>
            <div class="gv" :class="flagClass(g[2])">
              {{ g[1] }} {{ units[g[0]] || '' }} {{ g[2] }}
            </div>
          </div>
        </div>
      </section>
      <section>
        <div class="sec">アラーム設定</div>
        <div v-for="alarm in v.alarm" :key="alarm[0]">{{ alarm[0] }}：{{ alarm[1] }}</div>
      </section>
      <v-alert v-for="order in v.orders" :key="order" color="info" class="ord">{{ order }}</v-alert>
    </template>
    <template v-else>
      <div class="empty">人工呼吸器の装着なし</div>
      <div class="sec">酸素療法</div>
      <div class="o2">{{ p.o2 }}</div>
      <div class="ink2 lh">{{ p.o2Sub }}</div>
    </template>
  </WidgetCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { vColor, flagClass } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)
const units: Record<string, string> = {
  'PaCO₂': 'mmHg',
  'PaO₂': 'mmHg',
  'HCO₃⁻': 'mmol/L',
  BE: 'mmol/L',
  Lac: 'mmol/L',
}
const v = computed(() => p.value.vent)
const meas = computed(
  () =>
    v.value?.meas.map((row) => ({
      k: row[0],
      v: `${row[1]} ${row[2]}`,
      t: row[3] || '参考値',
      l: row[4],
    })) || [],
)
</script>

<style scoped>
.mode {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.mt {
  font-size: 28px;
  font-weight: 700;
}
section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sec {
  font-weight: 700;
  color: #5e6a67;
}
.lbl {
  color: #5e6a67;
}
.set {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}
.si {
  background: #f3f6f5;
  border-radius: 7px;
  padding: 4px 10px;
  line-height: 1.3;
}
.sv {
  font-size: 22px;
  font-weight: 700;
}
.n {
  font-size: 16px;
  font-weight: 400;
}
.mr {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 78px;
  gap: 8px;
  align-items: center;
  font-size: 17px;
  padding: 3px 0;
  border-bottom: 1px dotted #dde2e0;
}
.nw {
  white-space: nowrap;
  font-size: 20px;
}
.tg {
  justify-content: center;
  font-weight: 700;
}
.abg {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  line-height: 1.3;
}
.gv {
  font-size: 20px;
  font-weight: 700;
}
.ord {
  line-height: 1.45;
  flex: none;
}
.empty {
  border: 1.5px dashed #c9d1ce;
  border-radius: 8px;
  padding: 16px;
  color: #4a5653;
  text-align: center;
  margin-top: 6px;
}
.o2 {
  font-size: 22px;
  font-weight: 700;
}
.lh {
  line-height: 1.55;
}
</style>
