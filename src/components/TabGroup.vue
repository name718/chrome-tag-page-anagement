<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->

<template>
      <div class="tab-group" :class="{ 'is-collapsed': isCollapsed }">
    <!-- 分组头部 -->
    <div class="group-header" @click="$emit('toggle-collapse', group.id)" title="点击折叠/展开">
      <div class="group-info">
        <div class="group-icon-wrapper">
          <span class="group-icon">{{ groupIcon }}</span>
        </div>
        <div class="group-details">
          <span class="group-name" :title="groupName">{{ groupName }}</span>
          <span class="tab-count">{{ tabCount }} 个标签</span>
        </div>
      </div>


      <div class="group-actions">
        <!-- 拖拽手柄 -->
        <div class="drag-handle tooltip" data-tooltip="拖拽排序分组" ref="dragHandle">
          <svg viewBox="0 0 24 24" fill="currentColor" class="drag-icon">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </div>

        <!-- 编辑按钮 -->
        <button @click.stop="$emit('edit', group.id)" class="group-action-btn edit-btn tooltip" data-tooltip="编辑分组">
          <svg viewBox="0 0 24 24" fill="currentColor" class="action-icon">
            <path
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </button>

        <!-- 删除按钮 -->
        <button @click.stop="$emit('delete', group.id)" class="group-action-btn delete-btn tooltip" data-tooltip="删除分组">
          <svg viewBox="0 0 24 24" fill="currentColor" class="action-icon">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 分组内容 -->
    <div class="group-content" v-show="!isCollapsed">
      <!-- 标签页列表 -->
      <div class="group-tabs" ref="tabsContainer" :data-group-id="group.id">
        <TabItem v-for="tab in groupTabs" :key="tab.id" :tab="tab" @activate="$emit('activate-tab', $event)"
          @toggle-dormant="$emit('toggle-dormant', $event)" @move-to-staging="$emit('move-to-staging', $event)" />
      </div>
                   <!-- 空分组占位提示 - 始终显示 -->
      <div v-if="tabCount === 0" class="empty-placeholder" ref="dropzone">
         <div class="placeholder-content">
           <div class="placeholder-icon">📁</div>
           <div class="placeholder-text">
             <div class="placeholder-title">分组为空</div>
             <div class="placeholder-subtitle">拖拽标签页到这里或从其他分组移动</div>
           </div>
         </div>
       </div>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
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

// 使用计算属性确保响应式更新
const groupTabs = computed(() => props.group.tabs || [])
const tabCount = computed(() => groupTabs.value.length)
const groupName = computed(() => props.group.name || '')
const groupIcon = computed(() => props.group.icon || '📁')
const isCollapsed = computed(() => props.group.collapsed || false)

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
watch(() => props.group.tabs, (newTabs, oldTabs) => {
  console.log(`🔍 TabGroup 监听器触发: ${props.group.name}`)
  console.log(`   旧标签数量: ${oldTabs?.length || 0}`)
  console.log(`   新标签数量: ${newTabs?.length || 0}`)
  
  // 重新初始化拖拽区域
  nextTick(() => {
    initDropzone()
  })
}, { deep: true })

// 监听整个分组对象变化
watch(() => props.group, (newGroup, oldGroup) => {
  console.log(`🔍 TabGroup 分组对象监听器触发: ${newGroup.name}`)
  console.log(`   旧标签数量: ${oldGroup?.tabs?.length || 0}`)
  console.log(`   新标签数量: ${newGroup?.tabs?.length || 0}`)
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
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.tab-group:hover {
  border-color: var(--border-secondary);
  box-shadow: 0 2px 8px var(--shadow-medium);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.group-header:hover {
  background: var(--bg-tertiary);
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
  background: var(--bg-tertiary);
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
  color: var(--text-primary);
  line-height: 1.2;
}

.tab-count {
  font-size: 12px;
  color: var(--text-muted);
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
  background: var(--border-muted);
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-icon {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
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
  background: var(--border-muted);
}

.action-icon {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
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

.empty-placeholder {
  padding: 16px 12px;
  border: 2px dashed var(--border-primary);
  border-radius: 6px;
  text-align: center;
  transition: all 0.2s ease;
  background: var(--bg-tertiary);
  margin-top: 6px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.empty-placeholder:hover {
  border-color: var(--border-secondary);
  background: var(--bg-secondary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow-medium);
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 180px;
}

.placeholder-icon {
  font-size: 24px;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.empty-placeholder:hover .placeholder-icon {
  opacity: 0.7;
}

.placeholder-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.placeholder-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1px;
}

.placeholder-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.3;
}

/* 休眠分组提示样式 */
.dormant-placeholder {
  padding: 14px 12px;
  border: 2px dashed var(--accent-warning);
  border-radius: 6px;
  text-align: center;
  transition: all 0.2s ease;
  background: var(--accent-warning);
  margin-top: 6px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.dormant-placeholder:hover {
  border-color: var(--accent-warning);
  background: var(--accent-warning);
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow-medium);
}

.dormant-placeholder .placeholder-icon {
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.dormant-placeholder:hover .placeholder-icon {
  opacity: 1;
}

/* Sortable.js 样式 */
.sortable-ghost {
  opacity: 0.5;
  background: var(--border-muted);
}

.sortable-chosen {
  background: var(--accent-primary);
  opacity: 0.1;
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
