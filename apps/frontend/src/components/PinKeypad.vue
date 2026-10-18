<script setup lang="ts">
const emit = defineEmits<{ digit: [value: string]; remove: []; cancel: [] }>()
</script>
<template>
  <div class="pin-keypad" aria-label="PINテンキー">
    <v-btn
      v-for="digit in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
      :key="digit"
      variant="outlined"
      height="60"
      :aria-label="`数字${digit}`"
      @click="emit('digit', digit)"
      >{{ digit }}</v-btn
    >
    <v-btn variant="tonal" height="60" @click="emit('cancel')">中止</v-btn
    ><v-btn variant="outlined" height="60" aria-label="数字0" @click="emit('digit', '0')">0</v-btn
    ><v-btn variant="tonal" height="60" aria-label="PINを1桁削除" @click="emit('remove')"
      >削除</v-btn
    >
  </div>
</template>
<style scoped>
.pin-keypad {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.v-btn {
  font-size: 24px;
}
.v-btn--variant-tonal {
  font-size: 16px;
}
</style>
