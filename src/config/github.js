/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */

// GitHub 配置
export const GITHUB_CONFIG = {
  // GitHub 仓库地址
  REPOSITORY_URL: 'https://github.com/name718/chrome-tag-page-anagement',
  
  // Issues 页面地址
  ISSUES_URL: 'https://github.com/name718/chrome-tag-page-anagement/issues',
  
  // Discussions 页面地址
  DISCUSSIONS_URL: 'https://github.com/name718/chrome-tag-page-anagement/discussions',
  
  // Wiki 页面地址
  WIKI_URL: 'https://github.com/name718/chrome-tag-page-anagement/wiki',
  
  // Releases 页面地址
  RELEASES_URL: 'https://github.com/name718/chrome-tag-page-anagement/releases',
  
  // 项目名称
  PROJECT_NAME: 'TabTamer',
  
  // 项目描述
  PROJECT_DESCRIPTION: '智能标签页管理 Chrome 插件',
  
  // 版本号
  VERSION: '1.0.0',
  
  // 许可证类型
  LICENSE: 'MIT',
  
  // 作者信息
  AUTHOR: 'TabTamer Team',
  
  // 年份
  YEAR: '2024'
}

// 获取完整的 GitHub 链接
export const getGitHubUrl = (type = 'repository') => {
  switch (type) {
    case 'issues':
      return GITHUB_CONFIG.ISSUES_URL
    case 'discussions':
      return GITHUB_CONFIG.DISCUSSIONS_URL
    case 'wiki':
      return GITHUB_CONFIG.WIKI_URL
    case 'releases':
      return GITHUB_CONFIG.RELEASES_URL
    default:
      return GITHUB_CONFIG.REPOSITORY_URL
  }
}

// 获取项目信息
export const getProjectInfo = () => {
  return {
    name: GITHUB_CONFIG.PROJECT_NAME,
    description: GITHUB_CONFIG.PROJECT_DESCRIPTION,
    version: GITHUB_CONFIG.VERSION,
    license: GITHUB_CONFIG.LICENSE,
    author: GITHUB_CONFIG.AUTHOR,
    year: GITHUB_CONFIG.YEAR
  }
}
