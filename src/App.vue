<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->

<template>
  <div class="app">
    <!-- 头部组件 -->
    <Header
      v-model:groupStrategy="tabStore.groupStrategy"
      :stagingVisible="stagingAreaVisible"
      :showHelp="showHelp"
      @create-snapshot="createSnapshot"
      @toggle-staging="toggleStagingArea"
      @toggle-help="showHelp = !showHelp"
    />

    <!-- 使用说明 -->
    <div v-if="showHelp" class="help">
      <ul>
        <li>点击标签行：激活该标签页</li>
        <li>休眠/唤醒：将标签页休眠以节省内存，或恢复使用</li>
        <li>暂存：将标签页移入暂存区，稍后可从暂存区恢复</li>
        <li>分组标题：点击可折叠/展开分组</li>
        <li>编辑/删除分组：在分组右侧的"编辑/删除"按钮</li>
        <li>快照：保存当前工作区，稍后可一键恢复</li>
      </ul>
    </div>

    <!-- 统计信息组件 -->
    <Stats
      :totalTabs="tabStore.totalTabs"
      :activeTabs="tabStore.activeTabs"
      :dormantTabs="tabStore.dormantTabs"
      :groupCount="tabStore.groupCount"
      :stagingCount="tabStore.stagingCount"
      :memoryEfficiency="tabStore.memoryEfficiency"
      :estimatedMemoryUsage="tabStore.estimatedMemoryUsage"
      :estimatedMemorySaved="tabStore.estimatedMemorySaved"
    />

    <!-- 主要内容 -->
    <main class="main">
      <div class="tab-groups">
        <!-- 分组头部 -->
        <div class="groups-header">
          <h3>标签页分组</h3>
          <button @click="createNewGroup" class="btn btn-outline btn-small tooltip" data-tooltip="新建分组">
            新建分组
          </button>
        </div>

        <!-- 分组列表 -->
        <div v-if="tabStore.groups.length === 0" class="no-groups">
          <p>暂无分组，请选择分组策略或等待自动分组</p>
        </div>

        <!-- 分组组件 -->
        <TabGroup
          v-for="(group, index) in tabStore.groups"
          :key="group.id"
          :group="group"
          :groupIndex="index"
          @toggle-collapse="tabStore.toggleGroupCollapse"
          @edit="editGroup"
          @delete="deleteGroup"
          @activate-tab="tabStore.activateTab"
          @toggle-dormant="tabStore.toggleTabDormant"
          @move-to-staging="tabStore.moveToStaging"
          @reorder-tabs="handleReorderTabs"
          @move-tab-to-group="handleMoveTabToGroup"
          @reorder-group="handleReorderGroup"
        />
      </div>

      <!-- 暂存区组件 -->
      <StagingArea
        v-if="stagingAreaVisible"
        :stagingTabs="tabStore.stagingTabs"
        @clear-staging="tabStore.clearStaging"
        @restore-from-staging="tabStore.restoreFromStaging"
      />

      <!-- 编辑分组弹窗 -->
      <div v-if="showEditGroup" class="modal-overlay" @click="closeEditGroup">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>编辑分组</h3>
            <button @click="closeEditGroup" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>分组名称</label>
              <input 
                v-model="editingGroup.name" 
                type="text" 
                class="form-input" 
                placeholder="输入分组名称"
              />
            </div>
            <div class="form-group">
              <label>分组图标</label>
              <div class="icon-selector">
                <button 
                  v-for="icon in availableIcons" 
                  :key="icon"
                  @click="editingGroup.icon = icon"
                  :class="['icon-option', { selected: editingGroup.icon === icon }]"
                >
                  {{ icon }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>分组类型</label>
              <select v-model="editingGroup.type" class="form-select">
                <option value="manual">手动分组</option>
                <option value="domain">域名分组</option>
                <option value="keyword">关键词分组</option>
                <option value="time">时间分组</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeEditGroup" class="btn btn-outline">取消</button>
            <button @click="saveEditGroup" class="btn btn-primary">保存</button>
          </div>
        </div>
      </div>
    </main>

    <!-- 快照组件 -->
    <Snapshots
      :snapshots="snapshotStore.snapshots"
      @restore="restoreSnapshot"
      @delete="deleteSnapshot"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTabStore } from './stores/tabStore'
import { useSnapshotStore } from './stores/snapshotStore'
import Header from './components/Header.vue'
import Stats from './components/Stats.vue'
import TabGroup from './components/TabGroup.vue'
import StagingArea from './components/StagingArea.vue'
import Snapshots from './components/Snapshots.vue'

// 使用 stores
const tabStore = useTabStore()
const snapshotStore = useSnapshotStore()

// 响应式数据
const stagingAreaVisible = ref(false)
const showHelp = ref(false)
const showEditGroup = ref(false)
const editingGroup = ref({
  id: '',
  name: '',
  icon: '📁',
  type: 'manual'
})

// 可用图标列表
const availableIcons = [
  '📁', '📂', '🗂️', '📋', '📝', '📄', '📰', '📚', '📖', '📕', '📗', '📘', '📙',
  '🌐', '🌍', '🌎', '🌏', '🔗', '🔖', '🏷️', '📌', '📍', '🎯', '🎪', '🎨', '🎭',
  '💻', '💼', '💡', '🔧', '⚙️', '🎮', '🎵', '🎬', '📺', '📷', '📹', '🎥', '📱',
  '🛒', '💰', '💳', '📊', '📈', '📉', '📋', '✅', '❌', '⚠️', 'ℹ️', '🔍', '🔎',
  '⏰', '⏳', '⌛', '📅', '📆', '🗓️', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖',
  '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣'
]

// 方法
const toggleStagingArea = () => {
  stagingAreaVisible.value = !stagingAreaVisible.value
}

const createNewGroup = () => {
  editingGroup.value = {
    id: '',
    name: '',
    icon: '📁',
    type: 'manual'
  }
  showEditGroup.value = true
}

const editGroup = (groupId) => {
  const group = tabStore.groups.find(g => g.id === groupId)
  if (group) {
    editingGroup.value = {
      id: group.id,
      name: group.name,
      icon: group.icon,
      type: group.type || 'manual'
    }
    showEditGroup.value = true
  }
}

const closeEditGroup = () => {
  showEditGroup.value = false
  editingGroup.value = {
    id: '',
    name: '',
    icon: '📁',
    type: 'manual'
  }
}

const saveEditGroup = async () => {
  if (!editingGroup.value.name.trim()) {
    alert('请输入分组名称')
    return
  }
  
  try {
    if (editingGroup.value.id) {
      // 更新现有分组
      await tabStore.updateGroup(editingGroup.value)
    } else {
      // 创建新分组
      await tabStore.createManualGroup(editingGroup.value.name, editingGroup.value.icon)
    }
    closeEditGroup()
  } catch (error) {
    console.error('保存分组失败:', error)
    alert('保存分组失败：' + error.message)
  }
}

const deleteGroup = async (groupId) => {
  const group = tabStore.groups.find(g => g.id === groupId)
  if (!group) return
  
  const tabCount = group.tabs.length
  let message = `确定要删除分组"${group.name}"吗？`
  
  if (tabCount > 0) {
    message += `\n\n⚠️ 警告：该分组包含 ${tabCount} 个标签页`
    message += '\n\n删除分组将同时关闭所有标签页，此操作不可撤销！'
    message += '\n\n是否继续？'
  }
  
  if (confirm(message)) {
    try {
      await tabStore.deleteGroup(groupId)
    } catch (error) {
      console.error('删除分组失败:', error)
      alert('删除分组失败：' + error.message)
    }
  }
}

const createSnapshot = async () => {
  const name = prompt('请输入快照名称:')
  if (!name) return
  
  try {
    console.log('[UI] sending message to background.createSnapshot, name:', name)
    const resp = await new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({ action: 'createSnapshot', name }, (res) => {
          resolve(res)
        })
      } catch (err) {
        console.error('[UI] sendMessage error:', err)
        resolve({ success: false, error: err?.message || String(err) })
      }
    })
    
    console.log('[UI] background response (createSnapshot):', resp)
    if (!resp || !resp.success) {
      console.warn('[UI] bg createSnapshot failed, fallback to store.createSnapshot:', resp?.error)
      await snapshotStore.createSnapshot(name)
    }
    // 刷新本地快照列表
    await snapshotStore.initialize()
  } catch (e) {
    console.error('[UI] createSnapshot error:', e)
    alert('创建快照失败：' + (e?.message || e))
  }
}

const restoreSnapshot = async (snapshotId) => {
  console.log('[UI] restoreSnapshot click:', snapshotId)
  if (!confirm('确定要恢复这个工作区快照吗？')) return
  
  try {
    console.log('[UI] sending message to background.restoreSnapshot')
    const snapshotObj = snapshotStore.snapshots.find(s => s.id === snapshotId)
    console.log('[UI] found snapshot in UI store:', !!snapshotObj)
    
    const resp = await new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({ action: 'restoreSnapshot', snapshotId, snapshot: snapshotObj }, (res) => {
          resolve(res)
        })
      } catch (err) {
        console.error('[UI] sendMessage error:', err)
        resolve({ success: false, error: err?.message || String(err) })
      }
    })
    
    console.log('[UI] background response:', resp)
    if (!resp || !resp.success) {
      console.warn('[UI] bg restore failed, fallback to store.restoreSnapshot:', resp?.error)
      await snapshotStore.restoreSnapshot(snapshotId)
    }
    console.log('[UI] restoreSnapshot completed')
  } catch (e) {
    console.error('[UI] restoreSnapshot error:', e)
    alert('恢复快照失败：' + (e?.message || e))
  }
}

const deleteSnapshot = (snapshotId) => {
  if (confirm('确定要删除这个快照吗？')) {
    snapshotStore.deleteSnapshot(snapshotId)
  }
}

// 拖拽相关方法
const handleReorderTabs = ({ groupId, oldIndex, newIndex }) => {
  // 处理标签页重新排序
  console.log('重新排序标签页:', { groupId, oldIndex, newIndex })
}

const handleMoveTabToGroup = ({ tabId, fromGroupId, toGroupId, newIndex }) => {
  // 处理标签页移动到其他分组
  console.log('移动标签页:', { tabId, fromGroupId, toGroupId, newIndex })
  console.log('参数验证:')
  console.log('  tabId:', tabId, '(类型:', typeof tabId, ')')
  console.log('  fromGroupId:', fromGroupId, '(类型:', typeof fromGroupId, ')')
  console.log('  toGroupId:', toGroupId, '(类型:', typeof toGroupId, ')')
  console.log('  newIndex:', newIndex, '(类型:', typeof newIndex, ')')
  
  if (!toGroupId) {
    console.log('❌ toGroupId 为空，跳过移动操作')
    return
  }
  
  tabStore.moveTabToGroup(tabId, toGroupId)
}

const handleReorderGroup = ({ groupId, oldIndex, newIndex }) => {
  // 处理分组重新排序
  console.log('重新排序分组:', { groupId, oldIndex, newIndex })
  tabStore.moveGroup(groupId, newIndex)
}

// 初始化
onMounted(async () => {
  console.log('🚀 === App.vue 开始初始化 ===')
  
  // 在页面上显示初始化状态
  const statusDiv = document.createElement('div')
  statusDiv.id = 'init-status'
  statusDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #333; color: white; padding: 10px; border-radius: 5px; z-index: 9999; font-family: monospace; font-size: 12px; max-width: 300px;'
  document.body.appendChild(statusDiv)
  
  const updateStatus = (message) => {
    console.log(message)
    statusDiv.textContent = message
  }
  
  try {
    updateStatus('🚀 调用 tabStore.initialize()...')
    await tabStore.initialize()
    
    updateStatus('✅ Tab store 初始化完成')
    console.log('🚀 Tab store 初始化完成')
    console.log('🚀 当前分组数量:', tabStore.groups.length)
    console.log('🚀 当前分组策略:', tabStore.groupStrategy)
    console.log('🚀 分组详情:', tabStore.groups.map(g => `${g.name} (${g.tabs.length} 个标签页)`))
    
    updateStatus('🚀 调用 snapshotStore.initialize()...')
    await snapshotStore.initialize()
    updateStatus('✅ Snapshot store 初始化完成')
    console.log('🚀 Snapshot store 初始化完成')
    
    updateStatus('✅ 所有初始化完成')
    console.log('🚀 === App.vue 初始化完成 ===')
    
    // 3秒后隐藏状态显示
    setTimeout(() => {
      if (statusDiv.parentNode) {
        statusDiv.parentNode.removeChild(statusDiv)
      }
    }, 3000)
    
  } catch (error) {
    const errorMsg = `❌ 初始化失败: ${error.message}`
    updateStatus(errorMsg)
    console.error('❌ App.vue 初始化失败:', error)
    
    // 显示错误信息
    statusDiv.style.background = '#c00'
    statusDiv.innerHTML = `
      <div>${errorMsg}</div>
      <div style="font-size: 10px; margin-top: 5px;">${error.stack}</div>
    `
  }
})
</script>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  border-radius: 0;
  overflow-y: auto;
  box-shadow: none;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
  backdrop-filter: none;
}

.app::-webkit-scrollbar {
  width: 8px;
}

.app::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.app::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.app::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 使用说明样式 */
.help {
  margin: 8px 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.help ul {
  margin: 0;
  padding-left: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
}

.help li {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  list-style: disc;
}

.main {
  flex: 1;
  padding: 16px 12px 24px 12px;
  background: #f9fafb;
}

.tab-groups {
  max-width: 1200px;
  margin: 0 auto;
}

.groups-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.groups-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.no-groups {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.no-groups p {
  margin: 0;
  font-size: 14px;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  background: #4f46e5;
  border: 1px solid #4f46e5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn::before {
  display: none;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border-color: #6b7280;
}

.btn-small {
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  color: #111827;
  background: #ffffff;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
}

.icon-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #ffffff;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.icon-option:hover {
  border-color: #4f46e5;
  background: #f9fafb;
}

.icon-option.selected {
  border-color: #4f46e5;
  background: #4f46e5;
  color: #ffffff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main {
    padding: 12px 8px 20px 8px;
  }
  
  .groups-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .help ul {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px 20px;
  }
  
  .icon-selector {
    grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
    gap: 6px;
  }
  
  .icon-option {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .main {
    padding: 8px 4px 16px 4px;
  }
  
  .groups-header h3 {
    font-size: 16px;
  }
  
  .modal-content {
    width: 98%;
    margin: 10px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 12px 16px;
  }
}
</style>
