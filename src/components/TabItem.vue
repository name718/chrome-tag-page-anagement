<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->

<template>
  <div 
    class="tab-item"
    :class="{ 'is-dormant': tab.dormant }"
    :data-tab-id="tab.id"
    @click="$emit('activate', tab.id)"
  >
    <div class="tab-favicon-wrapper">
      <img 
        :src="tab.favIconUrl || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><text y=%2214%22 font-size=%2212%22>🌐</text></svg>'" 
        :alt="tab.title" 
        class="tab-favicon" 
      />
    </div>
    
    <div class="tab-content">
      <span class="tab-title" :title="tab.title">{{ tab.title }}</span>
      <span class="tab-url">{{ tab.url }}</span>
    </div>
    
    <div class="tab-actions">
      <button 
        @click.stop="$emit('toggle-dormant', tab.id)" 
        class="tab-action-btn tooltip" 
        :data-tooltip="tab.dormant ? '唤醒标签页' : '休眠标签页'"
      >
        <span v-if="tab.dormant" class="action-icon">⏰</span>
        <span v-else class="action-icon">💤</span>
      </button>
      
      <button 
        @click.stop="$emit('move-to-staging', tab.id)" 
        class="tab-action-btn tooltip" 
        data-tooltip="移动到暂存区"
      >
        <span class="action-icon">📦</span>
      </button>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  tab: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'activate',
  'toggle-dormant',
  'move-to-staging'
])
</script>

<style scoped>
.tab-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.tab-item:hover {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px var(--shadow-medium);
}

.tab-item.is-dormant {
  opacity: 0.7;
  background: var(--bg-tertiary);
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
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.tab-url {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.tab-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}

.tab-item:hover .tab-actions {
  opacity: 1;
  transform: translateX(0);
}

.tab-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: var(--bg-tertiary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-action-btn:hover {
  background: var(--border-muted);
  transform: scale(1.1);
}

.action-icon {
  font-size: 12px;
  line-height: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-item {
    padding: 10px 12px;
  }
  
  .tab-title {
    font-size: 14px;
  }
  
  .tab-url {
    font-size: 12px;
  }
  
  .tab-actions {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
