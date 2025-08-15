/*
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
*/

// 支持的语言
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  zh_CN: '中文'
}

// 默认语言
export const DEFAULT_LANGUAGE = 'zh_CN'

// 获取当前语言
export function getCurrentLanguage() {
  return localStorage.getItem('language') || DEFAULT_LANGUAGE
}

// 设置语言
export function setLanguage(language) {
  if (SUPPORTED_LANGUAGES[language]) {
    localStorage.setItem('language', language)
    // 触发语言变化事件
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }))
    return true
  }
  return false
}

// 获取消息文本
export function getMessage(key, language = null) {
  const currentLang = language || getCurrentLanguage()
  
  try {
    // 这里应该从 Chrome 扩展的 i18n API 获取消息
    // 为了简化，我们直接返回 key，实际使用时需要替换
    if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
      const chromeMessage = chrome.i18n.getMessage(key)
      if (chromeMessage) {
        return chromeMessage
      }
    }
    
    // 回退到本地消息
    return getLocalMessage(key, currentLang) || key
  } catch (error) {
    console.warn('Failed to get message:', key, error)
    // 出错时也回退到本地消息
    return getLocalMessage(key, currentLang) || key
  }
}

// 获取本地消息（回退方案）
function getLocalMessage(key, language) {
  console.log(`🔍 getLocalMessage called: key=${key}, language=${language}`)
  
  const messages = {
    zh_CN: {
      // App
      'app.name': 'TabTamer',
      'app.subtitle': '智能标签页管理',
      
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
      'stats.overviewSubtitle': '内存使用和标签页统计',
      'stats.memoryEfficiency': '内存效率',
      'stats.used': '已使用',
      'stats.saved': '已节省',
      'stats.tabs': '标签页',
      'stats.active': '活跃',
      'stats.dormant': '休眠',
      'stats.groups': '分组',
      'stats.staging': '暂存',
      
      // Main
      'main.tabGroups': '标签页分组',
      'main.newGroup': '新建分组',
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
      'staging.subtitle': '临时存储的标签页',
      'staging.clearTooltip': '清空暂存区',
      'staging.clear': '清空',
      'staging.restore': '恢复',
      
      // Snapshots
      'snapshots.title': '工作区快照',
      'snapshots.subtitle': '保存和恢复工作状态',
      'snapshots.deleteTooltip': '删除快照',
      'snapshots.deleteConfirm': '确定要删除这个快照吗？',
      'snapshots.restoreConfirm': '确定要恢复这个工作区快照吗？',
      
      // Help
      'help.title': '使用说明',
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
      'modal.groupType': '分组类型',
      'modal.enterGroupName': '输入分组名称',
      'modal.manual': '手动分组',
      'modal.domain': '域名分组',
      'modal.keyword': '关键词分组',
      'modal.time': '时间分组',
      'modal.cancel': '取消',
      'modal.save': '保存',
      
      // Actions
      'actions.edit': '编辑',
      'actions.delete': '删除',
      'actions.deleteGroupConfirm': '确定要删除分组"{name}"吗？',
      'actions.deleteGroupWarning': '⚠️ 警告：该分组包含 {count} 个标签页',
      'actions.deleteGroupIrreversible': '删除分组将同时关闭所有标签页，此操作不可撤销！',
      'actions.continue': '继续',
      'actions.enterSnapshotName': '请输入快照名称:',
      'actions.saveFailed': '保存分组失败',
      'actions.deleteFailed': '删除分组失败',
      'actions.snapshotFailed': '创建快照失败',
      'actions.snapshotRestored': '快照恢复成功',
      'actions.snapshotRestoreFailed': '恢复快照失败',
      
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
      
      // Theme
      'theme.light': '明亮模式',
      'theme.dark': '黑暗模式',
      'theme.switchToLight': '切换到明亮模式',
      'theme.switchToDark': '切换到黑暗模式',
      
      // Language
      'language.en': 'English',
      'language.zh': '中文',
      'language.switchToEnglish': '切换到英文',
      'language.switchToChinese': '切换到中文'
    },
    en: {
      // App
      'app.name': 'TabTamer',
      'app.subtitle': 'Smart Tab Management',
      
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
      'stats.overviewSubtitle': 'Memory usage and tab statistics',
      'stats.memoryEfficiency': 'Memory Efficiency',
      'stats.used': 'Used',
      'stats.saved': 'Saved',
      'stats.tabs': 'Tabs',
      'stats.active': 'Active',
      'stats.dormant': 'Dormant',
      'stats.groups': 'Groups',
      'stats.staging': 'Staging',
      
      // Main
      'main.tabGroups': 'Tab Groups',
      'main.newGroup': 'New Group',
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
      'staging.clearTooltip': 'Clear Staging Area',
      'staging.clear': 'Clear',
      'staging.restore': 'Restore',
      
      // Snapshots
      'snapshots.title': 'Workspace Snapshots',
      'snapshots.subtitle': 'Save and restore workspace state',
      'snapshots.deleteTooltip': 'Delete Snapshot',
      'snapshots.deleteConfirm': 'Are you sure you want to delete this snapshot?',
      'snapshots.restoreConfirm': 'Are you sure you want to restore this workspace snapshot?',
      
      // Help
      'help.title': 'Usage Guide',
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
      'modal.groupType': 'Group Type',
      'modal.enterGroupName': 'Enter group name',
      'modal.manual': 'Manual',
      'modal.domain': 'Domain',
      'modal.keyword': 'Keyword',
      'modal.time': 'Time',
      'modal.cancel': 'Cancel',
      'modal.save': 'Save',
      
      // Actions
      'actions.edit': 'Edit',
      'actions.delete': 'Delete',
      'actions.deleteGroupConfirm': 'Are you sure you want to delete group "{name}"?',
      'actions.deleteGroupWarning': '⚠️ Warning: This group contains {count} tabs',
      'actions.deleteGroupIrreversible': 'Deleting the group will close all tabs. This action cannot be undone!',
      'actions.continue': 'Continue',
      'actions.enterSnapshotName': 'Please enter snapshot name:',
      'actions.saveFailed': 'Failed to save group',
      'actions.deleteFailed': 'Failed to delete group',
      'actions.snapshotFailed': 'Failed to create snapshot',
      'actions.snapshotRestored': 'Snapshot restored successfully',
      'actions.snapshotRestoreFailed': 'Failed to restore snapshot',
      
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
      
      // Theme
      'theme.light': 'Light Mode',
      'theme.dark': 'Dark Mode',
      'theme.switchToLight': 'Switch to Light Mode',
      'theme.switchToDark': 'Switch to Dark Mode',
      
      // Language
      'language.en': 'English',
      'language.zh': '中文',
      'language.switchToEnglish': 'Switch to English',
      'language.switchToChinese': 'Switch to Chinese'
    }
  }
  
  const result = messages[language]?.[key]
  console.log(`🔍 getLocalMessage result: ${result}`)
  return result
}

// 格式化消息（支持参数替换）
export function formatMessage(key, params = {}, language = null) {
  console.log(`🔍 formatMessage called: key=${key}, params=`, params, `language=${language}`)
  
  let message = getMessage(key, language)
  console.log(`🔍 formatMessage message: ${message}`)
  
  // 替换参数
  Object.keys(params).forEach(param => {
    message = message.replace(new RegExp(`{${param}}`, 'g'), params[param])
  })
  
  console.log(`🔍 formatMessage final result: ${message}`)
  return message
}

// 检测浏览器语言
export function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage
  if (browserLang.startsWith('zh')) {
    return 'zh_CN'
  }
  return 'en'
}

// 初始化语言设置
export function initializeLanguage() {
  const savedLang = localStorage.getItem('language')
  if (!savedLang) {
    const detectedLang = detectBrowserLanguage()
    setLanguage(detectedLang)
  }
}
