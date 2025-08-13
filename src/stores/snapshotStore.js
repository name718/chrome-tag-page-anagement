import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSnapshotStore = defineStore('snapshots', () => {
  // 状态
  const snapshots = ref([])

  // 方法
  const initialize = async () => {
    await loadSnapshots()
  }

  const loadSnapshots = async () => {
    try {
      const result = await chrome.storage.local.get(['snapshots'])
      snapshots.value = result.snapshots || []
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
      // 获取当前所有窗口和标签页信息
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

      snapshots.value.unshift(snapshot)
      
      // 限制快照数量，保留最近20个
      if (snapshots.value.length > 20) {
        snapshots.value = snapshots.value.slice(0, 20)
      }

      await saveSnapshots()
      return snapshot
    } catch (error) {
      console.error('创建快照失败:', error)
      throw error
    }
  }

  const restoreSnapshot = async (snapshotId) => {
    try {
      const snapshot = snapshots.value.find(s => s.id === snapshotId)
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
        // 创建新窗口
        const newWindow = await chrome.windows.create({
          state: windowData.state,
          bounds: windowData.bounds
        })

        // 创建标签页
        for (let i = 0; i < windowData.tabs.length; i++) {
          const tabData = windowData.tabs[i]
          
          if (i === 0) {
            // 第一个标签页更新现有标签页
            await chrome.tabs.update(newWindow.tabs[0].id, {
              url: tabData.url,
              active: tabData.active,
              pinned: tabData.pinned
            })
          } else {
            // 创建新标签页
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

    const totalTabs = snapshot.data.windows.reduce((total, window) => total + window.tabs.length, 0)
    const totalWindows = snapshot.data.windows.length
    const pinnedTabs = snapshot.data.windows.reduce((total, window) => 
      total + window.tabs.filter(tab => tab.pinned).length, 0
    )

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
