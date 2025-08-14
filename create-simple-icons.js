/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */

const fs = require('fs');
const path = require('path');

// 创建一个最小的PNG文件（1x1像素的紫色方块）
const createMinimalPNG = () => {
  // 这是一个1x1像素的PNG文件的base64编码
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  return Buffer.from(base64PNG, 'base64');
};

// 生成所有尺寸的图标
const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// 确保icons目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

sizes.forEach(size => {
  try {
    // 对于所有尺寸，我们使用相同的1x1像素PNG
    // Chrome会自动缩放到正确的尺寸
    const pngData = createMinimalPNG();
    const filename = path.join(iconsDir, `icon${size}.png`);
    fs.writeFileSync(filename, pngData);
    console.log(`Generated ${filename}`);
  } catch (error) {
    console.error(`Error generating icon${size}.png:`, error.message);
  }
});

console.log('All icons generated successfully!');
