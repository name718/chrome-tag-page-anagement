<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->

<template>
  <header class="header">
    <div class="header-content">
      <!-- 品牌信息 -->
      <div class="brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h1 class="title">TabTamer</h1>
        <span class="subtitle">{{ $t('header.subtitle') }}</span>
      </div>
      <div class="header-actions-right">

        <!-- 主题切换组件 -->
        <ThemeToggle />

        <!-- 语言切换组件 -->
        <LanguageToggle />
      </div>

      <!-- 右侧操作区 -->
      <div class="header-actions">
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button @click="$emit('create-snapshot')" class="btn btn-snapshot tooltip"
            :data-tooltip="$t('header.createSnapshot')">
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            <span class="btn-text">{{ $t('header.snapshot') }}</span>
          </button>

          <button @click="$emit('toggle-staging')" class="btn btn-staging tooltip" :class="{ 'active': stagingVisible }"
            :data-tooltip="stagingVisible ? $t('header.toggleStaging') : $t('header.openStaging')">
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
            </svg>
            <span class="btn-text">{{ $t('header.staging') }}</span>
          </button>

          <button @click="$emit('toggle-help')" class="btn btn-help tooltip" :class="{ 'active': showHelp }"
            :data-tooltip="showHelp ? $t('header.closeHelp') : $t('header.showHelp')">
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
            </svg>
            <span class="btn-text">{{ $t('header.help') }}</span>
          </button>

          <!-- GitHub 链接 -->
          <a href="https://github.com/name718/chrome-tag-page-anagement" target="_blank" rel="noopener noreferrer"
            class="btn btn-github tooltip" :data-tooltip="$t('header.githubTooltip')">
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 4.624-5.479 4.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span class="btn-text">{{ $t('header.github') }}</span>
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import ThemeToggle from './ThemeToggle.vue'
import LanguageToggle from './LanguageToggle.vue'

// Props
const props = defineProps({
  stagingVisible: {
    type: Boolean,
    default: false
  },
  showHelp: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'create-snapshot',
  'toggle-staging',
  'toggle-help'
])


</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-primary);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  background: var(--bg-tertiary);
}

.icon-svg {
  width: 24px;
  height: 24px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 300;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 6px;
}



.action-buttons {
  display: flex;
  gap: 6px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  color: var(--text-secondary);
  box-shadow: 0 1px 2px var(--shadow-light);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow-medium);
  border-color: var(--border-secondary);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-snapshot {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.btn-snapshot:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  border-color: #5a6fd8;
}

.btn-staging {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-color: var(--border-secondary);
}

.btn-staging:hover {
  background: var(--border-muted);
  border-color: var(--text-muted);
}

.btn-staging.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-staging.active:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-help {
  background: #fef3c7;
  color: #92400e;
  border-color: #fbbf24;
}

.btn-help:hover {
  background: #fde68a;
  border-color: #f59e0b;
}

.btn-help.active {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.btn-help.active:hover {
  background: #d97706;
  border-color: #d97706;
}

.btn-github {
  background: #24292e;
  color: white;
  border-color: #24292e;
}

.btn-github:hover {
  background: #2f363d;
  border-color: #2f363d;
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-text {
  font-weight: 500;
  white-space: nowrap;
}

.header-actions-right {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: end;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
