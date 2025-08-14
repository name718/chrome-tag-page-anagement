/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Options from './components/Options.vue'
import './style.css'

const app = createApp(Options)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
