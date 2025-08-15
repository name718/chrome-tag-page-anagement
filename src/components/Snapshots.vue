<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->

<template>
  <div class="snapshots">
    <div class="snapshots-header">
      <div class="snapshots-title">
        <div class="snapshots-icon-wrapper">
          <svg viewBox="0 0 24 24" fill="currentColor" class="snapshots-icon-svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div>
          <h3>{{ $t('snapshots.title') }}</h3>
          <p>{{ $t('snapshots.subtitle') }}</p>
        </div>
      </div>
    </div>
    
    <div class="snapshot-list">
      <div 
        v-for="snapshot in snapshots" 
        :key="snapshot.id"
        class="snapshot-item"
        @click="$emit('restore', snapshot.id)"
      >
        <div class="snapshot-info">
          <span class="snapshot-name">{{ snapshot.name }}</span>
          <span class="snapshot-date">{{ formatDate(snapshot.createdAt) }}</span>
        </div>
        <button 
          @click.stop="$emit('delete', snapshot.id)" 
          class="snapshot-delete-btn tooltip" 
          :data-tooltip="$t('snapshots.deleteTooltip')"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="delete-icon">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  snapshots: {
    type: Array,
    default: () => []
  },

})

// Emits
const emit = defineEmits([
  'restore',
  'delete'
])

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.snapshots {
  padding: 16px 12px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
}

.snapshots-header {
  margin-bottom: 16px;
}

.snapshots-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.snapshots-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 6px;
}

.snapshots-icon-svg {
  width: 20px;
  height: 20px;
  color: var(--accent-primary);
}

.snapshots-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.snapshots-title p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.snapshot-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.snapshot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.snapshot-item:hover {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px var(--shadow-medium);
}

.snapshot-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.snapshot-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.snapshot-date {
  font-size: 12px;
  color: var(--text-muted);
}

.snapshot-delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
}

.snapshot-item:hover .snapshot-delete-btn {
  opacity: 1;
}

.snapshot-delete-btn:hover {
  background: var(--accent-danger);
  color: var(--text-inverse);
}

.delete-icon {
  width: 16px;
  height: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .snapshots {
    padding: 12px 8px;
  }
  
  .snapshot-item {
    padding: 10px 12px;
  }
  
  .snapshot-name {
    font-size: 13px;
  }
  
  .snapshot-date {
    font-size: 11px;
  }
  
  .snapshot-delete-btn {
    opacity: 1;
  }
}
</style>
