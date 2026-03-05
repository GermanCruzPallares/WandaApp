import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/main.scss'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.directive('click-outside', {
  mounted(el, binding) {
    el._clickOutsideHandler = (event: Event) => {
      if (!el.contains(event.target as Node)) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutsideHandler)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutsideHandler)
  }
})

app.use(createPinia())
app.use(router)

app.mount('#app')
