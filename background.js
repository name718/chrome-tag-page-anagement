// Background Service Worker for TabTamer

// 监听扩展安装
chrome.runtime.onInstalled.addListener((details) => {
  console.log('TabTamer 已安装:', details.reason)
  
  if (details.reason === 'install') {
    // 初始化存储
    chrome.storage.local.set({
      tabGroups: [],
      stagingTabs: [],
      snapshots: [],
      groupRules: [],
      settings: {
        autoGrouping: true,
        dormancyThreshold: 30, // 分钟
        maxTabsPerWindow: 200,
        enableStagingArea: true
      }
    })
  }
})

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 更新标签页最后活跃时间
    updateTabActivity(tabId)
  }
})

// 监听标签页激活
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateTabActivity(activeInfo.tabId)
})

// 监听标签页关闭
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // 清理相关数据
  cleanupTabData(tabId)
})

// 监听窗口关闭
chrome.windows.onRemoved.addListener((windowId) => {
  // 清理窗口相关数据
  cleanupWindowData(windowId)
})

// 更新标签页活跃时间
async function updateTabActivity(tabId) {
  try {
    const result = await chrome.storage.local.get(['tabActivity'])
    const tabActivity = result.tabActivity || {}
    
    tabActivity[tabId] = Date.now()
    
    await chrome.storage.local.set({ tabActivity })
  } catch (error) {
    console.error('更新标签页活跃时间失败:', error)
  }
}

// 清理标签页数据
async function cleanupTabData(tabId) {
  try {
    // 从分组中移除
    const result = await chrome.storage.local.get(['tabGroups'])
    const groups = result.tabGroups || []
    
    groups.forEach(group => {
      group.tabs = group.tabs.filter(tab => tab.id !== tabId)
    })
    
    await chrome.storage.local.set({ tabGroups: groups })
    
    // 从暂存区移除
    const stagingResult = await chrome.storage.local.get(['stagingTabs'])
    const stagingTabs = stagingResult.stagingTabs || []
    const filteredStagingTabs = stagingTabs.filter(tab => tab.id !== tabId)
    
    await chrome.storage.local.set({ stagingTabs: filteredStagingTabs })
    
    // 清理活跃时间记录
    const activityResult = await chrome.storage.local.get(['tabActivity'])
    const tabActivity = activityResult.tabActivity || {}
    delete tabActivity[tabId]
    
    await chrome.storage.local.set({ tabActivity })
  } catch (error) {
    console.error('清理标签页数据失败:', error)
  }
}

// 清理窗口数据
async function cleanupWindowData(windowId) {
  try {
    // 清理快照中的窗口数据
    const result = await chrome.storage.local.get(['snapshots'])
    const snapshots = result.snapshots || []
    
    snapshots.forEach(snapshot => {
      if (snapshot.data && snapshot.data.windows) {
        snapshot.data.windows = snapshot.data.windows.filter(window => window.id !== windowId)
      }
    })
    
    await chrome.storage.local.set({ snapshots })
  } catch (error) {
    console.error('清理窗口数据失败:', error)
  }
}

// 定期清理过期数据
setInterval(async () => {
  try {
    const result = await chrome.storage.local.get(['tabActivity', 'settings'])
    const tabActivity = result.tabActivity || {}
    const settings = result.settings || {}
    const dormancyThreshold = (settings.dormancyThreshold || 30) * 60 * 1000 // 转换为毫秒
    
    const now = Date.now()
    const expiredTabs = []
    
    // 找出过期的标签页
    Object.entries(tabActivity).forEach(([tabId, lastActive]) => {
      if (now - lastActive > dormancyThreshold) {
        expiredTabs.push(parseInt(tabId))
      }
    })
    
    // 休眠过期标签页
    for (const tabId of expiredTabs) {
      try {
        await chrome.tabs.discard(tabId)
        console.log(`标签页 ${tabId} 已休眠`)
      } catch (error) {
        console.log(`标签页 ${tabId} 休眠失败:`, error)
      }
    }
  } catch (error) {
    console.error('定期清理失败:', error)
  }
}, 5 * 60 * 1000) // 每5分钟执行一次

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getTabGroups':
      chrome.storage.local.get(['tabGroups'], (result) => {
        sendResponse({ groups: result.tabGroups || [] })
      })
      return true // 保持消息通道开放
      
    case 'saveTabGroups':
      chrome.storage.local.set({ tabGroups: request.groups }, () => {
        sendResponse({ success: true })
      })
      return true
      
    case 'getSnapshots':
      chrome.storage.local.get(['snapshots'], (result) => {
        sendResponse({ snapshots: result.snapshots || [] })
      })
      return true
      
    case 'saveSnapshots':
      chrome.storage.local.set({ snapshots: request.snapshots }, () => {
        sendResponse({ success: true })
      })
      return true
      
    case 'getSettings':
      chrome.storage.local.get(['settings'], (result) => {
        sendResponse({ settings: result.settings || {} })
      })
      return true
      
    case 'saveSettings':
      chrome.storage.local.set({ settings: request.settings }, () => {
        sendResponse({ success: true })
      })
      return true
      
    case 'createSnapshot':
      createSnapshot(request.name).then(snapshot => {
        sendResponse({ success: true, snapshot })
      }).catch(error => {
        sendResponse({ success: false, error: error.message })
      })
      return true
      
    case 'restoreSnapshot':
      restoreSnapshot(request.snapshotId).then(() => {
        sendResponse({ success: true })
      }).catch(error => {
        sendResponse({ success: false, error: error.message })
      })
      return true
      
    default:
      sendResponse({ success: false, error: '未知操作' })
  }
})

// 创建快照
async function createSnapshot(name) {
  try {
    const windows = await chrome.windows.getAll({ populate: true })
    
    const snapshot = {
      id: `snapshot_${Date.now()}`,
      name,
      createdAt: Date.now(),
      data: {
        windows: windows.map(window => ({
          id: window.id,
          state: window.state,
          bounds: window.bounds,
          tabs: window.tabs.map(tab => ({
            id: tab.id,
            url: tab.url,
            title: tab.title,
            active: tab.active,
            pinned: tab.pinned,
            index: tab.index
          }))
        }))
      }
    }
    
    const result = await chrome.storage.local.get(['snapshots'])
    const snapshots = result.snapshots || []
    snapshots.unshift(snapshot)
    
    // 限制快照数量
    if (snapshots.length > 20) {
      snapshots.splice(20)
    }
    
    await chrome.storage.local.set({ snapshots })
    return snapshot
  } catch (error) {
    console.error('创建快照失败:', error)
    throw error
  }
}

// 恢复快照
async function restoreSnapshot(snapshotId) {
  try {
    const result = await chrome.storage.local.get(['snapshots'])
    const snapshots = result.snapshots || []
    const snapshot = snapshots.find(s => s.id === snapshotId)
    
    if (!snapshot) {
      throw new Error('快照不存在')
    }
    
    // 关闭所有现有窗口
    const existingWindows = await chrome.windows.getAll()
    for (const window of existingWindows) {
      await chrome.windows.remove(window.id)
    }
    
    // 恢复快照中的窗口和标签页
    for (const windowData of snapshot.data.windows) {
      const newWindow = await chrome.windows.create({
        state: windowData.state,
        bounds: windowData.bounds
      })
      
      for (let i = 0; i < windowData.tabs.length; i++) {
        const tabData = windowData.tabs[i]
        
        if (i === 0) {
          await chrome.tabs.update(newWindow.tabs[0].id, {
            url: tabData.url,
            active: tabData.active,
            pinned: tabData.pinned
          })
        } else {
          await chrome.tabs.create({
            windowId: newWindow.id,
            url: tabData.url,
            active: tabData.active,
            pinned: tabData.pinned,
            index: tabData.index
          })
        }
      }
    }
  } catch (error) {
    console.error('恢复快照失败:', error)
    throw error
  }
}
