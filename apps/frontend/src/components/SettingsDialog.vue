<script setup lang="ts">
const open = defineModel<boolean>({ default: false })
</script>
<template>
  <v-dialog v-model="open" width="560" aria-labelledby="settings-title"
    ><v-card class="pa-6"
      ><header class="dialog-header">
        <h2 id="settings-title">設定</h2>
        <v-btn
          icon="mdi-close"
          variant="outlined"
          aria-label="設定を閉じる"
          @click="open = false"
        />
      </header>
      <div class="settings-options">
        <v-btn
          to="/settings/screens"
          variant="outlined"
          height="88"
          prepend-icon="mdi-view-grid-outline"
          @click="open = false"
          >業務画面設定</v-btn
        >
        <v-btn
          to="/settings/terminal"
          variant="outlined"
          height="88"
          prepend-icon="mdi-tablet"
          @click="open = false"
          >端末設定</v-btn
        >
      </div></v-card
    ></v-dialog
  >
</template>
<style scoped>
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
h2 {
  margin: 0;
  font-size: 22px;
}
.settings-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.v-btn {
  font-size: 20px;
}
</style>
