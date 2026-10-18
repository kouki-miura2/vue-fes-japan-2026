<template>
  <WidgetCard title="アレルギー・禁忌・感染症" scroll>
    <v-alert
      :color="vColor(p.al.precL)"
      :icon="p.al.precL === 'warn' ? 'mdi-shield-alert-outline' : 'mdi-shield-check-outline'"
      class="prec"
      >{{ p.al.prec }}</v-alert
    >
    <template v-if="p.al.known"
      ><section>
        <div class="sec">アレルギー</div>
        <div v-if="!allergies.length" class="ink2">登録なし（確認済み）</div>
        <div v-for="a in allergies" :key="a.n" class="al">
          <div class="al-n">{{ a.n }}</div>
          <div class="al-r">{{ a.r }}</div>
        </div>
      </section>
      <section>
        <div class="sec">禁忌・慎重投与</div>
        <p v-if="!p.al.contra.length" class="ink2">登録なし（確認済み）</p>
        <div v-for="a in p.al.contra" :key="a.n" class="ct lvbg-warn">
          <div class="ct-n">{{ a.n }}</div>
          <div class="ct-r">{{ a.r }}</div>
        </div>
      </section>
      <section>
        <div class="sec">感染症</div>
        <div v-for="i in positives" :key="i[0]" class="pos">
          <span class="b">{{ i[0] }}</span
          ><span class="lvfg-crit b">{{ i[1] }}</span>
        </div>
        <p v-if="!p.al.inf.length">感染症情報未取得</p>
        <div v-for="entry in unknown" :key="entry[0]">{{ entry[0] }}：不明</div>
        <div v-if="negatives" class="neg"><span class="lvfg-ok b">陰性</span>　{{ negatives }}</div>
      </section>
    </template>
    <p v-else>アレルギー・禁忌・感染症は未取得</p>
  </WidgetCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { vColor } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)
const allergies = computed(() => [...p.value.al.drug, ...p.value.al.food])
const positives = computed(() => p.value.al.inf.filter((entry) => entry[2] === 1))
const negatives = computed(() =>
  p.value.al.inf
    .filter((entry) => entry[2] === 0)
    .map((entry) => entry[0])
    .join('・'),
)
const unknown = computed(() => p.value.al.inf.filter((entry) => entry[2] === null))
</script>

<style scoped>
.prec {
  font-weight: 700;
  flex: none;
  line-height: 1.4;
}
section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sec {
  font-size: 16px;
  font-weight: 700;
  color: #5e6a67;
}
.al {
  border: 1px solid #f1c2bc;
  background: #fdecea;
  border-radius: 8px;
  padding: 8px 12px;
}
.al-n {
  font-size: 18px;
  font-weight: 700;
  color: #b42318;
}
.al-r {
  color: #5a1a13;
}
.ct {
  border-radius: 8px;
  padding: 8px 12px;
}
.ct-n {
  font-size: 17px;
  font-weight: 700;
  color: #8a5300;
}
.ct-r {
  color: #4a3a1a;
  line-height: 1.45;
}
.pos {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  border-bottom: 1px dotted #dde2e0;
  line-height: 1.4;
}
.neg {
  color: #4a5653;
  line-height: 1.5;
}
</style>
