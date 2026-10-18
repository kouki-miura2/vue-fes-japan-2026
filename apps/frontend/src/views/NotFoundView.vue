<script setup lang="ts">
import { useAuthStore } from '../stores/auth.ts'
const auth = useAuthStore()
</script>
<template>
  <section class="not-found">
    <v-icon icon="mdi-file-search-outline" size="56" color="primary" />
    <h1>ページが見つかりません</h1>
    <p>URLを確認するか、下のボタンから戻ってください。</p>
    <v-btn :to="auth.isAuthenticated ? '/work' : '/login'" color="primary">{{
      auth.isAuthenticated ? '業務画面へ' : 'ログイン画面へ'
    }}</v-btn>
  </section>
</template>
<style scoped>
.not-found {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 32px;
}
h1 {
  margin: 0;
  font-size: 24px;
}
</style>
