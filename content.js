/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */

// Content Script for TabTamer

// 监听来自扩展的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getPageInfo':
      sendResponse({
        title: document.title,
        url: window.location.href,
        domain: window.location.hostname,
        keywords: extractKeywords(document.title)
      })
      break
      
    case 'highlightElement':
      highlightElement(request.selector)
      sendResponse({ success: true })
      break
      
    default:
      sendResponse({ success: false, error: '未知操作' })
  }
})

// 提取页面关键词
function extractKeywords(title) {
  const keywords = ['预算', '报价', '设计', '开发', '文档', '会议', '项目', '任务']
  return keywords.filter(keyword => title.includes(keyword))
}

// 高亮页面元素
function highlightElement(selector) {
  try {
    const element = document.querySelector(selector)
    if (element) {
      element.style.outline = '2px solid #667eea'
      element.style.outlineOffset = '2px'
      
      setTimeout(() => {
        element.style.outline = ''
        element.style.outlineOffset = ''
      }, 3000)
    }
  } catch (error) {
    console.error('高亮元素失败:', error)
  }
}

// 安全发送消息（避免 Extension context invalidated 报错）
function safeSendMessage(payload) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage(payload)
    }
  } catch (e) {
    // 扩展更新/上下文失效时会报错，忽略即可，刷新页面后会恢复
    // console.warn('[content] sendMessage ignored:', e?.message || e)
  }
}

// 页面加载完成后发送页面信息
document.addEventListener('DOMContentLoaded', () => {
  // 延迟发送，确保页面完全加载
  setTimeout(() => {
    safeSendMessage({
      action: 'pageLoaded',
      data: {
        title: document.title,
        url: window.location.href,
        domain: window.location.hostname,
        timestamp: Date.now()
      }
    })
  }, 1000)
})

// 监听页面可见性变化
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    safeSendMessage({
      action: 'pageVisible',
      data: {
        url: window.location.href,
        timestamp: Date.now()
      }
    })
  }
})

// 监听页面卸载
window.addEventListener('beforeunload', () => {
  safeSendMessage({
    action: 'pageUnload',
    data: {
      url: window.location.href,
      timestamp: Date.now()
    }
  })
})
