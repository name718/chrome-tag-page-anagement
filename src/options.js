/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Options from './components/Options.vue'
import './style.css'
import { formatMessage, getCurrentLanguage } from './utils/i18n.js'

const app = createApp(Options)
const pinia = createPinia()

// 设置全局 $t 函数
app.config.globalProperties.$t = (key, params = {}) => {
  return formatMessage(key, params, getCurrentLanguage())
}

app.use(pinia)
app.mount('#app')
