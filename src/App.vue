<template>
  <div class="app">
    <header class="header">
      <h1 class="title">
        <span class="icon">🎯</span>
        TabTamer
      </h1>
      <div class="header-actions">
        <button @click="createSnapshot" class="btn btn-primary">
          📸 快照
        </button>
        <button @click="toggleStagingArea" class="btn btn-secondary">
          📦 {{ stagingAreaVisible ? '收起' : '暂存区' }}
        </button>
      </div>
    </header>

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
              <span class="group-icon">{{ group.icon }}</span>
              <span class="group-name">{{ group.name }}</span>
              <span class="tab-count">({{ group.tabs.length }})</span>
            </div>
            <div class="group-actions">
              <button @click.stop="editGroup(group.id)" class="btn-icon">✏️</button>
              <button @click.stop="deleteGroup(group.id)" class="btn-icon">🗑️</button>
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
              <img :src="tab.favIconUrl || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><text y=%2214%22 font-size=%2212%22>🌐</text></svg>'" 
                   :alt="tab.title" 
                   class="tab-favicon" />
              <span class="tab-title">{{ tab.title }}</span>
              <div class="tab-actions">
                <button @click.stop="toggleTabDormant(tab.id)" class="btn-icon">
                  {{ tab.dormant ? '🔋' : '💤' }}
                </button>
                <button @click.stop="moveToStaging(tab.id)" class="btn-icon">📦</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 暂存区 -->
      <div v-if="stagingAreaVisible" class="staging-area">
        <div class="staging-header">
          <h3>📦 暂存区</h3>
          <button @click="clearStaging" class="btn btn-small">清空</button>
        </div>
        <div class="staging-tabs">
          <div 
            v-for="tab in stagingTabs" 
            :key="tab.id"
            class="tab-item staging-tab"
            @click="restoreFromStaging(tab.id)"
          >
            <img :src="tab.favIconUrl || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><text y=%2214%22 font-size=%2212%22>🌐</text></svg>'" 
                 :alt="tab.title" 
                 class="tab-favicon" />
            <span class="tab-title">{{ tab.title }}</span>
          </div>
        </div>
      </div>

      <!-- 工作区快照 -->
      <div class="snapshots">
        <h3>📸 工作区快照</h3>
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
            <button @click.stop="deleteSnapshot(snapshot.id)" class="btn-icon">🗑️</button>
          </div>
        </div>
      </div>
    </main>

    <!-- 统计信息 -->
    <footer class="footer">
      <div class="stats-dashboard">
        <!-- 内存使用表盘 -->
        <div class="stat-card memory-card">
          <div class="stat-header">
            <span class="stat-icon">💾</span>
            <span class="stat-title">内存使用</span>
          </div>
          <div class="stat-content">
            <div class="memory-gauge">
              <div class="gauge-circle">
                <svg class="gauge-svg" viewBox="0 0 120 120">
                  <circle class="gauge-background" cx="60" cy="60" r="50" />
                  <circle 
                    class="gauge-progress" 
                    cx="60" 
                    cy="60" 
                    r="50"
                    :stroke-dasharray="`${memoryEfficiency * 3.14} 314`"
                  />
                </svg>
                <div class="gauge-center">
                  <div class="gauge-value">{{ memoryEfficiency }}%</div>
                  <div class="gauge-label">效率</div>
                </div>
              </div>
            </div>
            <div class="memory-details">
              <div class="memory-item">
                <span class="memory-label">当前使用:</span>
                <span class="memory-value">{{ estimatedMemoryUsage }}MB</span>
              </div>
              <div class="memory-item">
                <span class="memory-label">已节省:</span>
                <span class="memory-value saved">{{ estimatedMemorySaved }}MB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 标签页统计 -->
        <div class="stat-card tabs-card">
          <div class="stat-header">
            <span class="stat-icon">📑</span>
            <span class="stat-title">标签页</span>
          </div>
          <div class="stat-content">
            <div class="tabs-stats">
              <div class="tab-stat-item">
                <div class="tab-stat-number">{{ totalTabs }}</div>
                <div class="tab-stat-label">总标签</div>
              </div>
              <div class="tab-stat-item">
                <div class="tab-stat-number active">{{ activeTabs }}</div>
                <div class="tab-stat-label">活跃</div>
              </div>
              <div class="tab-stat-item">
                <div class="tab-stat-number dormant">{{ dormantTabs }}</div>
                <div class="tab-stat-label">休眠</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分组统计 -->
        <div class="stat-card groups-card">
          <div class="stat-header">
            <span class="stat-icon">📁</span>
            <span class="stat-title">分组</span>
          </div>
          <div class="stat-content">
            <div class="groups-stats">
              <div class="group-stat-item">
                <div class="group-stat-number">{{ groupCount }}</div>
                <div class="group-stat-label">分组数</div>
              </div>
              <div class="group-stat-item">
                <div class="group-stat-number staging">{{ stagingCount }}</div>
                <div class="group-stat-label">暂存</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
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
  if (name) {
    await snapshotStore.createSnapshot(name)
  }
}

const restoreSnapshot = (snapshotId) => {
  if (confirm('确定要恢复这个工作区快照吗？')) {
    snapshotStore.restoreSnapshot(snapshotId)
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
  width: 500px;
  max-height: 700px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tab-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.tab-group {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #f8f9fa;
  cursor: pointer;
  border-bottom: 1px solid #e9ecef;
}

.group-header:hover {
  background: #e9ecef;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-name {
  font-weight: 600;
  color: #495057;
  font-size: 15px;
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
  max-height: 350px;
  overflow-y: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s;
}

.tab-item:hover {
  background: #f8f9fa;
}

.tab-item.is-dormant {
  opacity: 0.6;
  background: #f8f9fa;
}

.tab-favicon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tab-title {
  flex: 1;
  font-size: 15px;
  color: #495057;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.staging-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff3cd;
  border-bottom: 1px solid #ffeaa7;
}

.staging-header h3 {
  margin: 0;
  color: #856404;
}

.staging-tabs {
  max-height: 250px;
  overflow-y: auto;
}

.staging-tab {
  background: #fff3cd;
}

.snapshots {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 16px;
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

.stats-dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  max-width: 100%;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #495057;
}

.stat-icon {
  font-size: 16px;
}

.stat-title {
  font-size: 15px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 内存表盘样式 */
.memory-gauge {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.gauge-circle {
  position: relative;
  width: 90px;
  height: 90px;
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
  stroke: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
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
  font-weight: 700;
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
  font-size: 22px;
  font-weight: 700;
  color: #495057;
  line-height: 1;
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
  font-size: 22px;
  font-weight: 700;
  color: #495057;
  line-height: 1;
}

.group-stat-number.staging {
  color: #ffc107;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .stats-dashboard {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .gauge-circle {
    width: 60px;
    height: 60px;
  }
  
  .gauge-value {
    font-size: 14px;
  }
  
  .tab-stat-number,
  .group-stat-number {
    font-size: 18px;
  }
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background: #e9ecef;
}
</style>
