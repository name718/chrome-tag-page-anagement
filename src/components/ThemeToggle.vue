<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->

<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle tooltip" 
    :data-tooltip="isDark ? '切换到明亮模式' : '切换到黑暗模式'"
    :class="{ 'dark': isDark }"
  >
    <!-- 太阳图标 (明亮模式) -->
    <svg v-if="!isDark" viewBox="0 0 24 24" fill="currentColor" class="theme-icon">
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
    </svg>
    
    <!-- 月亮图标 (黑暗模式) -->
    <svg v-else viewBox="0 0 24 24" fill="currentColor" class="theme-icon">
      <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// 响应式数据
const isDark = ref(false)

// 主题切换方法
const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
  saveThemePreference()
}

// 应用主题
const applyTheme = () => {
  const root = document.documentElement
  if (isDark.value) {
    root.classList.add('dark-theme')
    root.classList.remove('light-theme')
  } else {
    root.classList.add('light-theme')
    root.classList.remove('dark-theme')
  }
}

// 保存主题偏好
const saveThemePreference = () => {
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// 加载主题偏好
const loadThemePreference = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // 如果没有保存的偏好，检查系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
  }
  applyTheme()
}

// 监听系统主题变化
const watchSystemTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    // 只有在用户没有手动设置主题时才跟随系统
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches
      applyTheme()
    }
  })
}

// 组件挂载时初始化
onMounted(() => {
  loadThemePreference()
  watchSystemTheme()
})

// 监听主题变化，同步到其他组件
watch(isDark, (newValue) => {
  // 触发全局事件，让其他组件知道主题变化
  window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDark: newValue } }))
})
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 16px;
  left: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px var(--shadow-medium);
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.theme-toggle:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px var(--shadow-heavy);
}

.theme-toggle:active {
  transform: translateY(0) scale(1);
}

.theme-toggle.dark {
  background: var(--bg-card);
  color: var(--text-secondary);
}

.theme-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.theme-toggle:hover .theme-icon {
  transform: rotate(15deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-toggle {
    top: 12px;
    left: 12px;
    width: 36px;
    height: 36px;
  }
  
  .theme-icon {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .theme-toggle {
    top: 8px;
    left: 8px;
    width: 32px;
    height: 32px;
  }
  
  .theme-icon {
    width: 16px;
    height: 16px;
  }
}
</style>
