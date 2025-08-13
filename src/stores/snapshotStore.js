import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSnapshotStore = defineStore('snapshots', () => {
  // 状态
  const snapshots = ref([])

  // 方法
  const initialize = async () => {
    console.log('[snapshotStore] initialize')
    await loadSnapshots()
    console.log('[snapshotStore] loaded snapshots count:', snapshots.value?.length)
  }

  const loadSnapshots = async () => {
    try {
      console.log('[snapshotStore] loadSnapshots get from storage')
      const result = await chrome.storage.local.get(['snapshots'])
      console.log('[snapshotStore] storage.snapshots type:', typeof result.snapshots)
      const raw = result.snapshots
      if (Array.isArray(raw)) {
        snapshots.value = raw
      } else if (raw && typeof raw === 'object') {
        snapshots.value = Object.values(raw)
      } else {
        snapshots.value = []
      }
      console.log('[snapshotStore] snapshots in store:', snapshots.value?.length)
    } catch (error) {
      console.error('加载快照失败:', error)
    }
  }

  const saveSnapshots = async () => {
    try {
      await chrome.storage.local.set({ snapshots: snapshots.value })
    } catch (error) {
      console.error('保存快照失败:', error)
    }
  }

  const createSnapshot = async (name) => {
    try {
      console.log('[snapshotStore] createSnapshot name:', name)
      // 获取当前所有窗口和标签页信息
      const windows = await chrome.windows.getAll({ populate: true })
      console.log('[snapshotStore] getAll windows:', windows?.length)
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
        // 回退：用 tabs.query 构造窗口数据（incognito 视图隔离时常用）
        const tabs = await chrome.tabs.query({})
        console.log('[snapshotStore] fallback tabs:', tabs?.length)
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
        data: {
          windows: windowsForSnapshot
        }
      }

      snapshots.value.unshift(snapshot)
      console.log('[snapshotStore] snapshot pushed, total:', snapshots.value.length)
      
      // 限制快照数量，保留最近20个
      if (snapshots.value.length > 20) {
        snapshots.value = snapshots.value.slice(0, 20)
      }

      await saveSnapshots()
      console.log('[snapshotStore] snapshot saved')
      return snapshot
    } catch (error) {
      console.error('创建快照失败:', error)
      throw error
    }
  }

  const restoreSnapshot = async (snapshotId) => {
    try {
      console.log('[snapshotStore] restoreSnapshot id:', snapshotId)
      const snapshot = snapshots.value.find(s => s.id === snapshotId)
      console.log('[snapshotStore] found snapshot:', !!snapshot)
      if (!snapshot) {
        throw new Error('快照不存在')
      }

      const windows = Array.isArray(snapshot?.data?.windows) ? snapshot.data.windows : []
      console.log('[snapshotStore] windows to restore:', windows.length)

      // 增量恢复：不关闭现有窗口，新增窗口并填充标签页

      // 恢复快照中的窗口和标签页
      let isFirstWindow = true
      for (const windowData of windows) {
        // 创建新窗口（尽可能恢复位置与尺寸）
        console.log('[snapshotStore] create window with state:', windowData.state)
        const newWindow = await chrome.windows.create({
          focused: isFirstWindow,
          state: windowData.state === 'minimized' ? 'normal' : windowData.state,
          top: typeof windowData.top === 'number' ? windowData.top : undefined,
          left: typeof windowData.left === 'number' ? windowData.left : undefined,
          width: typeof windowData.width === 'number' ? windowData.width : undefined,
          height: typeof windowData.height === 'number' ? windowData.height : undefined
        })
        console.log('[snapshotStore] newWindow id:', newWindow?.id)

        // 创建标签页
        const tabs = Array.isArray(windowData?.tabs) ? windowData.tabs : []
        const hasActive = tabs.some(t => t && t.active)
        for (let i = 0; i < tabs.length; i++) {
          const tabData = tabs[i]
          
          if (i === 0) {
            // 第一个标签页更新现有标签页
            console.log('[snapshotStore] update first tab, active:', hasActive ? !!tabData.active : true)
            await chrome.tabs.update(newWindow.tabs[0].id, {
              url: tabData.url,
              active: hasActive ? !!tabData.active : true,
              pinned: tabData.pinned
            })
          } else {
            // 创建新标签页
            console.log('[snapshotStore] create tab idx:', i, 'active:', !!tabData.active)
            await chrome.tabs.create({
              windowId: newWindow.id,
              url: tabData.url,
              active: !!tabData.active,
              pinned: tabData.pinned,
              index: tabData.index
            })
          }
        }
        if (isFirstWindow) {
          try { await chrome.windows.update(newWindow.id, { focused: true }) } catch {}
          isFirstWindow = false
        }
      }

      return true
    } catch (error) {
      console.error('恢复快照失败:', error)
      throw error
    }
  }

  const deleteSnapshot = async (snapshotId) => {
    try {
      snapshots.value = snapshots.value.filter(s => s.id !== snapshotId)
      await saveSnapshots()
    } catch (error) {
      console.error('删除快照失败:', error)
      throw error
    }
  }

  const exportSnapshot = async (snapshotId) => {
    try {
      const snapshot = snapshots.value.find(s => s.id === snapshotId)
      if (!snapshot) {
        throw new Error('快照不存在')
      }

      const dataStr = JSON.stringify(snapshot, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tabtamer-snapshot-${snapshot.name}-${new Date(snapshot.createdAt).toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出快照失败:', error)
      throw error
    }
  }

  const importSnapshot = async (file) => {
    try {
      const text = await file.text()
      const snapshot = JSON.parse(text)
      
      // 验证快照格式
      if (!snapshot.id || !snapshot.name || !snapshot.data || !snapshot.data.windows) {
        throw new Error('无效的快照格式')
      }

      // 生成新的ID和时间戳
      snapshot.id = `snapshot_${Date.now()}`
      snapshot.createdAt = Date.now()

      snapshots.value.unshift(snapshot)
      
      // 限制快照数量
      if (snapshots.value.length > 20) {
        snapshots.value = snapshots.value.slice(0, 20)
      }

      await saveSnapshots()
      return snapshot
    } catch (error) {
      console.error('导入快照失败:', error)
      throw error
    }
  }

  const getSnapshotStats = (snapshotId) => {
    const snapshot = snapshots.value.find(s => s.id === snapshotId)
    if (!snapshot) return null

    const windows = Array.isArray(snapshot?.data?.windows) ? snapshot.data.windows : []
    const totalTabs = windows.reduce((total, window) => total + (Array.isArray(window?.tabs) ? window.tabs.length : 0), 0)
    const totalWindows = windows.length
    const pinnedTabs = windows.reduce((total, window) => {
      const tabs = Array.isArray(window?.tabs) ? window.tabs : []
      return total + tabs.filter(tab => tab?.pinned).length
    }, 0)

    return {
      totalTabs,
      totalWindows,
      pinnedTabs,
      createdAt: snapshot.createdAt
    }
  }

  return {
    // 状态
    snapshots,
    
    // 方法
    initialize,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    exportSnapshot,
    importSnapshot,
    getSnapshotStats
  }
})
