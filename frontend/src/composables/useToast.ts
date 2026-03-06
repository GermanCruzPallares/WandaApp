import { ref, readonly } from 'vue'

const isVisible = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'info'>('info')
let timeoutId: number | null = null

export function useToast() {
  const showToast = (
    msg: string,
    toastType: 'success' | 'error' | 'info' = 'info',
    duration = 3000,
  ) => {
    message.value = msg
    type.value = toastType
    isVisible.value = true

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      hideToast()
    }, duration)
  }

  const hideToast = () => {
    isVisible.value = false
  }

  return {
    isVisible: readonly(isVisible),
    message: readonly(message),
    type: readonly(type),
    showToast,
    hideToast,
  }
}
