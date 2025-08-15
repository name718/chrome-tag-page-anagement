<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->

<template>
  <div class="app">
    <!-- 头部组件 -->
    <Header 
        :stagingVisible="stagingAreaVisible" 
        :showHelp="showHelp"
        @create-snapshot="createSnapshot"
        @toggle-staging="toggleStagingArea"
        @toggle-help="showHelp = !showHelp"
      />

    <!-- 使用说明 -->
    <div v-if="showHelp" class="help">
      <ul>
        <li>{{ $t('help.clickTab') }}</li>
        <li>{{ $t('help.dormant') }}</li>
        <li>{{ $t('help.staging') }}</li>
        <li>{{ $t('help.groupTitle') }}</li>
        <li>{{ $t('help.editDelete') }}</li>
        <li>{{ $t('help.snapshot') }}</li>
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
          <h3>{{ $t('main.tabGroups') }}</h3>
          <div class="header-left">
            <!-- 分组策略选择器 -->
            <!-- <div class="strategy-selector">
              <select 
                :value="tabStore.groupStrategy" 
                @change="(e) => tabStore.groupStrategy = e.target.value"
                class="strategy-select"
              >
                <option value="manual">📋 {{ $t('modal.manual') }}</option>
                <option value="domain">🌐 {{ $t('modal.domain') }}</option>
                <option value="keyword">🔍 {{ $t('modal.keyword') }}</option>
                <option value="time">⏰ {{ $t('modal.time') }}</option>
              </select>
            </div> -->
            <!-- 刷新分组按钮 -->
            <button @click="refreshGroups" class="btn btn-outline btn-small tooltip" :data-tooltip="$t('main.refreshGroupsTooltip')">
              <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              <span>{{ $t('main.refreshGroups') }}</span>
            </button>
            <!-- 新建分组按钮 -->
            <button @click="createNewGroup" class="btn btn-outline btn-small tooltip" :data-tooltip="$t('main.newGroup')">
              <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span>{{ $t('main.newGroup') }}</span>
            </button>
          </div>
        </div>

        <!-- 分组列表 -->
        <div v-if="tabStore.groups.length === 0" class="no-groups">
          <p>{{ $t('main.noGroups') }}</p>
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
            <h3>{{ $t('modal.editGroup') }}</h3>
            <button @click="closeEditGroup" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>{{ $t('modal.groupName') }}</label>
              <input 
                v-model="editingGroup.name" 
                type="text" 
                class="form-input" 
                :placeholder="$t('modal.enterGroupName')"
              />
            </div>
            <div class="form-group">
              <label>{{ $t('modal.groupIcon') }}</label>
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
              <label>{{ $t('modal.groupColor') }}</label>
              <div class="color-selector">
                <button 
                  v-for="color in availableColors" 
                  :key="color"
                  @click="editingGroup.color = color"
                  :class="['color-option', { selected: editingGroup.color === color }]"
                  :style="{ backgroundColor: color }"
                  :title="color"
                >
                  <span v-if="editingGroup.color === color" class="color-check">✓</span>
                </button>
                <input 
                  v-model="editingGroup.color" 
                  type="color" 
                  class="color-input"
                  :title="$t('modal.customColor')"
                />
              </div>
            </div>
            <div class="form-group">
              <label>{{ $t('modal.groupType') }}</label>
              <select v-model="editingGroup.type" class="form-select">
                <option value="manual">{{ $t('modal.manual') }}</option>
                <option value="domain">{{ $t('modal.domain') }}</option>
                <option value="keyword">{{ $t('modal.keyword') }}</option>
                <option value="time">{{ $t('modal.time') }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeEditGroup" class="btn btn-outline">{{ $t('modal.cancel') }}</button>
            <button @click="saveEditGroup" class="btn btn-primary">{{ $t('modal.save') }}</button>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
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

// 简单的国际化函数
const $t = (key) => {
  const lang = localStorage.getItem('language') || 'zh_CN'
  const messages = {
    zh_CN: {
      // Header
      'header.subtitle': '智能标签页管理',
      'header.createSnapshot': '创建快照',
      'header.snapshot': '快照',
      'header.staging': '暂存',
      'header.toggleStaging': '收起暂存区',
      'header.openStaging': '打开暂存区',
      'header.help': '帮助',
      'header.closeHelp': '关闭说明',
      'header.showHelp': '使用说明',
      'header.github': 'GitHub',
      'header.githubTooltip': '在 GitHub 上查看源代码',
      
      // Stats
      'stats.overview': '概览',
      'stats.overviewSubtitle': '内存与标签/分组',
      'stats.memoryEfficiency': '内存效率',
      'stats.tabs': '标签页',
      'stats.active': '活跃',
      'stats.dormant': '休眠',
      'stats.groups': '分组',
      'stats.staging': '暂存',
      'stats.used': '使用',
      'stats.saved': '节省',
      
      // Main
      'main.tabGroups': '标签页分组',
      'main.newGroup': '新建分组',
      'main.refreshGroups': '刷新分组',
      'main.refreshGroupsTooltip': '重新按照当前策略进行分组',
      'main.noGroups': '暂无分组，请选择分组策略或等待自动分组',
      
      // Group
      'group.dragSort': '拖拽排序分组',
      'group.edit': '编辑分组',
      'group.delete': '删除分组',
      'group.empty': '分组为空',
      'group.emptySubtitle': '拖拽标签页到这里或从其他分组移动',
      
      // Tabs
      'tabs.count': '个标签',
      'tab.wakeUp': '唤醒标签页',
      'tab.sleep': '休眠标签页',
      'tab.moveToStaging': '移动到暂存区',
      
      // Staging
      'staging.title': '暂存区',
      'staging.subtitle': '临时存放的标签页',
      'staging.clear': '清空暂存区',
      'staging.clearTooltip': '清空暂存区',
      'staging.restore': '恢复标签页',
      
      // Snapshots
      'snapshots.title': '工作区快照',
      'snapshots.subtitle': '保存和恢复工作状态',
      'snapshots.delete': '删除快照',
      'snapshots.deleteTooltip': '删除快照',
      
      // Options
      'options.autoGrouping': '自动分组',
      'options.autoGroupingDesc': '根据域名、关键词或时间自动创建分组',
      'options.keywords': '关键词',
      'options.keywordsDesc': '用于关键词分组的标签，用逗号分隔',
      'options.dormancyThreshold': '休眠阈值（分钟）',
      'options.dormancyThresholdDesc': '标签页在指定时间内未激活将自动休眠以节省内存',
      'options.enableDormancy': '启用自动休眠',
      'options.enableDormancyDesc': '自动休眠长时间未使用的标签页',
      'options.maxTabsPerWindow': '每个窗口最大标签页数',
      'options.maxTabsPerWindowDesc': '超过此数量的标签页将被建议移动到暂存区',
      'options.enableStagingArea': '启用暂存区',
      'options.enableStagingAreaDesc': '允许将标签页移动到暂存区以节省主界面空间',
      'options.snapshotSettings': '快照设置',
      'options.maxSnapshots': '最大快照数量',
      'options.maxSnapshotsDesc': '超过此数量的快照将被自动删除（保留最新的）',
      'options.autoBackup': '自动备份快照',
      'options.autoBackupDesc': '定期自动创建当前工作区的快照',
      'options.dataManagement': '数据管理',
      'options.exportData': '📤 导出数据',
      'options.importData': '📥 导入数据',
      'options.clearData': '🗑️ 清除所有数据',
      
      // Help
      'help.clickTab': '点击标签行：激活该标签页',
      'help.dormant': '休眠/唤醒：将标签页休眠以节省内存，或恢复使用',
      'help.staging': '暂存：将标签页移入暂存区，稍后可从暂存区恢复',
      'help.groupTitle': '分组标题：点击可折叠/展开分组',
      'help.editDelete': '编辑/删除分组：在分组右侧的"编辑/删除"按钮',
      'help.snapshot': '快照：保存当前工作区，稍后可一键恢复',
      
      // Modal
      'modal.editGroup': '编辑分组',
      'modal.groupName': '分组名称',
      'modal.groupIcon': '分组图标',
      'modal.groupColor': '分组颜色',
      'modal.groupType': '分组类型',
      'modal.enterGroupName': '输入分组名称',
      'modal.customColor': '自定义颜色',
      'modal.manual': '手动分组',
      'modal.domain': '域名分组',
      'modal.keyword': '关键词分组',
      'modal.time': '时间分组',
      'modal.cancel': '取消',
      'modal.save': '保存',
      
      // Actions
      'actions.deleteGroupConfirm': '确定要删除分组"{name}"吗？',
      'actions.deleteGroupWarning': '⚠️ 警告：该分组包含 {count} 个标签页',
      'actions.deleteGroupIrreversible': '删除分组将同时关闭所有标签页，此操作不可撤销！',
      'actions.continue': '继续',
      'actions.refreshGroupsConfirm': '确定要刷新分组吗？',
      'actions.refreshGroupsWarning': '⚠️ 警告：这将清空所有现有分组！',
      'actions.refreshGroupsIrreversible': '所有分组将被删除，标签页将重新分组，用户编辑过的分组信息将丢失！',
      'actions.refreshGroupsSuccess': '分组刷新成功！',
      'actions.enterSnapshotName': '请输入快照名称:',
      'actions.saveFailed': '保存分组失败',
      'actions.deleteFailed': '删除分组失败',
      'actions.snapshotFailed': '创建快照失败',
      'actions.snapshotRestoreFailed': '恢复快照失败',
      'actions.refreshGroupsFailed': '刷新分组失败',
      
      // Snapshots
      'snapshots.deleteConfirm': '确定要删除这个快照吗？',
      'snapshots.restoreConfirm': '确定要恢复这个工作区快照吗？'
    },
    en: {
      // Header
      'header.subtitle': 'Smart Tab Management',
      'header.createSnapshot': 'Create Snapshot',
      'header.snapshot': 'Snapshot',
      'header.staging': 'Staging',
      'header.toggleStaging': 'Hide Staging Area',
      'header.openStaging': 'Show Staging Area',
      'header.help': 'Help',
      'header.closeHelp': 'Close Help',
      'header.showHelp': 'Show Help',
      'header.github': 'GitHub',
      'header.githubTooltip': 'View source code on GitHub',
      
      // Stats
      'stats.overview': 'Overview',
      'stats.overviewSubtitle': 'Memory & Tabs/Groups',
      'stats.memoryEfficiency': 'Memory Efficiency',
      'stats.tabs': 'Tabs',
      'stats.active': 'Active',
      'stats.dormant': 'Dormant',
      'stats.groups': 'Groups',
      'stats.staging': 'Staging',
      'stats.used': 'Used',
      'stats.saved': 'Saved',
      
      // Main
      'main.tabGroups': 'Tab Groups',
      'main.newGroup': 'New Group',
      'main.refreshGroups': 'Refresh Groups',
      'main.refreshGroupsTooltip': 'Re-group tabs according to current strategy',
      'main.noGroups': 'No groups yet. Please select a grouping strategy or wait for auto-grouping',
      
      // Group
      'group.dragSort': 'Drag to sort groups',
      'group.edit': 'Edit Group',
      'group.delete': 'Delete Group',
      'group.empty': 'Group is Empty',
      'group.emptySubtitle': 'Drag tabs here or move from other groups',
      
      // Tabs
      'tabs.count': 'tabs',
      'tab.wakeUp': 'Wake Up Tab',
      'tab.sleep': 'Sleep Tab',
      'tab.moveToStaging': 'Move to Staging Area',
      
      // Staging
      'staging.title': 'Staging Area',
      'staging.subtitle': 'Temporarily stored tabs',
      'staging.clear': 'Clear Staging Area',
      'staging.clearTooltip': 'Clear Staging Area',
      'staging.restore': 'Restore Tab',
      
      // Snapshots
      'snapshots.title': 'Workspace Snapshots',
      'snapshots.subtitle': 'Save and restore workspace state',
      'snapshots.delete': 'Delete Snapshot',
      'snapshots.deleteTooltip': 'Delete Snapshot',
      
      // Options
      'options.autoGrouping': 'Auto Grouping',
      'options.autoGroupingDesc': 'Automatically create groups based on domain, keywords, or time',
      'options.keywords': 'Keywords',
      'options.keywordsDesc': 'Keywords for keyword grouping, separated by commas',
      'options.dormancyThreshold': 'Dormancy Threshold (minutes)',
      'options.dormancyThresholdDesc': 'Tabs inactive for this duration will be automatically put to sleep to save memory',
      'options.enableDormancy': 'Enable Auto Dormancy',
      'options.enableDormancyDesc': 'Automatically put unused tabs to sleep',
      'options.maxTabsPerWindow': 'Max Tabs Per Window',
      'options.maxTabsPerWindowDesc': 'Tabs exceeding this count will be suggested to move to staging area',
      'options.enableStagingArea': 'Enable Staging Area',
      'options.enableStagingAreaDesc': 'Allow tabs to be moved to staging area to save main interface space',
      'options.snapshotSettings': 'Snapshot Settings',
      'options.maxSnapshots': 'Max Snapshots',
      'options.maxSnapshotsDesc': 'Snapshots exceeding this count will be automatically deleted (keep latest)',
      'options.autoBackup': 'Auto Backup',
      'options.autoBackupDesc': 'Periodically create snapshots of current workspace',
      'options.dataManagement': 'Data Management',
      'options.exportData': '📤 Export Data',
      'options.importData': '📥 Import Data',
      'options.clearData': '🗑️ Clear All Data',
      
      // Help
      'help.clickTab': 'Click tab row: Activate the tab',
      'help.dormant': 'Dormant/Wake: Put tabs to sleep to save memory, or restore',
      'help.staging': 'Staging: Move tabs to staging area, can be restored later',
      'help.groupTitle': 'Group title: Click to collapse/expand group',
      'help.editDelete': 'Edit/Delete group: Use "Edit/Delete" buttons on the right',
      'help.snapshot': 'Snapshot: Save current workspace, can be restored with one click',
      
      // Modal
      'modal.editGroup': 'Edit Group',
      'modal.groupName': 'Group Name',
      'modal.groupIcon': 'Group Icon',
      'modal.groupColor': 'Group Color',
      'modal.groupType': 'Group Type',
      'modal.enterGroupName': 'Enter group name',
      'modal.customColor': 'Custom Color',
      'modal.manual': 'Manual',
      'modal.domain': 'Domain',
      'modal.keyword': 'Keyword',
      'modal.time': 'Time',
      'modal.cancel': 'Cancel',
      'modal.save': 'Save',
      
      // Actions
      'actions.deleteGroupConfirm': 'Are you sure you want to delete group "{name}"?',
      'actions.deleteGroupWarning': '⚠️ Warning: This group contains {count} tabs',
      'actions.deleteGroupIrreversible': 'Deleting the group will close all tabs. This action cannot be undone!',
      'actions.continue': 'Continue',
      'actions.refreshGroupsConfirm': 'Are you sure you want to refresh groups?',
      'actions.refreshGroupsWarning': '⚠️ Warning: This will clear all existing groups!',
      'actions.refreshGroupsIrreversible': 'All groups will be deleted, tabs will be re-grouped, and user-edited group information will be lost!',
      'actions.refreshGroupsSuccess': 'Groups refreshed successfully!',
      'actions.enterSnapshotName': 'Please enter snapshot name:',
      'actions.saveFailed': 'Failed to save group',
      'actions.deleteFailed': 'Failed to delete group',
      'actions.snapshotFailed': 'Failed to create snapshot',
      'actions.snapshotRestoreFailed': 'Failed to restore snapshot',
      'actions.refreshGroupsFailed': 'Failed to refresh groups',
      
      // Snapshots
      'snapshots.deleteConfirm': 'Are you sure you want to delete this snapshot?',
      'snapshots.restoreConfirm': 'Are you sure you want to restore this workspace snapshot?'
    }
  }
  
  let message = messages[lang]?.[key] || key
  
  // 简单的参数替换
  if (key.includes('{name}') && arguments[1]?.name) {
    message = message.replace('{name}', arguments[1].name)
  }
  if (key.includes('{count}') && arguments[1]?.count) {
    message = message.replace('{count}', arguments[1].count)
  }
  
  return message
}

// 响应式数据
const stagingAreaVisible = ref(false)
const showHelp = ref(false)
const showEditGroup = ref(false)
const editingGroup = ref({
  id: '',
  name: '',
  icon: '📁',
  type: 'manual',
  color: '#6366f1' // 默认蓝色
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

// 预定义颜色列表
const availableColors = [
  '#6366f1', // 蓝色
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#ef4444', // 红色
  '#f97316', // 橙色
  '#eab308', // 黄色
  '#22c55e', // 绿色
  '#06b6d4', // 青色
  '#3b82f6', // 深蓝色
  '#f59e0b', // 琥珀色
  '#10b981', // 翠绿色
  '#dc2626', // 深红色
  '#7c3aed', // 深紫色
  '#059669', // 深绿色
  '#0891b2', // 深青色
  '#ea580c', // 深橙色
  '#db2777', // 深粉色
  '#65a30d', // 酸橙色
  '#16a34a', // 翠绿色
  '#0d9488'  // 蓝绿色
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
    type: 'manual',
    color: '#6366f1' // 默认蓝色
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
      type: group.type || 'manual',
      color: group.color || '#6366f1' // 加载分组的颜色
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
    type: 'manual',
    color: '#6366f1' // 默认蓝色
  }
}

const saveEditGroup = async () => {
  if (!editingGroup.value.name.trim()) {
    alert($t('modal.enterGroupName'))
    return
  }
  
  try {
    if (editingGroup.value.id) {
      // 更新现有分组
      await tabStore.updateGroup(editingGroup.value)
    } else {
      // 创建新分组
      await tabStore.createManualGroup(editingGroup.value.name, editingGroup.value.icon, editingGroup.value.color)
    }
    closeEditGroup()
      } catch (error) {
      console.error('保存分组失败:', error)
      alert($t('actions.saveFailed') + '：' + error.message)
    }
}

const deleteGroup = async (groupId) => {
  const group = tabStore.groups.find(g => g.id === groupId)
  if (!group) return
  
  const tabCount = group.tabs.length
  let message = $t('actions.deleteGroupConfirm', { name: group.name })
  
  if (tabCount > 0) {
    message += `\n\n${$t('actions.deleteGroupWarning', { count: tabCount })}`
    message += `\n\n${$t('actions.deleteGroupIrreversible')}`
    message += `\n\n${$t('actions.continue')}？`
  }
  
  if (confirm(message)) {
    try {
      await tabStore.deleteGroup(groupId)
    } catch (error) {
      console.error('删除分组失败:', error)
      alert($t('actions.deleteFailed') + '：' + error.message)
    }
  }
}

// 刷新分组功能
const refreshGroups = async () => {
  try {
    console.log('用户点击刷新分组按钮')
    
    // 第一步：获取确认信息
    const result = await tabStore.refreshGroups()
    
    if (result.needsConfirmation) {
      // 显示确认对话框
      const confirmed = confirm(result.message)
      
      if (confirmed) {
        // 用户确认，执行刷新
        console.log('用户确认刷新分组，开始执行...')
        const refreshResult = await tabStore.refreshGroups('CONFIRM_REFRESH_GROUPS')
        
        if (refreshResult.success) {
          alert(refreshResult.message)
          console.log('分组刷新成功:', refreshResult)
        } else {
          throw new Error('刷新分组返回失败状态')
        }
      } else {
        console.log('用户取消刷新分组')
      }
    } else {
      // 直接执行刷新（这种情况不应该发生）
      console.warn('刷新分组不需要确认，直接执行')
      const refreshResult = await tabStore.refreshGroups('CONFIRM_REFRESH_GROUPS')
      
      if (refreshResult.success) {
        alert(refreshResult.message)
        console.log('分组刷新成功:', refreshResult)
      } else {
        throw new Error('刷新分组返回失败状态')
      }
    }
    
  } catch (error) {
    console.error('刷新分组失败:', error)
    alert($t('actions.refreshGroupsFailed') + '：' + (error?.message || error))
  }
}

const createSnapshot = async () => {
  const name = prompt($t('actions.enterSnapshotName'))
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
      alert($t('actions.snapshotFailed') + '：' + (e?.message || e))
    }
}

const restoreSnapshot = async (snapshotId) => {
  console.log('[UI] restoreSnapshot click:', snapshotId)
  if (!confirm($t('snapshots.restoreConfirm'))) return
  
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
      alert($t('actions.snapshotRestoreFailed') + '：' + (e?.message || e))
    }
}

const deleteSnapshot = (snapshotId) => {
  if (confirm($t('snapshots.deleteConfirm'))) {
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
  background: var(--bg-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  border-radius: 0;
  overflow-y: auto;
  box-shadow: none;
  scrollbar-width: thin;
  scrollbar-color: var(--border-secondary) var(--bg-tertiary);
  backdrop-filter: none;
  transition: background-color 0.3s ease;
}

.app::-webkit-scrollbar {
  width: 8px;
}

.app::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.app::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 4px;
}

.app::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* 使用说明样式 */
.help {
  margin: 8px 12px;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
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
  color: var(--text-secondary);
  line-height: 1.5;
  list-style: disc;
}

.main {
  flex: 1;
  padding: 16px 12px 24px 12px;
  background: var(--bg-secondary);
}

.tab-groups {
  max-width: 1200px;
  margin: 0 auto;
}

.groups-header {
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  margin-bottom: 20px;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  /* flex-direction: column; */
  gap: 8px;
}

.strategy-selector {
  display: flex;
  align-items: center;
}

.strategy-select {
  padding: 6px 10px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  font-size: 12px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px var(--shadow-light);
  min-width: 120px;
}

.strategy-select:hover {
  border-color: var(--border-secondary);
  box-shadow: 0 2px 4px var(--shadow-medium);
}

.strategy-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--shadow-light);
}

.no-groups {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
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
  color: var(--text-inverse);
  background: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn::before {
  display: none;
}

.btn-primary {
  background: var(--accent-primary);
  color: var(--text-inverse);
}

.btn-outline {
  background: transparent;
  color: var(--text-muted);
  border-color: var(--text-muted);
}

.btn-small {
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}

.btn-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
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
  background: var(--bg-modal);
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
  border-bottom: 1px solid var(--border-primary);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-muted);
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
  background: var(--bg-tertiary);
  color: var(--text-primary);
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
  color: var(--text-secondary);
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-primary);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--shadow-light);
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
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
  background: var(--bg-primary);
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.icon-option:hover {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
}

.icon-option.selected {
  border-color: var(--accent-primary);
  background: var(--accent-primary);
  color: var(--text-inverse);
}

/* 颜色选择器样式 */
.color-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  align-items: center;
}

.color-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: white;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.color-option:hover {
  border-color: var(--accent-primary);
  transform: scale(1.05);
}

.color-option.selected {
  border-color: var(--accent-primary);
  border-width: 3px;
  transform: scale(1.1);
}

.color-check {
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.color-input {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-secondary);
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
  padding: 0;
}

.color-input:hover {
  border-color: var(--accent-primary);
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 2px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border-primary);
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
  
  .header-left {
    align-items: center;
    text-align: center;
  }
  
  .strategy-select {
    min-width: auto;
    width: 100%;
    max-width: 200px;
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
  
  .color-selector {
    grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
    gap: 6px;
  }
  
  .color-option {
    width: 36px;
    height: 36px;
  }
  
  .color-input {
    width: 36px;
    height: 36px;
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
