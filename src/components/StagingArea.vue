<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->

<template>
  <div class="staging-area">
    <div class="staging-header">
      <div class="staging-title">
        <div class="staging-icon-wrapper">
          <svg viewBox="0 0 24 24" fill="currentColor" class="staging-icon-svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
          </svg>
        </div>
        <div>
          <h3>{{ $t('staging.title') }}</h3>
          <p>{{ $t('staging.subtitle') }}</p>
        </div>
      </div>
      <button 
        @click="$emit('clear-staging')" 
        class="btn btn-outline tooltip" 
        :data-tooltip="$t('staging.clearTooltip')"
      >
        {{ $t('staging.clear') }}
      </button>
    </div>
    
    <div class="staging-tabs">
      <div 
        v-for="tab in stagingTabs" 
        :key="tab.id"
        class="tab-item staging-tab"
        @click="$emit('restore-from-staging', tab.id)"
      >
        <div class="tab-favicon-wrapper">
          <img 
            :src="tab.favIconUrl || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><text y=%2214%22 font-size=%2212%22>🌐</text></svg>'" 
            :alt="tab.title" 
            class="tab-favicon" 
          />
        </div>
        <div class="tab-content">
          <span class="tab-title">{{ tab.title }}</span>
          <span class="tab-url">{{ tab.url }}</span>
        </div>
        <button class="tab-action-btn tooltip" :data-tooltip="$t('staging.restore')">
          <span class="action-icon">🔄</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  stagingTabs: {
    type: Array,
    default: () => []
  },

})

// Emits
const emit = defineEmits([
  'clear-staging',
  'restore-from-staging'
])
</script>

<style scoped>
.staging-area {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 16px 12px;
  overflow: hidden;
}

.staging-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.staging-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.staging-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 6px;
}

.staging-icon-svg {
  width: 20px;
  height: 20px;
  color: var(--accent-primary);
}

.staging-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.staging-title p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--text-muted);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  background: var(--text-muted);
  color: var(--text-inverse);
}

.staging-tabs {
  padding: 16px 20px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.tab-item:hover {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px var(--shadow-medium);
}

.tab-item.staging-tab {
  background: var(--accent-warning);
  border-color: var(--accent-warning);
}

.tab-item.staging-tab:hover {
  background: var(--accent-warning);
  border-color: var(--accent-warning);
  opacity: 0.9;
}

.tab-favicon-wrapper {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-favicon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.tab-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tab-title {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.tab-url {
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.tab-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: #f3f4f6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-action-btn:hover {
  background: #e5e7eb;
  transform: scale(1.1);
}

.action-icon {
  font-size: 12px;
  line-height: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .staging-header {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .staging-tabs {
    padding: 12px 16px;
  }
  
  .tab-item {
    padding: 12px 16px;
  }
  
  .tab-title {
    font-size: 14px;
  }
  
  .tab-url {
    font-size: 12px;
  }
}
</style>
