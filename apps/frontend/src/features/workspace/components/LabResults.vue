<script setup lang="ts">
import type { LabRow } from '../../../demo/clinical-types.ts'
import { flagClass, trend } from '../display.ts'
defineProps<{ rows: LabRow[]; previous?: boolean }>()
</script>
<template>
  <p v-if="!rows.length" class="lbl">検査値未取得</p>
  <table v-else class="lab-results">
    <thead>
      <tr>
        <th scope="col">項目</th>
        <th scope="col">今回値・単位</th>
        <th v-if="previous" scope="col">前回比</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row[0]">
        <th scope="row">{{ row[0] }}</th>
        <td :class="flagClass(row[3])">
          {{ row[1] || '未取得' }} {{ row[2] || (row[0] === 'eGFR' ? 'mL/分/1.73m²' : '') }}
          {{ row[3] }}
        </td>
        <td v-if="previous" :title="`前回値 ${row[4] || '未取得'}`">{{ trend(row[1], row[4]) }}</td>
      </tr>
    </tbody>
  </table>
</template>
<style scoped>
.lab-results {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 16px;
}
th,
td {
  padding: 4px 3px;
  text-align: left;
  border-bottom: 1px solid #e6eae8;
  overflow-wrap: anywhere;
  vertical-align: top;
}
thead th {
  color: #5e6a67;
  font-weight: 400;
}
tbody th {
  font-weight: 400;
}
th:first-child {
  width: 35%;
}
th:last-child:not(:nth-child(2)) {
  width: 45px;
}
</style>
