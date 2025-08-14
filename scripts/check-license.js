#!/usr/bin/env node

/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */

const fs = require('fs');
const path = require('path');

// 需要检查许可证的文件类型
const LICENSE_CHECK_EXTENSIONS = ['.js', '.vue', '.ts', '.jsx', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'build'];

// 许可证声明模板
const LICENSE_HEADER = `/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */`;

const LICENSE_HEADER_HTML = `<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->`;

// 检查文件是否包含许可证声明
function hasLicenseHeader(filePath, content) {
  const ext = path.extname(filePath);
  
  if (ext === '.vue') {
    return content.includes('TabTamer - 智能标签页管理 Chrome 插件') &&
           content.includes('Copyright (c) 2024 TabTamer Team') &&
           content.includes('Licensed under MIT License');
  } else if (LICENSE_CHECK_EXTENSIONS.includes(ext)) {
    return content.includes('TabTamer - 智能标签页管理 Chrome 插件') &&
           content.includes('Copyright (c) 2024 TabTamer Team') &&
           content.includes('Licensed under MIT License');
  }
  
  return true; // 其他文件类型不需要检查
}

// 递归遍历目录
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        walkDir(filePath, callback);
      }
    } else {
      callback(filePath);
    }
  });
}

// 主函数
function checkLicenses() {
  console.log('🔍 检查许可证声明...\n');
  
  const projectRoot = process.cwd();
  const filesWithoutLicense = [];
  
  walkDir(projectRoot, (filePath) => {
    const ext = path.extname(filePath);
    
    if (LICENSE_CHECK_EXTENSIONS.includes(ext)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (!hasLicenseHeader(filePath, content)) {
          filesWithoutLicense.push(filePath);
        }
      } catch (error) {
        console.warn(`⚠️  无法读取文件: ${filePath}`);
      }
    }
  });
  
  if (filesWithoutLicense.length === 0) {
    console.log('✅ 所有文件都包含正确的许可证声明！');
  } else {
    console.log('❌ 以下文件缺少许可证声明:');
    filesWithoutLicense.forEach(file => {
      console.log(`   - ${file}`);
    });
    console.log('\n💡 请在这些文件的开头添加许可证声明。');
    process.exit(1);
  }
}

// 运行检查
if (require.main === module) {
  checkLicenses();
}

module.exports = { checkLicenses, hasLicenseHeader };
