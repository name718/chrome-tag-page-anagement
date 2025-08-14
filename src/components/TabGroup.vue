<template>
  <div class="tab-group" :class="{ 'is-collapsed': group.collapsed }">
    <!-- 分组头部 -->
    <div 
      class="group-header" 
      @click="$emit('toggle-collapse', group.id)" 
      title="点击折叠/展开"
    >
      <div class="group-info">
        <div class="group-icon-wrapper">
          <span class="group-icon">{{ group.icon }}</span>
        </div>
        <div class="group-details">
          <span class="group-name" :title="group.name">{{ group.name }}</span>
          <span class="tab-count">{{ group.tabs.length }} 个标签</span>
        </div>
      </div>
      
      <div class="group-actions">
        <!-- 拖拽手柄 -->
        <div 
          class="drag-handle tooltip" 
          data-tooltip="拖拽排序分组"
          ref="dragHandle"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="drag-icon">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </div>
        
        <!-- 编辑按钮 -->
        <button 
          @click.stop="$emit('edit', group.id)" 
          class="group-action-btn edit-btn tooltip" 
          data-tooltip="编辑分组"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="action-icon">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        
        <!-- 删除按钮 -->
        <button 
          @click.stop="$emit('delete', group.id)" 
          class="group-action-btn delete-btn tooltip" 
          data-tooltip="删除分组"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="action-icon">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 分组内容 -->
    <div class="group-content" v-show="!group.collapsed">
      <!-- 标签页列表 -->
      <div class="group-tabs" ref="tabsContainer">
        <TabItem
          v-for="tab in group.tabs"
          :key="tab.id"
          :tab="tab"
          @activate="$emit('activate-tab', $event)"
          @toggle-dormant="$emit('toggle-dormant', $event)"
          @move-to-staging="$emit('move-to-staging', $event)"
        />
      </div>
      
      <!-- 空分组拖拽区域 -->
      <div 
        v-if="group.tabs.length === 0" 
        class="empty-dropzone"
        ref="dropzone"
      >
        <div class="dropzone-content">
          <span class="dropzone-icon">📥</span>
          <span class="dropzone-text">拖拽标签页到这里</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Sortable from 'sortablejs'
import TabItem from './TabItem.vue'

// Props
const props = defineProps({
  group: {
    type: Object,
    required: true
  },
  groupIndex: {
    type: Number,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'toggle-collapse',
  'edit',
  'delete',
  'activate-tab',
  'toggle-dormant',
  'move-to-staging',
  'reorder-tabs',
  'move-tab-to-group'
])

// Refs
const tabsContainer = ref(null)
const dropzone = ref(null)
const dragHandle = ref(null)

// Sortable 实例
let tabsSortable = null
let groupSortable = null

// 初始化标签页排序
const initTabsSortable = () => {
  if (!tabsContainer.value) return
  
  tabsSortable = Sortable.create(tabsContainer.value, {
    group: 'tabs',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onEnd: (evt) => {
      if (evt.from === evt.to) {
        // 同一分组内重新排序
        emit('reorder-tabs', {
          groupId: props.group.id,
          oldIndex: evt.oldIndex,
          newIndex: evt.newIndex
        })
      } else {
        // 移动到其他分组
        emit('move-tab-to-group', {
          tabId: evt.item.dataset.tabId,
          fromGroupId: props.group.id,
          toGroupId: evt.to.dataset.groupId,
          newIndex: evt.newIndex
        })
      }
    }
  })
}

// 初始化分组拖拽
const initGroupSortable = () => {
  if (!dragHandle.value) return
  
  groupSortable = Sortable.create(dragHandle.value, {
    group: 'groups',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    handle: '.drag-handle',
    onEnd: (evt) => {
      emit('reorder-group', {
        groupId: props.group.id,
        oldIndex: props.groupIndex,
        newIndex: evt.newIndex
      })
    }
  })
}

// 初始化拖拽区域
const initDropzone = () => {
  if (!dropzone.value) return
  
  Sortable.create(dropzone.value, {
    group: {
      name: 'tabs',
      pull: false,
      put: true
    },
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onAdd: (evt) => {
      emit('move-tab-to-group', {
        tabId: evt.item.dataset.tabId,
        fromGroupId: evt.from.dataset.groupId,
        toGroupId: props.group.id,
        newIndex: 0
      })
    }
  })
}

// 监听分组变化
watch(() => props.group.tabs, () => {
  // 重新初始化拖拽区域
  nextTick(() => {
    initDropzone()
  })
}, { deep: true })

// 生命周期
onMounted(() => {
  nextTick(() => {
    initTabsSortable()
    initGroupSortable()
    initDropzone()
  })
})

onUnmounted(() => {
  if (tabsSortable) {
    tabsSortable.destroy()
  }
  if (groupSortable) {
    groupSortable.destroy()
  }
})
</script>

<style scoped>
.tab-group {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.tab-group:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.group-header:hover {
  background: #f3f4f6;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2f7;
  border-radius: 6px;
}

.group-icon {
  font-size: 18px;
  line-height: 1;
}

.group-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.group-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.tab-count {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: grab;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.drag-handle:hover {
  background: #e5e7eb;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.group-action-btn {
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
}

.group-action-btn:hover {
  background: #e5e7eb;
}

.action-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.edit-btn:hover .action-icon {
  color: #059669;
}

.delete-btn:hover .action-icon {
  color: #dc2626;
}

.group-content {
  padding: 12px 16px;
}

.group-tabs {
  margin-bottom: 8px;
}

.empty-dropzone {
  padding: 16px;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  text-align: center;
  transition: all 0.2s ease;
  background: #f9fafb;
  margin-top: 8px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-dropzone:hover {
  border-color: #9ca3af;
  background: #f3f4f6;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.dropzone-icon {
  font-size: 24px;
  color: #9ca3af;
}

.dropzone-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* Sortable.js 样式 */
.sortable-ghost {
  opacity: 0.5;
  background: #e5e7eb;
}

.sortable-chosen {
  background: #dbeafe;
}

.sortable-drag {
  opacity: 0.8;
  transform: rotate(5deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .group-header {
    padding: 10px 12px;
  }
  
  .group-content {
    padding: 10px 12px;
  }
  
  .group-name {
    font-size: 13px;
  }
  
  .tab-count {
    font-size: 11px;
  }
}
</style>
