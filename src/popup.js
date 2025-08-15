/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { formatMessage, getCurrentLanguage } from './utils/i18n.js'

console.log('🚀 popup.js 开始执行')

try {
  const app = createApp(App)
  const pinia = createPinia()

  // 设置全局 $t 函数
  app.config.globalProperties.$t = (key, params = {}) => {
    return formatMessage(key, params, getCurrentLanguage())
  }

  app.use(pinia)
  
  console.log('🚀 开始挂载应用...')
  app.mount('#app')
  console.log('🚀 应用挂载完成')
  
} catch (error) {
  console.error('❌ popup.js 执行失败:', error)
  // 在页面上显示错误信息
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h3>❌ 应用启动失败</h3>
      <pre>${error.message}</pre>
      <pre>${error.stack}</pre>
    </div>
  `
}
