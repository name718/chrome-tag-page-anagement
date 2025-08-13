import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTabStore = defineStore('tabs', () => {
  // 状态
  const groups = ref([])
  const stagingTabs = ref([])
  const allTabs = ref([])
  const groupStrategy = ref('domain') // 默认按域名分组

  // 分组策略选项
  const groupStrategies = [
    { value: 'domain', label: '按域名', icon: '🌐' },
    { value: 'keyword', label: '按关键词', icon: '🏷️' },
    { value: 'time', label: '按时间', icon: '⏰' },
    { value: 'manual', label: '手动分组', icon: '✋' }
  ]

  // 计算属性
  const totalTabs = computed(() => {
    // 以系统实际打开的标签(allTabs)为准，避免分组重复统计同一标签
    const list = Array.isArray(allTabs.value) ? allTabs.value : []
    // allTabs 来源于 chrome.tabs.query，ID 已唯一；但这里仍做一次去重以防外部注入
    const unique = new Set()
    list.forEach(tab => { if (tab && typeof tab.id !== 'undefined') unique.add(tab.id) })
    return unique.size
  })

  const dormantTabs = computed(() => {
    return allTabs.value.filter(tab => tab.discarded).length
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
    await loadGroupStrategy()
    await autoGroupTabs()
    await syncTabStates() // 同步标签页状态
    startDormancyMonitor()
  }

  const loadTabs = async () => {
    try {
      console.log('Loading tabs...')
      const tabs = await chrome.tabs.query({})
      console.log('Chrome tabs query result:', tabs.length, 'tabs')
      
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
      
      console.log('Processed tabs:', allTabs.value.length)
      console.log('Sample tab:', allTabs.value[0])
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

  const loadGroupStrategy = async () => {
    try {
      const result = await chrome.storage.local.get(['groupStrategy'])
      groupStrategy.value = result.groupStrategy || 'domain'
    } catch (error) {
      console.error('加载分组策略失败:', error)
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

  const saveGroupStrategy = async () => {
    try {
      await chrome.storage.local.set({ groupStrategy: groupStrategy.value })
    } catch (error) {
      console.error('保存分组策略失败:', error)
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
    console.log('autoGroupTabs called, strategy:', groupStrategy.value)
    console.log('Total tabs:', allTabs.value.length)
    
    // 过滤掉特殊页面
    const validTabs = allTabs.value.filter(tab => {
      if (!tab.url) return false
      return !tab.url.startsWith('chrome://') && 
             !tab.url.startsWith('chrome-extension://') && 
             !tab.url.startsWith('about:')
    })
    
    console.log('Valid tabs after filtering:', validTabs.length)

    if (groupStrategy.value === 'manual') {
      // 手动分组模式，保持现有分组，但确保所有标签都在分组中
      const existingTabIds = new Set()
      groups.value.forEach(group => {
        group.tabs.forEach(tab => existingTabIds.add(tab.id))
      })
      
      // 将未分组的标签添加到暂存区或创建新分组
      validTabs.forEach(tab => {
        if (!existingTabIds.has(tab.id)) {
          // 如果暂存区不存在，创建它
          if (!groups.value.find(g => g.id === 'staging')) {
            groups.value.push({
              id: 'staging',
              name: '未分组',
              icon: '📌',
              tabs: [],
              collapsed: false,
              type: 'manual',
              strategy: 'manual'
            })
          }
          const stagingGroup = groups.value.find(g => g.id === 'staging')
          stagingGroup.tabs.push(tab)
        }
      })
    } else {
      // 自动分组模式，重新分组
      console.log('Using automatic grouping strategy:', groupStrategy.value)
      groups.value = []
      
      switch (groupStrategy.value) {
        case 'domain':
          await groupByDomain(validTabs)
          break
        case 'keyword':
          await groupByKeyword(validTabs)
          break
        case 'time':
          await groupByTime(validTabs)
          break
      }
    }

    console.log('Final groups count:', groups.value.length)
    await saveGroups()
  }

  const groupByDomain = async (tabs) => {
    console.log('groupByDomain called with', tabs.length, 'tabs')
    const domainGroups = {}

    tabs.forEach(tab => {
      try {
        const url = new URL(tab.url)
        const domain = url.hostname
        console.log('Processing tab:', tab.title, 'domain:', domain)
        
        if (!domainGroups[domain]) {
          domainGroups[domain] = {
            id: `domain_${domain}`,
            name: getDomainDisplayName(domain),
            icon: getDomainIcon(domain),
            tabs: [],
            collapsed: false,
            type: 'domain',
            strategy: 'domain'
          }
        }
        domainGroups[domain].tabs.push(tab)
      } catch (error) {
        console.warn('解析URL失败:', tab.url)
      }
    })

    console.log('Domain groups created:', Object.keys(domainGroups))
    
    // 保留所有分组，包括单个标签的分组
    Object.values(domainGroups).forEach(group => {
      console.log('Adding group:', group.name, 'with', group.tabs.length, 'tabs')
      groups.value.push(group)
    })
    
    console.log('Total groups after domain grouping:', groups.value.length)
  }

  const groupByKeyword = async (tabs) => {
    const keywordGroups = {}
    const keywords = ['开发', '设计', '文档', '会议', '购物', '娱乐', '学习', '工作']

    tabs.forEach(tab => {
      const matchedKeywords = keywords.filter(keyword => 
        tab.title.toLowerCase().includes(keyword.toLowerCase()) ||
        tab.url.toLowerCase().includes(keyword.toLowerCase())
      )

      if (matchedKeywords.length > 0) {
        const keyword = matchedKeywords[0] // 取第一个匹配的关键词
        if (!keywordGroups[keyword]) {
          keywordGroups[keyword] = {
            id: `keyword_${keyword}`,
            name: keyword,
            icon: getKeywordIcon(keyword),
            tabs: [],
            collapsed: false,
            type: 'keyword',
            strategy: 'keyword'
          }
        }
        keywordGroups[keyword].tabs.push(tab)
      } else {
        // 未匹配的标签放入"其他"分组
        if (!keywordGroups['其他']) {
          keywordGroups['其他'] = {
            id: 'keyword_其他',
            name: '其他',
            icon: '📌',
            tabs: [],
            collapsed: false,
            type: 'keyword',
            strategy: 'keyword'
          }
        }
        keywordGroups['其他'].tabs.push(tab)
      }
    })

    // 保留所有分组，包括单个标签的分组
    Object.values(keywordGroups).forEach(group => {
      groups.value.push(group)
    })
  }

  const groupByTime = async (tabs) => {
    const timeGroups = {}
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    const oneDay = 24 * oneHour

    tabs.forEach(tab => {
      const timeDiff = now - tab.lastActive
      let timeKey, groupName, icon

      if (timeDiff < oneHour) {
        timeKey = 'recent'
        groupName = '最近1小时'
        icon = '🕐'
      } else if (timeDiff < oneDay) {
        timeKey = 'today'
        groupName = '今天'
        icon = '📅'
      } else {
        timeKey = 'older'
        groupName = '更早'
        icon = '📚'
      }

      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = {
          id: `time_${timeKey}`,
          name: groupName,
          icon: icon,
          tabs: [],
          collapsed: false,
          type: 'time',
          strategy: 'time'
        }
      }
      timeGroups[timeKey].tabs.push(tab)
    })

    // 保留所有分组，包括单个标签的分组
    Object.values(timeGroups).forEach(group => {
      groups.value.push(group)
    })
  }

  const changeGroupStrategy = async (strategy) => {
    groupStrategy.value = strategy
    await saveGroupStrategy()
    await autoGroupTabs()
  }

  const createManualGroup = async (name, icon = '📁') => {
    const newGroup = {
      id: `manual_${Date.now()}`,
      name: name,
      icon: icon,
      tabs: [],
      collapsed: false,
      type: 'manual',
      strategy: 'manual'
    }
    groups.value.push(newGroup)
    await saveGroups()
    return newGroup.id
  }

  const getDomainDisplayName = (domain) => {
    const domainMap = {
      'github.com': 'GitHub',
      'stackoverflow.com': 'Stack Overflow',
      'figma.com': 'Figma',
      'notion.so': 'Notion',
      'google.com': 'Google',
      'youtube.com': 'YouTube',
      'baidu.com': '百度',
      'zhihu.com': '知乎',
      'bilibili.com': 'B站',
      'taobao.com': '淘宝',
      'jd.com': '京东'
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
      'youtube.com': '📺',
      'baidu.com': '🔍',
      'zhihu.com': '💡',
      'bilibili.com': '📺',
      'taobao.com': '🛒',
      'jd.com': '🛒'
    }
    return iconMap[domain] || '🌐'
  }

  const getKeywordIcon = (keyword) => {
    const iconMap = {
      '开发': '💻',
      '设计': '🎨',
      '文档': '📄',
      '会议': '📅',
      '购物': '🛒',
      '娱乐': '🎮',
      '学习': '📚',
      '工作': '💼'
    }
    return iconMap[keyword] || '🏷️'
  }

  const toggleGroupCollapse = (groupId) => {
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
      group.collapsed = !group.collapsed
      saveGroups()
    }
  }

  const updateGroup = async (groupData) => {
    const groupIndex = groups.value.findIndex(g => g.id === groupData.id)
    if (groupIndex !== -1) {
      groups.value[groupIndex] = {
        ...groups.value[groupIndex],
        name: groupData.name,
        icon: groupData.icon,
        type: groupData.type
      }
      await saveGroups()
    } else {
      throw new Error('分组不存在')
    }
  }

  const deleteGroup = async (groupId) => {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) {
      throw new Error('分组不存在')
    }
    
    // 关闭分组中的所有标签页
    if (group.tabs.length > 0) {
      console.log(`Closing ${group.tabs.length} tabs in group: ${group.name}`)
      
      for (const tab of group.tabs) {
        try {
          await chrome.tabs.remove(tab.id)
          console.log(`Closed tab: ${tab.title}`)
        } catch (error) {
          console.warn(`Failed to close tab ${tab.id}:`, error.message)
        }
      }
    }
    
    // 删除分组
    groups.value = groups.value.filter(g => g.id !== groupId)
    await saveGroups()
    
    // 重新加载标签页数据
    await loadTabs()
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

      if (tab.discarded) {
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
        if (!tab.discarded && (now - tab.lastActive) > thirtyMinutes) {
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

  // 分组排序相关方法
  const moveGroup = async (groupId, newIndex) => {
    const currentIndex = groups.value.findIndex(g => g.id === groupId)
    if (currentIndex === -1 || currentIndex === newIndex) return
    
    const group = groups.value.splice(currentIndex, 1)[0]
    groups.value.splice(newIndex, 0, group)
    
    await saveGroups()
  }

  const reorderGroups = async (newOrder) => {
    // newOrder 是一个包含分组ID的数组，按新顺序排列
    const orderedGroups = []
    for (const groupId of newOrder) {
      const group = groups.value.find(g => g.id === groupId)
      if (group) {
        orderedGroups.push(group)
      }
    }
    
    // 添加任何未在newOrder中的分组（可能是新创建的）
    for (const group of groups.value) {
      if (!newOrder.includes(group.id)) {
        orderedGroups.push(group)
      }
    }
    
    groups.value = orderedGroups
    await saveGroups()
  }

  return {
    // 状态
    groups,
    stagingTabs,
    allTabs,
    groupStrategy,
    groupStrategies,
    
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
    changeGroupStrategy,
    createManualGroup,
    toggleGroupCollapse,
    updateGroup,
    deleteGroup,
    activateTab,
    toggleTabDormant,
    moveToStaging,
    restoreFromStaging,
    clearStaging,
    moveTabToGroup,
    cleanupTabState,
    syncTabStates,
    moveGroup,
    reorderGroups,
    saveGroups
  }
})
