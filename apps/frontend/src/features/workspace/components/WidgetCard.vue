<script setup lang="ts">
withDefaults(defineProps<{ title: string; meta?: string; scroll?: boolean }>(), { scroll: true })
</script>

<template>
  <v-card class="widget-card" variant="flat">
    <header class="widget-heading">
      <h2>{{ title }}</h2>
      <span class="widget-meta"
        ><slot name="meta">{{ meta }}</slot></span
      >
    </header>
    <div class="widget-body" :class="{ scroll }"><slot /></div>
  </v-card>
</template>

<style scoped>
.widget-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d3dad7;
  border-radius: 10px;
  color: #16201e;
  font-size: 16px;
  line-height: 1.45;
}
.widget-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px 8px;
  border-bottom: 1px solid #e6eae8;
  flex: none;
}
h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.widget-meta {
  white-space: nowrap;
  color: #5e6a67;
  font-size: 16px;
}
.widget-body {
  flex: 1;
  min-height: 0;
  padding: 10px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scroll {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
