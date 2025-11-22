import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import messages from './locales'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

createApp(App).use(i18n).mount('#app')