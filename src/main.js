import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import i18n from './i18n'
import App from './App.vue'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局注册ElMessage
app.config.globalProperties.$message = ElMessage
// 也可以直接挂载到window对象（备选方案）
// window.ElMessage = ElMessage

app.use(ElementPlus)
app.use(i18n)
app.mount('#app')