import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTabStore = defineStore('tabs', () => {
  // 状态
  const groups = ref([])
  const stagingTabs = ref([])
  const allTabs = ref([])
  const groupRules = ref([])

  // 计算属性
  const totalTabs = computed(() => {
    const list = Array.isArray(groups.value) ? groups.value : []
    return list.reduce((total, group) => total + (Array.isArray(group?.tabs) ? group.tabs.length : 0), 0)
  })

  const dormantTabs = computed(() => {
    return allTabs.value.filter(tab => tab.dormant).length
  })

  const activeTabs = computed(() => {
    return totalTabs.value - dormantTabs.value
  })

  const memorySaved = computed(() => {
    const total = allTabs.value.length
    const dormant = dormantTabs.value
    return total > 0 ? Math.round((dormant / total) * 100) : 0
  })

  // 模拟内存使用数据
  const estimatedMemoryUsage = computed(() => {
    // 每个活跃标签页约占用 50-200MB，休眠标签页约占用 5-10MB
    const activeMemory = activeTabs.value * 150 // 平均150MB
    const dormantMemory = dormantTabs.value * 8 // 平均8MB
    return Math.round(activeMemory + dormantMemory)
  })

  const estimatedMemorySaved = computed(() => {
    // 如果所有标签页都活跃，会占用多少内存
    const totalMemoryIfActive = totalTabs.value * 150
    const currentMemory = estimatedMemoryUsage.value
    return Math.round(totalMemoryIfActive - currentMemory)
  })

  const memoryEfficiency = computed(() => {
    const total = totalTabs.value
    const dormant = dormantTabs.value
    if (total === 0) return 0
    // 计算内存效率：休眠标签页占比越高，效率越高
    return Math.round((dormant / total) * 100)
  })

  const groupCount = computed(() => {
    return groups.value.length
  })

  const stagingCount = computed(() => {
    return stagingTabs.value.length
  })

  // 方法
  const initialize = async () => {
    await loadTabs()
    await loadGroups()
    await loadStagingTabs()
    await loadGroupRules()
    await autoGroupTabs()
    await syncTabStates() // 同步标签页状态
    startDormancyMonitor()
  }

  const loadTabs = async () => {
    try {
      const tabs = await chrome.tabs.query({})
      
      // 加载保存的标签页状态
      const result = await chrome.storage.local.get(['tabStates'])
      const savedStates = result.tabStates || {}
      
      allTabs.value = tabs.map(tab => {
        const savedState = savedStates[tab.id] || {}
        
        // 检查标签页是否已经被Chrome休眠
        const isActuallyDormant = tab.discarded || false
        
        return {
          ...tab,
          dormant: savedState.dormant || isActuallyDormant,
          lastActive: savedState.lastActive || Date.now()
        }
      })
    } catch (error) {
      console.error('加载标签页失败:', error)
    }
  }

  const loadGroups = async () => {
    try {
      const result = await chrome.storage.local.get(['tabGroups'])
      const raw = result.tabGroups
      if (Array.isArray(raw)) {
        groups.value = raw
      } else if (raw && typeof raw === 'object') {
        groups.value = Object.values(raw)
      } else {
        groups.value = []
      }
      // 兜底 tabs 字段
      groups.value = groups.value.map(g => ({
        ...g,
        tabs: Array.isArray(g?.tabs) ? g.tabs : []
      }))
    } catch (error) {
      console.error('加载分组失败:', error)
    }
  }

  const loadStagingTabs = async () => {
    try {
      const result = await chrome.storage.local.get(['stagingTabs'])
      stagingTabs.value = result.stagingTabs || []
    } catch (error) {
      console.error('加载暂存区失败:', error)
    }
  }

  const loadGroupRules = async () => {
    try {
      const result = await chrome.storage.local.get(['groupRules'])
      groupRules.value = result.groupRules || []
    } catch (error) {
      console.error('加载分组规则失败:', error)
    }
  }

  const saveGroups = async () => {
    try {
      await chrome.storage.local.set({ tabGroups: groups.value })
    } catch (error) {
      console.error('保存分组失败:', error)
    }
  }

  const saveStagingTabs = async () => {
    try {
      await chrome.storage.local.set({ stagingTabs: stagingTabs.value })
    } catch (error) {
      console.error('保存暂存区失败:', error)
    }
  }

  const saveTabStates = async () => {
    try {
      const tabStates = {}
      allTabs.value.forEach(tab => {
        tabStates[tab.id] = {
          dormant: tab.dormant,
          lastActive: tab.lastActive
        }
      })
      await chrome.storage.local.set({ tabStates })
    } catch (error) {
      console.error('保存标签页状态失败:', error)
    }
  }

  const autoGroupTabs = async () => {
    // 智能分组逻辑
    const domainGroups = {}
    const keywordGroups = {}
    const timeGroups = {}

    allTabs.value.forEach(tab => {
      if (!tab.url) return

      // 域名分组
      const domain = new URL(tab.url).hostname
      if (!domainGroups[domain]) {
        domainGroups[domain] = {
          id: `domain_${domain}`,
          name: getDomainDisplayName(domain),
          icon: getDomainIcon(domain),
          tabs: [],
          collapsed: false,
          type: 'domain'
        }
      }
      domainGroups[domain].tabs.push(tab)

      // 关键词分组
      const keywords = extractKeywords(tab.title)
      keywords.forEach(keyword => {
        if (!keywordGroups[keyword]) {
          keywordGroups[keyword] = {
            id: `keyword_${keyword}`,
            name: keyword,
            icon: getKeywordIcon(keyword),
            tabs: [],
            collapsed: false,
            type: 'keyword'
          }
        }
        keywordGroups[keyword].tabs.push(tab)
      })

      // 时间分组（15分钟内）
      const now = Date.now()
      const timeKey = Math.floor(now / (15 * 60 * 1000)) // 15分钟窗口
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = {
          id: `time_${timeKey}`,
          name: '临时任务',
          icon: '⏰',
          tabs: [],
          collapsed: false,
          type: 'time'
        }
      }
      timeGroups[timeKey].tabs.push(tab)
    })

    // 合并分组
    const newGroups = []
    
    // 添加域名分组（至少2个标签）
    Object.values(domainGroups).forEach(group => {
      if (group.tabs.length >= 2) {
        newGroups.push(group)
      }
    })

    // 添加关键词分组（至少3个标签）
    Object.values(keywordGroups).forEach(group => {
      if (group.tabs.length >= 3) {
        newGroups.push(group)
      }
    })

    // 添加时间分组（至少2个标签）
    Object.values(timeGroups).forEach(group => {
      if (group.tabs.length >= 2) {
        newGroups.push(group)
      }
    })

    groups.value = newGroups
    await saveGroups()
  }

  const getDomainDisplayName = (domain) => {
    const domainMap = {
      'github.com': 'GitHub',
      'stackoverflow.com': 'Stack Overflow',
      'figma.com': 'Figma',
      'notion.so': 'Notion',
      'google.com': 'Google',
      'youtube.com': 'YouTube'
    }
    return domainMap[domain] || domain
  }

  const getDomainIcon = (domain) => {
    const iconMap = {
      'github.com': '🐙',
      'stackoverflow.com': '📚',
      'figma.com': '🎨',
      'notion.so': '📝',
      'google.com': '🔍',
      'youtube.com': '📺'
    }
    return iconMap[domain] || '🌐'
  }

  const getKeywordIcon = (keyword) => {
    const iconMap = {
      '预算': '💰',
      '报价': '💰',
      '设计': '🎨',
      '开发': '💻',
      '文档': '📄',
      '会议': '📅'
    }
    return iconMap[keyword] || '🏷️'
  }

  const extractKeywords = (title) => {
    const keywords = ['预算', '报价', '设计', '开发', '文档', '会议']
    return keywords.filter(keyword => title.includes(keyword))
  }

  const toggleGroupCollapse = (groupId) => {
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
      group.collapsed = !group.collapsed
      saveGroups()
    }
  }

  const deleteGroup = (groupId) => {
    groups.value = groups.value.filter(g => g.id !== groupId)
    saveGroups()
  }

  const activateTab = async (tabId) => {
    try {
      await chrome.tabs.update(tabId, { active: true })
      // 更新最后活跃时间
      const tab = allTabs.value.find(t => t.id === tabId)
      if (tab) {
        tab.lastActive = Date.now()
        tab.dormant = false
        await saveTabStates()
      }
    } catch (error) {
      console.error('激活标签页失败:', error)
    }
  }

  const toggleTabDormant = async (tabId) => {
    try {
      const tab = allTabs.value.find(t => t.id === tabId)
      if (!tab) return

      if (tab.dormant) {
        // 唤醒标签页
        await chrome.tabs.reload(tabId)
        tab.dormant = false
        tab.lastActive = Date.now()
      } else {
        // 休眠标签页前先检查标签页状态
        try {
          const tabInfo = await chrome.tabs.get(tabId)
          
          // 检查标签页是否可以休眠
          if (tabInfo.discarded) {
            console.log(`标签页 ${tabId} 已经是休眠状态`)
            return
          }
          
          // 检查是否是特殊页面（如chrome://页面）
          if (tabInfo.url && (tabInfo.url.startsWith('chrome://') || tabInfo.url.startsWith('chrome-extension://'))) {
            console.log(`标签页 ${tabId} 是特殊页面，无法休眠`)
            return
          }
          
          // 尝试休眠标签页
          await chrome.tabs.discard(tabId)
          tab.dormant = true
          console.log(`标签页 ${tabId} 休眠成功`)
        } catch (discardError) {
          console.warn(`无法休眠标签页 ${tabId}:`, discardError.message)
          // 休眠失败时，不更新状态，保持原状态
          return
        }
      }
      
      // 保存状态变化
      await saveTabStates()
    } catch (error) {
      console.error('切换标签页休眠状态失败:', error)
    }
  }

  const moveToStaging = (tabId) => {
    const tab = allTabs.value.find(t => t.id === tabId)
    if (tab) {
      stagingTabs.value.push(tab)
      // 从分组中移除
      groups.value.forEach(group => {
        group.tabs = group.tabs.filter(t => t.id !== tabId)
      })
      saveGroups()
      saveStagingTabs()
    }
  }

  const restoreFromStaging = async (tabId) => {
    const tabIndex = stagingTabs.value.findIndex(t => t.id === tabId)
    if (tabIndex !== -1) {
      const tab = stagingTabs.value[tabIndex]
      stagingTabs.value.splice(tabIndex, 1)
      
      // 重新分组
      await autoGroupTabs()
      saveStagingTabs()
    }
  }

  const clearStaging = () => {
    stagingTabs.value = []
    saveStagingTabs()
  }

  const moveTabToGroup = (tabId, groupId) => {
    const tab = allTabs.value.find(t => t.id === tabId)
    if (!tab) return

    // 从所有分组中移除
    groups.value.forEach(group => {
      group.tabs = group.tabs.filter(t => t.id !== tabId)
    })

    // 添加到目标分组
    const targetGroup = groups.value.find(g => g.id === groupId)
    if (targetGroup) {
      targetGroup.tabs.push(tab)
      saveGroups()
    }
  }

  const startDormancyMonitor = () => {
    // 每5分钟检查一次休眠
    setInterval(async () => {
      const now = Date.now()
      const thirtyMinutes = 30 * 60 * 1000

      for (const tab of allTabs.value) {
        if (!tab.dormant && (now - tab.lastActive) > thirtyMinutes) {
          try {
            await toggleTabDormant(tab.id)
          } catch (error) {
            console.warn(`自动休眠标签页 ${tab.id} 失败:`, error.message)
          }
        }
      }
    }, 5 * 60 * 1000)
  }

  const cleanupTabState = async (tabId) => {
    try {
      const result = await chrome.storage.local.get(['tabStates'])
      const savedStates = result.tabStates || {}
      delete savedStates[tabId]
      await chrome.storage.local.set({ tabStates: savedStates })
    } catch (error) {
      console.error('清理标签页状态失败:', error)
    }
  }

  const syncTabStates = async () => {
    try {
      const tabs = await chrome.tabs.query({})
      const result = await chrome.storage.local.get(['tabStates'])
      const savedStates = result.tabStates || {}
      
      // 更新标签页状态以匹配实际状态
      allTabs.value.forEach(tab => {
        const actualTab = tabs.find(t => t.id === tab.id)
        if (actualTab) {
          tab.discarded = actualTab.discarded
          tab.dormant = actualTab.discarded || savedStates[tab.id]?.dormant || false
        }
      })
      
      // 保存同步后的状态
      await saveTabStates()
    } catch (error) {
      console.error('同步标签页状态失败:', error)
    }
  }

  return {
    // 状态
    groups,
    stagingTabs,
    allTabs,
    groupRules,
    
    // 计算属性
    totalTabs,
    dormantTabs,
    activeTabs,
    memorySaved,
    estimatedMemoryUsage,
    estimatedMemorySaved,
    memoryEfficiency,
    groupCount,
    stagingCount,
    
    // 方法
    initialize,
    toggleGroupCollapse,
    deleteGroup,
    activateTab,
    toggleTabDormant,
    moveToStaging,
    restoreFromStaging,
    clearStaging,
    moveTabToGroup,
    cleanupTabState,
    syncTabStates
  }
})
