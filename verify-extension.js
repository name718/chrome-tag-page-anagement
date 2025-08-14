/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证 TabTamer Chrome 扩展文件...\n');

const distDir = path.join(__dirname, 'dist');
const requiredFiles = [
  'manifest.json',
  'popup.html',
  'options.html',
  'background.js',
  'content.js',
  'popup.js',
  'options.js',
  'style.js',
  'style.css',
  'popup.css',
  'options.css'
];

const requiredIcons = [
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png'
];

let allFilesExist = true;

// 检查主要文件
console.log('📁 检查主要文件:');
requiredFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

console.log('\n🎨 检查图标文件:');
requiredIcons.forEach(icon => {
  const iconPath = path.join(distDir, icon);
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    console.log(`✅ ${icon} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${icon} - 文件不存在`);
    allFilesExist = false;
  }
});

// 验证 manifest.json
console.log('\n📋 验证 manifest.json:');
try {
  const manifestPath = path.join(distDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log(`✅ manifest_version: ${manifest.manifest_version}`);
  console.log(`✅ name: ${manifest.name}`);
  console.log(`✅ version: ${manifest.version}`);
  
  // 检查 popup 路径
  if (manifest.action && manifest.action.default_popup) {
    const popupPath = path.join(distDir, manifest.action.default_popup);
    if (fs.existsSync(popupPath)) {
      console.log(`✅ default_popup: ${manifest.action.default_popup} - 文件存在`);
    } else {
      console.log(`❌ default_popup: ${manifest.action.default_popup} - 文件不存在`);
      allFilesExist = false;
    }
  }
  
  // 检查图标路径
  if (manifest.icons) {
    Object.entries(manifest.icons).forEach(([size, iconPath]) => {
      const fullIconPath = path.join(distDir, iconPath);
      if (fs.existsSync(fullIconPath)) {
        console.log(`✅ icon ${size}: ${iconPath} - 文件存在`);
      } else {
        console.log(`❌ icon ${size}: ${iconPath} - 文件不存在`);
        allFilesExist = false;
      }
    });
  }
  
} catch (error) {
  console.log(`❌ manifest.json 解析失败: ${error.message}`);
  allFilesExist = false;
}

// 验证 popup.html
console.log('\n🔍 验证 popup.html:');
try {
  const popupPath = path.join(distDir, 'popup.html');
  const popupContent = fs.readFileSync(popupPath, 'utf8');
  
  if (popupContent.includes('popup.js')) {
    console.log('✅ 引用了 popup.js');
  } else {
    console.log('❌ 未找到 popup.js 引用');
    allFilesExist = false;
  }
  
  if (popupContent.includes('style.css')) {
    console.log('✅ 引用了 style.css');
  } else {
    console.log('❌ 未找到 style.css 引用');
    allFilesExist = false;
  }
  
} catch (error) {
  console.log(`❌ popup.html 验证失败: ${error.message}`);
  allFilesExist = false;
}

console.log('\n📊 总结:');
if (allFilesExist) {
  console.log('🎉 所有文件验证通过！扩展已准备就绪。');
  console.log('\n📝 下一步操作:');
  console.log('1. 打开 Chrome 浏览器');
  console.log('2. 访问 chrome://extensions/');
  console.log('3. 开启"开发者模式"');
  console.log('4. 点击"加载已解压的扩展程序"');
  console.log('5. 选择 dist 目录');
  console.log('6. 插件安装完成！');
} else {
  console.log('❌ 发现一些问题，请检查上述错误信息。');
}

console.log('\n�� 扩展目录:', distDir);
