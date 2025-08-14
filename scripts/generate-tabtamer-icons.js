#!/usr/bin/env node

/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */

const fs = require('fs');
const path = require('path');

// 图标尺寸配置
const ICON_SIZES = [16, 32, 48, 128];

// SVG 模板
const SVG_TEMPLATE = `<svg width="{SIZE}" height="{SIZE}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- 渐变定义 -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="tabGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#000000;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:0.05" />
    </linearGradient>
  </defs>
  
  <!-- 背景圆形 -->
  <circle cx="64" cy="64" r="60" fill="url(#bgGradient)" stroke="#ffffff" stroke-width="2"/>
  
  <!-- 阴影效果 -->
  <circle cx="64" cy="64" r="58" fill="url(#shadowGradient)" opacity="0.3"/>
  
  <!-- 主要标签页组 -->
  <g transform="translate(20, 25)">
    <!-- 标签页1 (主标签) -->
    <rect x="0" y="0" width="40" height="25" rx="4" fill="url(#tabGradient)" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="0" y="0" width="40" height="6" rx="4" fill="#3b82f6" opacity="0.8"/>
    <circle cx="8" cy="3" r="1.5" fill="#ffffff"/>
    <circle cx="12" cy="3" r="1.5" fill="#ffffff"/>
    <circle cx="16" cy="3" r="1.5" fill="#ffffff"/>
    
    <!-- 标签页2 -->
    <rect x="5" y="5" width="35" height="20" rx="3" fill="url(#tabGradient)" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="5" y="5" width="35" height="5" rx="3" fill="#10b981" opacity="0.7"/>
    <circle cx="10" cy="7.5" r="1" fill="#ffffff"/>
    <circle cx="14" cy="7.5" r="1" fill="#ffffff"/>
    
    <!-- 标签页3 -->
    <rect x="10" y="10" width="30" height="15" rx="2" fill="url(#tabGradient)" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="10" y="10" width="30" height="4" rx="2" fill="#f59e0b" opacity="0.7"/>
    <circle cx="13" cy="12" r="0.8" fill="#ffffff"/>
    <circle cx="16" cy="12" r="0.8" fill="#ffffff"/>
  </g>
  
  <!-- 智能分组指示器 -->
  <g transform="translate(70, 35)">
    <!-- 分组图标 -->
    <rect x="0" y="0" width="25" height="20" rx="3" fill="url(#accentGradient)" opacity="0.9"/>
    <path d="M5 5 L20 5 M5 10 L20 10 M5 15 L15 15" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="22" cy="8" r="2" fill="#ffffff"/>
    <circle cx="22" cy="13" r="2" fill="#ffffff"/>
  </g>
  
  <!-- 内存优化指示器 -->
  <g transform="translate(75, 60)">
    <!-- 休眠/唤醒图标 -->
    <circle cx="0" cy="0" r="12" fill="#f3f4f6" stroke="#9ca3af" stroke-width="1"/>
    <path d="M-6 -2 L6 -2 M-6 2 L6 2 M-6 6 L4 6" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="8" cy="-4" r="1.5" fill="#10b981"/>
    <circle cx="8" cy="4" r="1.5" fill="#ef4444"/>
  </g>
  
  <!-- 工作区快照指示器 -->
  <g transform="translate(25, 70)">
    <!-- 快照图标 -->
    <rect x="0" y="0" width="20" height="15" rx="2" fill="#fef3c7" stroke="#fbbf24" stroke-width="1"/>
    <path d="M5 5 L15 5 M5 8 L15 8 M5 11 L12 11" stroke="#92400e" stroke-width="1" stroke-linecap="round"/>
    <circle cx="17" cy="3" r="1.5" fill="#f59e0b"/>
  </g>
  
  <!-- 智能连接线 -->
  <g stroke="#ffffff" stroke-width="1.5" opacity="0.6">
    <!-- 标签页之间的连接 -->
    <path d="M60 50 Q70 45 80 45" fill="none"/>
    <path d="M65 60 Q75 65 85 65" fill="none"/>
    
    <!-- 分组连接 -->
    <path d="M45 35 Q55 30 70 35" fill="none"/>
    <path d="M50 60 Q60 55 75 60" fill="none"/>
  </g>
  
  <!-- 中心智能核心 -->
  <g transform="translate(64, 64)">
    <circle cx="0" cy="0" r="8" fill="#ffffff" opacity="0.9"/>
    <circle cx="0" cy="0" r="6" fill="url(#accentGradient)"/>
    <path d="M-3 -3 L3 3 M-3 3 L3 -3" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="2" fill="#ffffff"/>
  </g>
  
  <!-- 装饰性元素 -->
  <g opacity="0.3">
    <circle cx="20" cy="20" r="2" fill="#ffffff"/>
    <circle cx="108" cy="25" r="1.5" fill="#ffffff"/>
    <circle cx="110" cy="100" r="2" fill="#ffffff"/>
    <circle cx="25" cy="105" r="1.5" fill="#ffffff"/>
  </g>
</svg>`;

// 生成不同尺寸的 SVG
function generateSizeVariants() {
  console.log('🎨 生成 TabTamer 图标尺寸变体...\n');
  
  ICON_SIZES.forEach(size => {
    const svgContent = SVG_TEMPLATE.replace(/{SIZE}/g, size);
    const fileName = `icon${size}.svg`;
    const filePath = path.join(__dirname, '..', 'icons', fileName);
    
    fs.writeFileSync(filePath, svgContent);
    console.log(`✅ 生成 ${fileName} (${size}x${size})`);
  });
  
  console.log('\n🎉 所有 SVG 图标生成完成！');
  console.log('\n📝 下一步：');
  console.log('1. 使用在线工具将 SVG 转换为 PNG');
  console.log('2. 或使用 ImageMagick 等工具批量转换');
  console.log('3. 确保图标清晰度和可识别性');
}

// 创建图标说明文档
function createIconReadme() {
  const readmeContent = `# 🎨 TabTamer 图标设计说明

## 📋 图标概述

TabTamer 图标设计体现了"智能标签页管理"的核心功能，通过视觉元素传达产品的专业性和功能性。

## 🎯 设计理念

### 核心概念
- **智能管理**: 中心的核心元素代表 AI 驱动的智能管理
- **标签页组织**: 重叠的标签页展示分组和收纳功能
- **功能集成**: 多个功能模块围绕核心展开

### 视觉风格
- **现代简约**: 扁平化设计，符合现代 UI 趋势
- **专业可靠**: 渐变色彩和几何形状体现专业性
- **功能明确**: 每个元素都有明确的功能含义

## 🔍 设计元素解析

### 1. 主要标签页组
- **位置**: 左侧，占据主要视觉空间
- **含义**: 展示标签页管理功能
- **设计**: 三层重叠，体现分组层次

### 2. 智能分组指示器
- **位置**: 右上角
- **含义**: 自动分组和智能分类
- **设计**: 绿色渐变，代表智能和效率

### 3. 内存优化指示器
- **位置**: 右侧中部
- **含义**: 休眠和内存管理
- **设计**: 圆形设计，包含状态指示

### 4. 工作区快照指示器
- **位置**: 左下角
- **含义**: 快照保存和恢复
- **设计**: 黄色主题，代表保存功能

### 5. 中心智能核心
- **位置**: 正中心
- **含义**: AI 驱动的智能管理
- **设计**: 白色核心，绿色外圈，体现智能

## 🎨 色彩方案

### 主色调
- **背景渐变**: #667eea → #764ba2 (蓝紫色)
- **标签页**: #ffffff → #f8fafc (白色系)
- **智能分组**: #10b981 → #059669 (绿色系)

### 功能色彩
- **主标签**: #3b82f6 (蓝色)
- **分组标签**: #10b981 (绿色)
- **快照标签**: #f59e0b (黄色)
- **休眠状态**: #9ca3af (灰色)

## 📱 尺寸规格

### 标准尺寸
- **16x16**: 浏览器地址栏图标
- **32x32**: 任务栏和书签图标
- **48x48**: 扩展管理页面图标
- **128x128**: 应用商店和安装包图标

### 设计原则
- 保持视觉元素的比例关系
- 确保小尺寸下的可识别性
- 优化细节，避免模糊

## 🔧 技术实现

### SVG 特性
- 矢量图形，无损缩放
- 支持渐变和透明度
- 文件体积小，加载快

### 兼容性
- 现代浏览器完全支持
- 可转换为 PNG 格式
- 支持高分辨率显示

## 📝 使用指南

### 开发环境
- 将 SVG 文件放在 \`icons/\` 目录
- 使用 \`npm run generate-icons\` 生成不同尺寸
- 确保 manifest.json 中的路径正确

### 设计调整
- 修改 SVG 文件中的颜色值
- 调整元素位置和大小
- 保持整体视觉平衡

## 🎉 总结

TabTamer 图标设计成功传达了产品的核心价值：

✅ **功能明确**: 每个元素都有明确的功能含义  
✅ **视觉美观**: 现代简约的设计风格  
✅ **品牌一致**: 与产品功能高度匹配  
✅ **技术先进**: SVG 格式，支持高分辨率  

这个图标将成为 TabTamer 品牌形象的重要组成部分！

---

**© 2024 TabTamer Team. All rights reserved.**
`;

  const readmePath = path.join(__dirname, '..', 'icons', 'README.md');
  fs.writeFileSync(readmePath, readmeContent);
  console.log('📝 生成图标说明文档: icons/README.md');
}

// 主函数
function main() {
  try {
    // 确保 icons 目录存在
    const iconsDir = path.join(__dirname, '..', 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    // 生成图标
    generateSizeVariants();
    
    // 创建说明文档
    createIconReadme();
    
    console.log('\n🚀 图标生成完成！');
    console.log('📁 文件位置: icons/ 目录');
    console.log('🔗 下一步: 将 SVG 转换为 PNG 格式');
    
  } catch (error) {
    console.error('❌ 生成图标时出错:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { generateSizeVariants, createIconReadme };
