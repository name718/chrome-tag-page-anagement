# 🚀 GitHub 配置指南

## 📋 概述

TabTamer 项目现在包含了一个完整的 GitHub 集成系统，在页面底部显示 GitHub 链接，方便用户访问源代码、报告问题等。

## 🔧 配置步骤

### 1. 修改 GitHub 配置文件

编辑 `src/config/github.js` 文件，将以下 URL 替换为您的实际 GitHub 仓库地址：

```javascript
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
```

### 2. 替换示例

配置已完成！您的 GitHub 仓库地址已经设置为：

```javascript
REPOSITORY_URL: 'https://github.com/name718/chrome-tag-page-anagement',
ISSUES_URL: 'https://github.com/name718/chrome-tag-page-anagement/issues',
DISCUSSIONS_URL: 'https://github.com/name718/chrome-tag-page-anagement/discussions',
WIKI_URL: 'https://github.com/name718/chrome-tag-page-anagement/wiki',
RELEASES_URL: 'https://github.com/name718/chrome-tag-page-anagement/releases',
```

## 🎯 功能特性

### 页脚显示

页面底部会显示：

- **左侧**: 项目名称、版本号和描述
- **右侧**: GitHub 和 Issues 链接

### 链接功能

- **GitHub**: 直接跳转到您的仓库主页
- **Issues**: 跳转到问题报告页面
- **响应式设计**: 在移动设备上自动调整布局

### 图标和样式

- 使用 SVG 图标，清晰美观
- 悬停效果和动画
- 现代化的设计风格

## 📱 响应式设计

### 桌面端
- 页脚内容水平排列
- 左右两侧分别显示项目信息和链接

### 移动端
- 页脚内容垂直排列
- 居中对齐
- 调整字体大小和间距

## 🔗 扩展链接

您还可以在配置文件中添加更多链接：

```javascript
// 添加更多链接类型
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
    case 'pull-requests':
      return GITHUB_CONFIG.REPOSITORY_URL + '/pulls'
    case 'actions':
      return GITHUB_CONFIG.REPOSITORY_URL + '/actions'
    default:
      return GITHUB_CONFIG.REPOSITORY_URL
  }
}
```

## 🚀 部署后效果

配置完成后，用户将看到：

1. **项目信息**: 清晰的版本和描述信息
2. **GitHub 链接**: 一键访问源代码
3. **问题报告**: 快速报告 Bug 或建议功能
4. **专业外观**: 提升项目的专业形象

## 📝 注意事项

- 确保 GitHub 仓库是公开的，否则用户无法访问
- 定期更新版本号
- 保持项目描述准确
- 测试所有链接是否正常工作

## 🎉 完成

配置完成后，您的 TabTamer 项目将拥有一个完整的 GitHub 集成系统，提升用户体验和项目可访问性！

---

**© 2024 TabTamer Team. All rights reserved.**
