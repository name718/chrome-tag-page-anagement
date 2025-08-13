<template>
  <div class="app">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 class="title">TabTamer</h1>
          <span class="subtitle">智能标签页管理</span>
        </div>
        <div class="header-actions">
          <button @click="createSnapshot" class="btn btn-primary">创建快照</button>
          <button @click="toggleStagingArea" class="btn btn-secondary">{{ stagingAreaVisible ? '收起暂存区' : '打开暂存区' }}</button>
          <button @click="showHelp = !showHelp" class="btn btn-outline">{{ showHelp ? '关闭说明' : '使用说明' }}</button>
        </div>
      </div>
    </header>

    <!-- 使用说明 -->
    <div v-if="showHelp" class="help">
      <ul>
        <li>点击标签行：激活该标签页</li>
        <li>休眠/唤醒：将标签页休眠以节省内存，或恢复使用</li>
        <li>暂存：将标签页移入暂存区，稍后可从暂存区恢复</li>
        <li>分组标题：点击可折叠/展开分组</li>
        <li>编辑/删除分组：在分组右侧的“编辑/删除”按钮</li>
        <li>快照：保存当前工作区，稍后可一键恢复</li>
      </ul>
    </div>

    <!-- 统计仪表板 -->
    <div class="stats-section">
      <div class="stats-container">
        <!-- 概览卡片（紧凑型） -->
        <div class="stat-card overview-card">
          <div class="stat-header">
            <div class="stat-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor" class="stat-icon-svg">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            </div>
            <div class="stat-title-group">
              <h3 class="stat-title">概览</h3>
              <p class="stat-subtitle">内存与标签/分组</p>
            </div>
          </div>
          <div class="overview-content">
            <div class="overview-gauge">
              <div class="memory-gauge">
                <div class="gauge-container gauge-sm">
                  <svg class="gauge-svg" viewBox="0 0 120 120">
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#667eea"/>
                        <stop offset="100%" style="stop-color:#764ba2"/>
                      </linearGradient>
                    </defs>
                    <circle class="gauge-background" cx="60" cy="60" r="50" />
                    <circle class="gauge-progress" cx="60" cy="60" r="50" :stroke-dasharray="`${memoryEfficiency * 3.14} 314`" />
                  </svg>
                  <div class="gauge-center">
                    <div class="gauge-value">{{ memoryEfficiency }}%</div>
                    <div class="gauge-label">效率</div>
                  </div>
                </div>
              </div>
              <div class="memory-brief">
                <div class="kv"><span>使用</span><b>{{ estimatedMemoryUsage }}MB</b></div>
                <div class="kv"><span>节省</span><b class="ok">{{ estimatedMemorySaved }}MB</b></div>
              </div>
            </div>
            <div class="overview-metrics">
              <div class="metric">
                <div class="metric-title">标签页</div>
                <div class="metric-grid">
                  <div class="cell"><div class="num">{{ totalTabs }}</div><div class="lbl">总数</div></div>
                  <div class="cell"><div class="num ok">{{ activeTabs }}</div><div class="lbl">活跃</div></div>
                  <div class="cell"><div class="num muted">{{ dormantTabs }}</div><div class="lbl">休眠</div></div>
                </div>
              </div>
              <div class="metric">
                <div class="metric-title">分组</div>
                <div class="metric-grid">
                  <div class="cell"><div class="num">{{ groupCount }}</div><div class="lbl">分组</div></div>
                  <div class="cell"><div class="num warn">{{ stagingCount }}</div><div class="lbl">暂存</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <main class="main">
      <!-- 标签页分组 -->
      <div class="tab-groups">
        <div 
          v-for="group in tabGroups" 
          :key="group.id" 
          class="tab-group"
          :class="{ 'is-collapsed': group.collapsed }"
        >
          <div class="group-header" @click="toggleGroup(group.id)">
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
              <button @click.stop="editGroup(group.id)" class="btn btn-small" title="编辑分组">编辑</button>
              <button @click.stop="deleteGroup(group.id)" class="btn btn-small" title="删除分组">删除</button>
            </div>
          </div>
          
          <div v-show="!group.collapsed" class="group-tabs">
            <div 
              v-for="tab in group.tabs" 
              :key="tab.id"
              class="tab-item"
              :class="{ 'is-dormant': tab.dormant }"
              @click="activateTab(tab.id)"
              draggable="true"
              @dragstart="onDragStart($event, tab)"
              @dragover="onDragOver($event)"
              @drop="onDrop($event, group.id)"
            >
              <div class="tab-favicon-wrapper">
                <img :src="tab.favIconUrl || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><text y=%2214%22 font-size=%2212%22>🌐</text></svg>'" 
                     :alt="tab.title" 
                     class="tab-favicon" />
              </div>
              <div class="tab-content">
                <span class="tab-title" :title="tab.title">{{ tab.title }}</span>
                <span class="tab-url">{{ tab.url }}</span>
              </div>
              <div class="tab-actions">
                <button @click.stop="toggleTabDormant(tab.id)" class="btn btn-small" :title="tab.dormant ? '唤醒标签页' : '休眠标签页'">{{ tab.dormant ? '唤醒' : '休眠' }}</button>
                <button @click.stop="moveToStaging(tab.id)" class="btn btn-small" title="移动到暂存区">暂存</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 暂存区 -->
      <div v-if="stagingAreaVisible" class="staging-area">
        <div class="staging-header">
          <div class="staging-title">
            <div class="staging-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor" class="staging-icon-svg">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              </svg>
            </div>
            <div>
              <h3>暂存区</h3>
              <p>临时存放的标签页</p>
            </div>
          </div>
          <button @click="clearStaging" class="btn btn-outline">清空暂存区</button>
        </div>
        <div class="staging-tabs">
          <div 
            v-for="tab in stagingTabs" 
            :key="tab.id"
            class="tab-item staging-tab"
            @click="restoreFromStaging(tab.id)"
          >
            <div class="tab-favicon-wrapper">
              <img :src="tab.favIconUrl || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><text y=%2214%22 font-size=%2212%22>🌐</text></svg>'" 
                   :alt="tab.title" 
                   class="tab-favicon" />
            </div>
            <div class="tab-content">
              <span class="tab-title">{{ tab.title }}</span>
              <span class="tab-url">{{ tab.url }}</span>
            </div>
            <button class="btn btn-small" title="恢复标签页">恢复</button>
          </div>
        </div>
      </div>

      <!-- 工作区快照 -->
      <div class="snapshots">
        <div class="snapshots-header">
          <div class="snapshots-title">
            <div class="snapshots-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor" class="snapshots-icon-svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h3>工作区快照</h3>
              <p>保存和恢复工作状态</p>
            </div>
          </div>
        </div>
        <div class="snapshot-list">
          <div 
            v-for="snapshot in snapshots" 
            :key="snapshot.id"
            class="snapshot-item"
            @click="restoreSnapshot(snapshot.id)"
          >
            <div class="snapshot-info">
              <span class="snapshot-name">{{ snapshot.name }}</span>
              <span class="snapshot-date">{{ formatDate(snapshot.createdAt) }}</span>
            </div>
            <button @click.stop="deleteSnapshot(snapshot.id)" class="btn btn-small" title="删除快照">删除</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTabStore } from './stores/tabStore'
import { useSnapshotStore } from './stores/snapshotStore'

const tabStore = useTabStore()
const snapshotStore = useSnapshotStore()

// 响应式数据
const stagingAreaVisible = ref(false)
const showHelp = ref(false)
const tabGroups = computed(() => tabStore.groups)
const stagingTabs = computed(() => tabStore.stagingTabs)
const snapshots = computed(() => snapshotStore.snapshots)
const totalTabs = computed(() => tabStore.totalTabs)
const dormantTabs = computed(() => tabStore.dormantTabs)
const activeTabs = computed(() => tabStore.activeTabs)
const memorySaved = computed(() => tabStore.memorySaved)
const estimatedMemoryUsage = computed(() => tabStore.estimatedMemoryUsage)
const estimatedMemorySaved = computed(() => tabStore.estimatedMemorySaved)
const memoryEfficiency = computed(() => tabStore.memoryEfficiency)
const groupCount = computed(() => tabStore.groupCount)
const stagingCount = computed(() => tabStore.stagingCount)

// 方法
const toggleStagingArea = () => {
  stagingAreaVisible.value = !stagingAreaVisible.value
}

const toggleGroup = (groupId) => {
  tabStore.toggleGroupCollapse(groupId)
}

const editGroup = (groupId) => {
  // 实现编辑分组逻辑
  console.log('编辑分组:', groupId)
}

const deleteGroup = (groupId) => {
  if (confirm('确定要删除这个分组吗？')) {
    tabStore.deleteGroup(groupId)
  }
}

const activateTab = (tabId) => {
  tabStore.activateTab(tabId)
}

const toggleTabDormant = (tabId) => {
  tabStore.toggleTabDormant(tabId)
}

const moveToStaging = (tabId) => {
  tabStore.moveToStaging(tabId)
}

const restoreFromStaging = (tabId) => {
  tabStore.restoreFromStaging(tabId)
}

const clearStaging = () => {
  if (confirm('确定要清空暂存区吗？')) {
    tabStore.clearStaging()
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
    const snapshotObj = snapshots.value.find(s => s.id === snapshotId)
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

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 拖拽功能
const onDragStart = (event, tab) => {
  event.dataTransfer.setData('text/plain', JSON.stringify(tab))
}

const onDragOver = (event) => {
  event.preventDefault()
}

const onDrop = (event, groupId) => {
  event.preventDefault()
  const tabData = JSON.parse(event.dataTransfer.getData('text/plain'))
  tabStore.moveTabToGroup(tabData.id, groupId)
}

// 初始化
onMounted(async () => {
  await tabStore.initialize()
  await snapshotStore.initialize()
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #ffffff;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
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

.brand-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 3px; background: #eef2f7; }

.icon-svg {
  width: 24px;
  height: 24px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 6px;
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

.btn { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; font-size: 12px; font-weight: 500; color: #fff; background: #4f46e5; border: 1px solid #4f46e5; border-radius: 4px; cursor: pointer; }

.btn::before { display: none; }

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover { background: #007bff; }

.btn-glow { background: #4f46e5; box-shadow: none; border: 1px solid #4f46e5; }

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover { background: #6c757d; }

.btn-outline {
  background: transparent;
  border: 1px solid #667eea;
  color: #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 36px;
}

.btn-icon:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.btn-icon.danger:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  transform: scale(1.1);
}

.btn-icon.restore:hover {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  transform: scale(1.1);
}

.main {
  flex: 1;
  overflow: hidden;
  padding: 12px;
  background: #ffffff;
  backdrop-filter: none;
}

.tab-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.tab-group {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.08);
  overflow: hidden;
  margin-bottom: 12px;
  border: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.tab-group:hover { background: #fff; }

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8f9fa;
  cursor: pointer;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.group-header:hover {
  background: #eef1f4;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.group-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border-radius: 6px;
}

.group-icon {
  font-size: 18px;
  color: #495057;
}

.group-name {
  font-weight: 600;
  color: #495057;
  font-size: 16px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.group-details {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tab-count {
  color: #6c757d;
  font-size: 14px;
}

.group-actions {
  display: flex;
  gap: 4px;
}

.group-tabs {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.tab-item:hover {
  background: #f8f9fa;
}





.tab-item.is-dormant {
  opacity: 0.6;
  background: #f8f9fa;
}

.tab-favicon-wrapper {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tab-favicon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tab-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tab-title {
  font-size: 15px;
  color: #495057;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  min-width: 0;
  max-width: 100%;
}

.tab-url {
  font-size: 12px;
  color: #6c757d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.tab-item:hover .tab-actions {
  opacity: 1;
}

.staging-area {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  margin-bottom: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.staging-area:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.staging-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border-bottom: 1px solid rgba(255, 193, 7, 0.3);
}

.staging-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.staging-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffeaa7;
  border-radius: 6px;
}

.staging-icon-svg {
  width: 20px;
  height: 20px;
  color: #856404;
}

.staging-header h3 {
  margin: 0;
  color: #856404;
}

.staging-header p {
  margin: 0;
  font-size: 12px;
  color: #856404;
}

.staging-tabs {
  max-height: 300px;
  overflow-y: auto;
}

.staging-tab {
  background: #fff3cd;
}

.staging-tab .tab-favicon-wrapper {
  background: #ffeaa7;
}

.staging-tab .tab-favicon {
  filter: invert(80%) sepia(100%) saturate(700%) hue-rotate(30deg) brightness(100%) contrast(100%);
}

.staging-tab .tab-content {
  color: #856404;
}

.staging-tab .tab-url {
  color: #856404;
}

.staging-tab .tab-actions {
  opacity: 1;
}

.staging-tab .tab-actions .btn-icon {
  background: #ffeaa7;
  color: #856404;
}

.staging-tab .tab-actions .btn-icon:hover {
  background: #ffeaa7;
  color: #856404;
}

.staging-tab .tab-actions .btn-icon.restore:hover {
  background: #ffeaa7;
  color: #856404;
}

.snapshots {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.snapshots:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.snapshots-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.snapshots-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.snapshots-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border-radius: 6px;
}

.snapshots-icon-svg {
  width: 20px;
  height: 20px;
  color: #495057;
}

.snapshots h3 {
  margin: 0 0 12px 0;
  color: #495057;
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
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.snapshot-item:hover {
  background: #e9ecef;
}

.snapshot-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.snapshot-name {
  font-weight: 500;
  color: #495057;
}

.snapshot-date {
  font-size: 12px;
  color: #6c757d;
}

.footer {
  padding: 16px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.stats-section {
  padding: 8px 12px 0 12px;
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  backdrop-filter: none;
}

.stats-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  max-width: 100%;
}

.stat-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.08);
  transition: background-color 0.2s ease;
  border: 1px solid #e9ecef;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  background: #f8f9fa;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
}

.stat-icon-wrapper {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 10px;
  color: white;
  transition: all 0.3s ease;
}

.stat-icon-wrapper:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.stat-icon-svg {
  width: 14px;
  height: 14px;
  color: white;
}

.stat-title-group {
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 13px;
}

.stat-subtitle {
  font-size: 11px;
  color: #6c757d;
  margin-top: 4px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 概览卡片紧凑布局 */
.overview-card .overview-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 12px;
}

.gauge-sm { width: 56px; height: 56px; }
.overview-gauge { display:flex; align-items:center; gap: 8px; }
.memory-brief { display:flex; flex-direction: column; gap: 4px; }
.memory-brief .kv { display:flex; align-items:center; gap:6px; font-size:12px; color:#374151; }
.memory-brief .kv .ok { color:#28a745; }

.overview-metrics { display:grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.metric { background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:8px; }
.metric-title { font-size:12px; color:#6b7280; margin-bottom:6px; }
.metric-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:6px; }
.metric-grid .cell { text-align:center; }
.metric-grid .num { font-size:14px; font-weight:700; color:#111827; }
.metric-grid .num.ok { color:#28a745; }
.metric-grid .num.muted { color:#6c757d; }
.metric-grid .num.warn { color:#ff9800; }
.metric-grid .lbl { font-size:10px; color:#6b7280; }

/* 内存表盘样式 */
.memory-gauge {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.gauge-container {
  position: relative;
  width: 80px;
  height: 80px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-background {
  fill: none;
  stroke: #e9ecef;
  stroke-width: 8;
}

.gauge-progress {
  fill: none;
  stroke: url(#gaugeGradient);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
}

.gauge-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.gauge-value {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
  line-height: 1;
}

.gauge-label {
  font-size: 10px;
  color: #6c757d;
  margin-top: 2px;
}

.memory-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.memory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.memory-label {
  color: #6c757d;
}

.memory-value {
  font-weight: 600;
  color: #495057;
}

.memory-value.current {
  color: #007bff;
}

.memory-value.saved {
  color: #28a745;
}

/* 标签页统计样式 */
.tabs-stats {
  display: flex;
  justify-content: space-around;
  gap: 8px;
}

.tab-stat-item {
  text-align: center;
  flex: 1;
}

.tab-stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #495057;
  line-height: 1;
}

.tab-stat-number.total {
  color: #495057;
}

.tab-stat-number.active {
  color: #28a745;
}

.tab-stat-number.dormant {
  color: #6c757d;
}

.tab-stat-label {
  font-size: 10px;
  color: #6c757d;
  margin-top: 4px;
}

/* 分组统计样式 */
.groups-stats {
  display: flex;
  justify-content: space-around;
  gap: 8px;
}

.group-stat-item {
  text-align: center;
  flex: 1;
}

.group-stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #495057;
  line-height: 1;
}

.group-stat-number.total {
  color: #495057;
}

.group-stat-number.staging {
  color: #ffc107;
}

.group-stat-label {
  font-size: 10px;
  color: #6c757d;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app {
    width: 100%;
    border-radius: 0;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
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

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .gauge-container {
    width: 60px;
    height: 60px;
  }
  
  .gauge-value {
    font-size: 16px;
  }
  
  .tab-stat-number,
  .group-stat-number {
    font-size: 20px;
  }
  
  .header {
    padding: 16px 20px;
  }
  
  .main {
    padding: 16px 16px 24px 16px;
  }
}

/* 加载动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(2) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.2s;
}

/* 悬停效果增强 */
.tab-group:hover .group-header {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
}

.tab-item:hover .tab-actions {
  opacity: 1;
  transform: translateX(0);
}

.tab-actions {
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}
</style>
