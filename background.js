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
    
    // 同时更新标签页状态
    const stateResult = await chrome.storage.local.get(['tabStates'])
    const tabStates = stateResult.tabStates || {}
    tabStates[tabId] = {
      ...tabStates[tabId],
      dormant: false,
      lastActive: Date.now()
    }
    await chrome.storage.local.set({ tabStates })
  } catch (error) {
    console.error('更新标签页活跃时间失败:', error)
  }
}

// 清理标签页数据
async function cleanupTabData(tabId) {
  try {
    // 从分组中移除
    const result = await chrome.storage.local.get(['tabGroups'])
    const raw = result.tabGroups
    let groups = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? Object.values(raw) : [])
    groups = groups.map(g => ({ ...g, tabs: Array.isArray(g?.tabs) ? g.tabs : [] }))
    groups.forEach(group => {
      group.tabs = group.tabs.filter(tab => tab.id !== tabId)
    })
    await chrome.storage.local.set({ tabGroups: groups })
    
    // 从暂存区移除
    const stagingResult = await chrome.storage.local.get(['stagingTabs'])
    const stagingTabs = Array.isArray(stagingResult.stagingTabs) ? stagingResult.stagingTabs : []
    const filteredStagingTabs = stagingTabs.filter(tab => tab.id !== tabId)
    
    await chrome.storage.local.set({ stagingTabs: filteredStagingTabs })
    
    // 清理活跃时间记录
    const activityResult = await chrome.storage.local.get(['tabActivity'])
    const tabActivity = activityResult.tabActivity || {}
    delete tabActivity[tabId]
    
    await chrome.storage.local.set({ tabActivity })
    
    // 清理标签页状态
    const stateResult = await chrome.storage.local.get(['tabStates'])
    const tabStates = stateResult.tabStates || {}
    delete tabStates[tabId]
    
    await chrome.storage.local.set({ tabStates })
  } catch (error) {
    console.error('清理标签页数据失败:', error)
  }
}

// 清理窗口数据
async function cleanupWindowData(windowId) {
  try {
    // 清理快照中的窗口数据
    const result = await chrome.storage.local.get(['snapshots'])
    const snapshots = Array.isArray(result.snapshots) ? result.snapshots : []
    
    snapshots.forEach(snapshot => {
      if (snapshot?.data?.windows) {
        const windows = Array.isArray(snapshot.data.windows) ? snapshot.data.windows : []
        snapshot.data.windows = windows.filter(window => window.id !== windowId)
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
        
        // 更新标签页状态
        const stateResult = await chrome.storage.local.get(['tabStates'])
        const tabStates = stateResult.tabStates || {}
        tabStates[tabId] = {
          ...tabStates[tabId],
          dormant: true,
          lastActive: tabStates[tabId]?.lastActive || Date.now()
        }
        await chrome.storage.local.set({ tabStates })
        
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
  console.log('[bg] onMessage action:', request?.action)
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
      console.log('[bg] createSnapshot name:', request?.name)
      createSnapshot(request.name).then(snapshot => {
        sendResponse({ success: true, snapshot })
      }).catch(error => {
        console.error('[bg] createSnapshot error:', error)
        sendResponse({ success: false, error: error.message })
      })
      return true
      
    case 'restoreSnapshot':
      console.log('[bg] restoreSnapshot id:', request?.snapshotId)
      restoreSnapshot(request.snapshotId, request.snapshot || null).then(() => {
        sendResponse({ success: true })
      }).catch(error => {
        console.error('[bg] restoreSnapshot error:', error)
        sendResponse({ success: false, error: error.message })
      })
      return true
      
    default:
      sendResponse({ success: false, error: '未知操作' })
  }
})

// 工具：判断URL是否可恢复
function isRestorableUrl(url) {
  return !!url && url !== 'about:blank' && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://')
}

// 工具：等待tab的URL被设置（避免立即discard导致about:blank）
function waitForTabUrl(tabId, expectedUrl, timeoutMs = 2000) {
  return new Promise((resolve) => {
    let done = false
    const cleanup = () => {
      if (!done) {
        chrome.tabs.onUpdated.removeListener(handler)
        done = true
      }
    }
    const handler = (id, changeInfo, tab) => {
      if (id === tabId && changeInfo && changeInfo.url) {
        resolve(changeInfo.url)
        cleanup()
      }
    }
    try {
      chrome.tabs.onUpdated.addListener(handler)
    } catch {}
    setTimeout(async () => {
      if (done) return
      try {
        const tab = await chrome.tabs.get(tabId)
        resolve(tab?.url || null)
      } catch {
        resolve(null)
      } finally {
        cleanup()
      }
    }, timeoutMs)
  })
}

// 创建快照
async function createSnapshot(name) {
  try {
    console.log('[bg] createSnapshot start, name:', name)
    let windows = await chrome.windows.getAll({ populate: true })
    console.log('[bg] windows length:', windows?.length)
    let windowsForSnapshot = []
    if (Array.isArray(windows) && windows.length > 0) {
      windowsForSnapshot = windows.map(window => ({
        id: window.id,
        state: window.state,
        top: window.top,
        left: window.left,
        width: window.width,
        height: window.height,
        tabs: (Array.isArray(window.tabs) ? window.tabs : []).map(tab => ({
          id: tab.id,
          url: tab.url,
          title: tab.title,
          active: tab.active,
          pinned: tab.pinned,
          index: tab.index
        }))
      }))
    } else {
      // 回退：用 tabs.query 构造窗口数据
      const tabs = await chrome.tabs.query({})
      console.log('[bg] fallback tabs length:', tabs?.length)
      const map = {}
      for (const tab of tabs) {
        const wid = tab.windowId
        if (!map[wid]) {
          map[wid] = {
            id: wid,
            state: 'normal',
            top: undefined,
            left: undefined,
            width: undefined,
            height: undefined,
            tabs: []
          }
        }
        map[wid].tabs.push({
          id: tab.id,
          url: tab.url,
          title: tab.title,
          active: tab.active,
          pinned: tab.pinned,
          index: tab.index
        })
      }
      windowsForSnapshot = Object.values(map)
    }
    
    const snapshot = {
      id: `snapshot_${Date.now()}`,
      name,
      createdAt: Date.now(),
      data: { windows: windowsForSnapshot }
    }
    
    const result = await chrome.storage.local.get(['snapshots'])
    const snapshots = Array.isArray(result.snapshots) ? result.snapshots : []
    snapshots.unshift(snapshot)
    
    // 限制快照数量
    if (snapshots.length > 20) {
      snapshots.splice(20)
    }
    
    await chrome.storage.local.set({ snapshots })
    console.log('[bg] snapshot saved, total:', snapshots.length)
    return snapshot
  } catch (error) {
    console.error('[bg] 创建快照失败:', error)
    throw error
  }
}

// 恢复快照
async function restoreSnapshot(snapshotId, snapshotFromPayload = null) {
  try {
    console.log('[bg] restoreSnapshot start, id:', snapshotId)
    let snapshot = snapshotFromPayload
    if (!snapshot) {
      const result = await chrome.storage.local.get(['snapshots'])
      const snapshots = Array.isArray(result.snapshots) ? result.snapshots : []
      snapshot = snapshots.find(s => s.id === snapshotId)
    }
    
    if (!snapshot) {
      console.warn('[bg] snapshot not found')
      throw new Error('快照不存在')
    }
    
    const windows = Array.isArray(snapshot?.data?.windows) ? snapshot.data.windows : []
    console.log('[bg] windows to restore:', windows.length)
    // 改为在“当前窗口”恢复，不新开窗口，避免重复窗口
    const currentWindow = await chrome.windows.getCurrent({ populate: true })
    const snapshotTabs = windows.flatMap(w => Array.isArray(w?.tabs) ? w.tabs : [])
      .filter(t => isRestorableUrl(t?.url))
    console.log('[bg] tabs to restore in current window:', snapshotTabs.length)
    if (snapshotTabs.length === 0) return
    // 第一个标签：新开标签并切换过去，不替换当前标签
    const first = snapshotTabs[0]
    const createdFirst = await chrome.tabs.create({ windowId: currentWindow.id, url: first.url, active: true, pinned: !!first.pinned })
    await waitForTabUrl(createdFirst.id, first.url, 1500)
    // 后续标签依次创建为非激活，并立即丢弃，避免立刻网络风暴
    for (let i = 1; i < snapshotTabs.length; i++) {
      const t = snapshotTabs[i]
      try {
        const created = await chrome.tabs.create({ windowId: currentWindow.id, url: t.url, active: false, pinned: !!t.pinned })
        await waitForTabUrl(created.id, t.url, 1500)
        try { await chrome.tabs.discard(created.id) } catch {}
      } catch (e) {
        console.warn('[bg] create tab failed:', t.url, e?.message || e)
      }
    }
    console.log('[bg] restoreSnapshot finished')
  } catch (error) {
    console.error('[bg] 恢复快照失败:', error)
    throw error
  }
}
