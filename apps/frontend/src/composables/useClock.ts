import { formatDate } from 'utils'
import { computed, onScopeDispose, ref } from 'vue'

/** The scope owns the timer; formatting always uses the app's JST helpers. */
export const useClock = () => {
  const now = ref(new Date())
  const timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
  onScopeDispose(() => clearInterval(timer))
  const date = computed(() => formatDate(now.value, 'yyyy/MM/dd'))
  const time = computed(() => formatDate(now.value, 'HH:mm'))
  return { now, date, time }
}
