<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->

<template>
  <button 
    @click="toggleLanguage" 
    class="language-toggle" 
    :class="{ 'en': isEnglish }"
  >
    <!-- 中文图标 -->
    <span v-if="!isEnglish" class="language-icon">中</span>
    
    <!-- 英文图标 -->
    <span v-else class="language-icon">EN</span>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const isEnglish = ref(false)

// 语言切换方法
const toggleLanguage = () => {
  const newLang = isEnglish.value ? 'zh_CN' : 'en'
  localStorage.setItem('language', newLang)
  isEnglish.value = !isEnglish.value
  // 刷新页面以应用新语言
  window.location.reload()
}

// 加载语言偏好
const loadLanguagePreference = () => {
  const currentLang = localStorage.getItem('language') || 'zh_CN'
  isEnglish.value = currentLang === 'en'
}

// 组件挂载时初始化
onMounted(() => {
  loadLanguagePreference()
})
</script>

<style scoped>
.language-toggle {
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
  font-weight: 600;
  font-size: 14px;
}

.language-toggle:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px var(--shadow-heavy);
}

.language-toggle:active {
  transform: translateY(0) scale(1);
}

.language-toggle.en {
  background: var(--bg-card);
  color: var(--text-secondary);
}

.language-icon {
  transition: transform 0.3s ease;
  font-weight: 700;
}

.language-toggle:hover .language-icon {
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .language-toggle {
    top: 12px;
    left: 56px;
    width: 36px;
    height: 36px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .language-toggle {
    top: 8px;
    left: 48px;
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
}
</style>
