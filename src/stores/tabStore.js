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
    console.log('=== 开始初始化 ===')
    
    // 在页面上显示初始化状态
    const showStatus = (message) => {
      console.log(message)
      // 尝试在页面上显示状态
      try {
        const statusDiv = document.getElementById('init-status')
        if (statusDiv) {
          statusDiv.textContent = `[TabStore] ${message}`
        }
      } catch (e) {
        // 忽略页面显示错误
      }
    }
    
    showStatus('开始初始化...')
    await loadTabs()
    showStatus('标签页加载完成')
    await loadGroups()
    showStatus('分组数据加载完成')
    await loadStagingTabs()
    showStatus('暂存区加载完成')
    await loadGroupStrategy()
    showStatus('分组策略加载完成')
    
    // 检查是否有现有分组数据
    showStatus('检查现有分组数据...')
    console.log('=== 检查现有分组数据 ===')
    console.log('groups.value:', groups.value)
    console.log('groups.value.length:', groups.value.length)
    
    // 更宽松的检查：只要分组存在且结构正确，就认为有现有分组
    const hasExistingGroups = groups.value.some(group => 
      group && 
      group.id && 
      group.name && 
      group.tabs && 
      Array.isArray(group.tabs)
    )
    
    console.log('hasExistingGroups:', hasExistingGroups)
    
    if (hasExistingGroups) {
      const msg = '✅ 发现现有分组数据，跳过自动分组'
      showStatus(msg)
      console.log(msg)
      console.log('现有分组详情:')
      groups.value.forEach((group, index) => {
        if (group && group.tabs) {
          console.log(`  - ${group.name}: ${group.tabs.length} 个标签页`)
        }
      })
      
      // 只更新现有分组中的标签页状态
      const validTabs = allTabs.value.filter(tab => {
        if (!tab.url) return false
        return !tab.url.startsWith('chrome://') && 
               !tab.url.startsWith('chrome-extension://') && 
               !tab.url.startsWith('about:')
      })
      console.log('有效标签页数量:', validTabs.length)
      await updateExistingGroups(validTabs)
      showStatus('现有分组更新完成')
    } else {
      const msg = '❌ 没有现有分组数据，执行自动分组'
      showStatus(msg)
      console.log(msg)
      console.log('groups.value 详情:', JSON.stringify(groups.value, null, 2))
      await autoGroupTabs()
      showStatus('自动分组完成')
    }
    
    await syncTabStates() // 同步标签页状态
    startDormancyMonitor()
    showStatus('初始化完成')
    console.log('=== 初始化完成 ===')
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
      console.log('开始加载分组数据...')
      
      // 在页面上显示状态
      const showStatus = (message) => {
        console.log(message)
        try {
          const statusDiv = document.getElementById('init-status')
          if (statusDiv) {
            statusDiv.textContent = `[TabStore] ${message}`
          }
        } catch (e) {}
      }
      
      showStatus('开始加载分组数据...')
      const result = await chrome.storage.local.get(['tabGroups'])
      console.log('从存储加载的分组数据:', result)
      
      const raw = result.tabGroups
      console.log('原始分组数据:', raw, '类型:', typeof raw, '是否为数组:', Array.isArray(raw))
      
      if (Array.isArray(raw)) {
        groups.value = raw
        const msg = `使用数组格式，加载了 ${raw.length} 个分组`
        console.log(msg)
        showStatus(msg)
      } else if (raw && typeof raw === 'object') {
        groups.value = Object.values(raw)
        const msg = `使用对象格式，转换为 ${groups.value.length} 个分组`
        console.log(msg)
        showStatus(msg)
      } else {
        groups.value = []
        const msg = '没有找到分组数据，初始化为空数组'
        console.log(msg)
        showStatus(msg)
      }
      
      // 兜底 tabs 字段，并确保所有必要字段都存在
      groups.value = groups.value.map(g => ({
        id: g.id || `group_${Date.now()}`,
        name: g.name || '未命名分组',
        icon: g.icon || '📁',
        type: g.type || 'manual',
        strategy: g.strategy || 'manual',
        collapsed: g.collapsed || false,
        tabs: Array.isArray(g?.tabs) ? g.tabs : []
      }))
      
      console.log('最终分组数据:', groups.value)
      console.log('分组数量:', groups.value.length)
      groups.value.forEach((group, index) => {
        console.log(`分组 ${index}:`, group.name, '标签页数量:', group.tabs.length)
        if (group.tabs && group.tabs.length > 0) {
          console.log(`  标签页详情:`, group.tabs.map(tab => `${tab.title} (ID: ${tab.id})`))
        }
      })
      
      // 验证分组数据的完整性
      const validGroups = groups.value.filter(group => 
        group && group.tabs && Array.isArray(group.tabs) && group.tabs.length > 0
      )
      const msg = `有效分组数量: ${validGroups.length}`
      console.log(msg)
      showStatus(msg)
      console.log('有效分组:', validGroups.map(g => `${g.name} (${g.tabs.length} 个标签页)`))
    } catch (error) {
      const errorMsg = `加载分组失败: ${error.message}`
      console.error(errorMsg, error)
      try {
        const statusDiv = document.getElementById('init-status')
        if (statusDiv) {
          statusDiv.textContent = `[TabStore] ❌ ${errorMsg}`
          statusDiv.style.background = '#c00'
        }
      } catch (e) {}
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
      console.log('=== 保存分组数据 ===')
      console.log('要保存的分组数据:', groups.value)
      console.log('分组数量:', groups.value.length)
      groups.value.forEach((group, index) => {
        console.log(`分组 ${index}: ${group.name} (${group.tabs.length} 个标签页)`)
      })
      
      // 将 Vue 响应式对象转换为普通对象，避免保存响应式代理
      const plainGroups = groups.value.map(group => ({
        id: group.id,
        name: group.name,
        icon: group.icon,
        type: group.type,
        strategy: group.strategy,
        collapsed: group.collapsed,
        tabs: group.tabs.map(tab => ({
          id: tab.id,
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
          discarded: tab.discarded,
          dormant: tab.dormant,
          lastActive: tab.lastActive,
          active: tab.active,
          pinned: tab.pinned,
          index: tab.index,
          windowId: tab.windowId
        }))
      }))
      
      console.log('转换后的普通对象:', plainGroups)
      await chrome.storage.local.set({ tabGroups: plainGroups })
      console.log('分组数据保存成功')
      
      // 验证保存是否成功
      const result = await chrome.storage.local.get(['tabGroups'])
      console.log('保存后验证数据:', result)
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
    console.log('=== autoGroupTabs 开始 ===')
    console.log('当前分组策略:', groupStrategy.value)
    console.log('当前分组数量:', groups.value.length)
    console.log('所有标签页数量:', allTabs.value.length)
    
    if (groups.value.length > 0) {
      console.log('现有分组详情:')
      groups.value.forEach((group, index) => {
        console.log(`  分组 ${index}: ${group.name} (${group.tabs.length} 个标签页)`)
      })
    }
    
    // 过滤掉特殊页面
    const validTabs = allTabs.value.filter(tab => {
      if (!tab.url) return false
      return !tab.url.startsWith('chrome://') && 
             !tab.url.startsWith('chrome-extension://') && 
             !tab.url.startsWith('about:')
    })
    
    console.log('过滤后的有效标签页数量:', validTabs.length)

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
      // 自动分组模式，智能分组
      console.log('Using automatic grouping strategy:', groupStrategy.value)
      
      // 检查是否需要重新分组
      const needsRegrouping = shouldRegroupTabs(validTabs)
      
      if (needsRegrouping) {
        console.log('🚨 Tabs changed, regrouping...')
        console.log('🚨 清空前分组数量:', groups.value.length)
        console.log('🚨 清空前分组详情:', groups.value.map(g => `${g.name} (${g.tabs.length} 个标签页)`))
        
        groups.value = []
        console.log('🚨 分组已清空! groups.value.length =', groups.value.length)
        
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
      } else {
        console.log('✅ Tabs unchanged, keeping existing groups')
        // 保持现有分组，只更新标签页状态
        await updateExistingGroups(validTabs)
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

  // 检查是否需要重新分组
  const shouldRegroupTabs = (currentTabs) => {
    console.log('=== shouldRegroupTabs 检查 ===')
    console.log('现有分组数量:', groups.value.length)
    console.log('当前标签页数量:', currentTabs.length)
    
    // 如果没有现有分组，需要分组
    if (groups.value.length === 0) {
      console.log('❌ 没有现有分组，需要重新分组')
      return true
    }

    // 检查现有分组中是否有有效数据
    console.log('检查现有分组的有效性...')
    groups.value.forEach((group, index) => {
      console.log(`  分组 ${index}: ${group.name}`)
      console.log(`    - 存在: ${!!group}`)
      console.log(`    - tabs存在: ${!!group.tabs}`)
      console.log(`    - tabs是数组: ${Array.isArray(group.tabs)}`)
      console.log(`    - tabs长度: ${group.tabs ? group.tabs.length : 'undefined'}`)
      if (group.tabs && group.tabs.length > 0) {
        console.log(`    - 标签页: ${group.tabs.map(tab => `${tab.title} (ID: ${tab.id})`).join(', ')}`)
      }
    })
    
    // 更宽松的检查：只要分组存在且结构正确，就认为有效
    const hasValidGroups = groups.value.some(group => 
      group && 
      group.id && 
      group.name && 
      group.tabs && 
      Array.isArray(group.tabs)
    )
    
    console.log('hasValidGroups:', hasValidGroups)
    
    if (!hasValidGroups) {
      console.log('❌ 现有分组结构无效，需要重新分组')
      return true
    }

    // 如果现有分组结构有效，优先保持现有分组
    console.log('✅ 现有分组结构有效，优先保持现有分组')
    return false
  }

  // 更新现有分组中的标签页状态
  const updateExistingGroups = async (currentTabs) => {
    console.log('=== updateExistingGroups 开始 ===')
    console.log('当前标签页数量:', currentTabs.length)
    console.log('现有分组数量:', groups.value.length)
    
    const currentTabMap = new Map(currentTabs.map(tab => [tab.id, tab]))
    console.log('当前标签页ID列表:', Array.from(currentTabMap.keys()))
    
    let totalTabsBefore = 0
    let totalTabsAfter = 0
    
    groups.value.forEach(group => {
      const beforeCount = group.tabs.length
      totalTabsBefore += beforeCount
      
      group.tabs = group.tabs.filter(tab => {
        // 移除已关闭的标签页
        if (!currentTabMap.has(tab.id)) {
          console.log(`标签页 ${tab.title} (ID: ${tab.id}) 已关闭，从分组 ${group.name} 中移除`)
          return false
        }
        
        // 更新标签页信息
        const currentTab = currentTabMap.get(tab.id)
        Object.assign(tab, currentTab)
        return true
      })
      
      const afterCount = group.tabs.length
      totalTabsAfter += afterCount
      
      if (beforeCount !== afterCount) {
        console.log(`分组 ${group.name}: ${beforeCount} -> ${afterCount} 个标签页`)
      }
    })
    
    console.log(`标签页总数变化: ${totalTabsBefore} -> ${totalTabsAfter}`)
    
    // 将新标签页添加到暂存区
    const existingTabIds = new Set()
    groups.value.forEach(group => {
      group.tabs.forEach(tab => existingTabIds.add(tab.id))
    })
    
    const newTabs = currentTabs.filter(tab => !existingTabIds.has(tab.id))
    if (newTabs.length > 0) {
      console.log(`发现 ${newTabs.length} 个新标签页，添加到暂存区`)
      // 确保暂存区存在
      let stagingGroup = groups.value.find(g => g.id === 'staging')
      if (!stagingGroup) {
        stagingGroup = {
          id: 'staging',
          name: '未分组',
          icon: '📌',
          tabs: [],
          collapsed: false,
          type: 'manual',
          strategy: 'manual'
        }
        groups.value.push(stagingGroup)
        console.log('创建新的暂存区分组')
      }
      stagingGroup.tabs.push(...newTabs)
      console.log('新标签页已添加到暂存区')
    }
    
    console.log('=== updateExistingGroups 完成 ===')
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

  const moveTabToGroup = async (tabId, groupId) => {
    console.log('=== moveTabToGroup 开始 ===')
    console.log('移动标签页:', tabId, '到分组:', groupId)
    console.log('当前 groups.value 长度:', groups.value.length)
    
    // 验证参数
    if (!tabId) {
      console.log('❌ tabId 为空，无法移动标签页')
      return
    }
    
    if (!groupId) {
      console.log('❌ groupId 为空，无法移动标签页')
      return
    }
    
    // 从所有分组中查找标签页
    let tab = null
    let sourceGroupId = null
    
    console.log('开始查找标签页...')
    for (const group of groups.value) {
      console.log(`检查分组: ${group.name} (${group.id}), 标签数量: ${group.tabs.length}`)
      if (group.tabs && Array.isArray(group.tabs)) {
        console.log(`  标签页IDs: [${group.tabs.map(t => t.id).join(', ')}]`)
        console.log(`  查找标签页ID: ${tabId} (类型: ${typeof tabId})`)
        
        // 详细的查找过程
        for (let i = 0; i < group.tabs.length; i++) {
          const t = group.tabs[i]
          const tabIdNum = Number(tabId)
          const comparison = t.id === tabIdNum || t.id === tabId
          console.log(`    检查标签页 ${i}: id=${t.id} (类型: ${typeof t.id}), tabId=${tabId} (类型: ${typeof tabId}), 比较结果: ${comparison}`)
          if (comparison) {
            tab = t
            sourceGroupId = group.id
            console.log(`✅ 找到标签页 ${tabId} 在分组 ${group.name} (${group.id})`)
            break
          }
        }
        
        if (tab) break
      } else {
        console.log(`⚠️ 分组 ${group.name} 的 tabs 不是数组:`, group.tabs)
      }
    }
    
    if (!tab) {
      console.log('❌ 未找到标签页:', tabId)
      console.log('当前所有分组中的标签页:')
      groups.value.forEach((group, index) => {
        if (group.tabs && Array.isArray(group.tabs)) {
          console.log(`  分组 ${index}: ${group.name} - ${group.tabs.map(t => t.id).join(', ')}`)
        } else {
          console.log(`  分组 ${index}: ${group.name} - tabs 不是数组:`, group.tabs)
        }
      })
      return
    }

    // 创建新的分组数组，确保响应式更新
    console.log('开始创建新的分组数组...')
    const newGroups = groups.value.map(group => {
      if (group.id === groupId) {
        // 目标分组：添加标签页
        const newTabs = [...group.tabs, tab]
        console.log(`目标分组 ${group.name}: 添加标签页 ${tabId}, 现在有 ${newTabs.length} 个标签页`)
        return { ...group, tabs: newTabs }
      } else if (group.id === sourceGroupId) {
        // 源分组：移除标签页 - 只移除第一个匹配的
        const tabIdNum = Number(tabId)
        let removed = false
        const newTabs = group.tabs.filter(t => {
          const shouldRemove = !removed && (t.id === tabIdNum || t.id === tabId)
          if (shouldRemove) {
            removed = true
            console.log(`源分组 ${group.name}: 移除标签页 ${t.id} (匹配 ${tabId})`)
          }
          return !shouldRemove
        })
        console.log(`源分组 ${group.name}: 移除标签页 ${tabId}, 现在有 ${newTabs.length} 个标签页`)
        return { ...group, tabs: newTabs }
      } else {
        // 其他分组：保持不变
        return { ...group, tabs: [...group.tabs] }
      }
    })

    // 强制更新整个 groups 数组
    console.log('强制更新 groups 数组...')
    groups.value = newGroups
    
    console.log('=== 更新后的分组状态 ===')
    groups.value.forEach((group, index) => {
      console.log(`分组 ${index}: ${group.name} (${group.tabs.length} 个标签页)`)
    })
    
    await saveGroups()
    console.log('=== moveTabToGroup 完成 ===')
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

