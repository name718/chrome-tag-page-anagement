/**
 * TabTamer - 智能标签页管理 Chrome 插件
 * Copyright (c) 2024 TabTamer Team
 * Licensed under MIT License
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './', // 使用相对路径
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.html'),
        options: resolve(__dirname, 'src/options.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
