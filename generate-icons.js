/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */

const fs = require('fs');
const path = require('path');

// 创建一个简单的PNG图标（使用base64编码的简单PNG数据）
const createSimplePNG = (size) => {
  // 这是一个简单的1x1像素的PNG文件的base64编码
  // 我们将创建一个简单的彩色方块
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  ]);
  
  // 创建一个简单的IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8);   // bit depth
  ihdrData.writeUInt8(2, 9);   // color type (RGB)
  ihdrData.writeUInt8(0, 10);  // compression
  ihdrData.writeUInt8(0, 11);  // filter
  ihdrData.writeUInt8(0, 12);  // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // 创建图像数据（简单的紫色渐变）
  const imageData = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    const x = i % size;
    const y = Math.floor(i / size);
    // 创建紫色渐变
    const r = Math.floor(102 + (x / size) * 54);
    const g = Math.floor(126 + (y / size) * 54);
    const b = Math.floor(234 + (x / size) * 18);
    imageData[i * 3] = r;
    imageData[i * 3 + 1] = g;
    imageData[i * 3 + 2] = b;
  }
  
  // 添加过滤器字节
  const filteredData = Buffer.alloc(size * size * 3 + size);
  for (let y = 0; y < size; y++) {
    filteredData[y * (size * 3 + 1)] = 0; // 过滤器类型：无
    imageData.copy(filteredData, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }
  
  const idatChunk = createChunk('IDAT', filteredData);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
};

const createChunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  
  // 计算CRC32（简化版本）
  let crc = 0xFFFFFFFF;
  const crcTable = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }
  
  // 计算CRC
  for (let i = 0; i < typeBuffer.length; i++) {
    crc = crcTable[(crc ^ typeBuffer[i]) & 0xFF] ^ (crc >>> 8);
  }
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  crc = crc ^ 0xFFFFFFFF;
  
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
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
    const pngData = createSimplePNG(size);
    const filename = path.join(iconsDir, `icon${size}.png`);
    fs.writeFileSync(filename, pngData);
    console.log(`Generated ${filename}`);
  } catch (error) {
    console.error(`Error generating icon${size}.png:`, error.message);
  }
});

console.log('Icon generation completed!');
