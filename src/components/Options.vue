<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->

<template>
  <div class="options-page">
    <header class="header">
      <h1>🎯 TabTamer 设置</h1>
    </header>

    <main class="main">
      <div class="settings-section">
        <h2>智能分组设置</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.autoGrouping"
              @change="saveSettings"
            />
            启用自动分组
          </label>
          <p class="setting-description">
            自动根据域名、关键词和时间窗口对标签页进行分组
          </p>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            分组关键词
          </label>
          <div class="keyword-inputs">
            <input 
              v-for="(keyword, index) in settings.keywords" 
              :key="index"
              v-model="settings.keywords[index]"
              class="input keyword-input"
              placeholder="输入关键词"
              @blur="saveSettings"
            />
            <button @click="addKeyword" class="btn btn-secondary">+</button>
          </div>
          <p class="setting-description">
            包含这些关键词的标签页标题将被自动分组
          </p>
        </div>
      </div>

      <div class="settings-section">
        <h2>休眠设置</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            休眠阈值（分钟）
          </label>
          <input 
            type="number" 
            v-model="settings.dormancyThreshold"
            class="input"
            min="5"
            max="120"
            @change="saveSettings"
          />
          <p class="setting-description">
            标签页在指定时间内未激活将自动休眠以节省内存
          </p>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.enableDormancy"
              @change="saveSettings"
            />
            启用自动休眠
          </label>
          <p class="setting-description">
            自动休眠长时间未使用的标签页
          </p>
        </div>
      </div>

      <div class="settings-section">
        <h2>性能设置</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            单窗口最大标签数
          </label>
          <input 
            type="number" 
            v-model="settings.maxTabsPerWindow"
            class="input"
            min="50"
            max="500"
            @change="saveSettings"
          />
          <p class="setting-description">
            超过此数量的标签页将被建议移动到暂存区
          </p>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.enableStagingArea"
              @change="saveSettings"
            />
            启用暂存区
          </label>
          <p class="setting-description">
            允许将标签页移动到暂存区以节省主界面空间
          </p>
        </div>
      </div>

      <div class="settings-section">
        <h2>快照设置</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            最大快照数量
          </label>
          <input 
            type="number" 
            v-model="settings.maxSnapshots"
            class="input"
            min="5"
            max="50"
            @change="saveSettings"
          />
          <p class="setting-description">
            超过此数量的快照将被自动删除（保留最新的）
          </p>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.autoBackup"
              @change="saveSettings"
            />
            自动备份快照
          </label>
          <p class="setting-description">
            定期自动创建当前工作区的快照
          </p>
        </div>
      </div>

      <div class="settings-section">
        <h2>数据管理</h2>
        
        <div class="data-actions">
          <button @click="exportData" class="btn btn-primary">
            📤 导出数据
          </button>
          <button @click="importData" class="btn btn-secondary">
            📥 导入数据
          </button>
          <button @click="clearData" class="btn btn-danger">
            🗑️ 清除所有数据
          </button>
        </div>
        
        <input 
          ref="fileInput"
          type="file" 
          accept=".json"
          style="display: none"
          @change="handleFileImport"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const fileInput = ref(null)

const settings = reactive({
  autoGrouping: true,
  keywords: ['预算', '报价', '设计', '开发', '文档', '会议'],
  dormancyThreshold: 30,
  enableDormancy: true,
  maxTabsPerWindow: 200,
  enableStagingArea: true,
  maxSnapshots: 20,
  autoBackup: false
})

onMounted(async () => {
  await loadSettings()
})

const loadSettings = async () => {
  try {
    const result = await chrome.storage.local.get(['settings'])
    if (result.settings) {
      Object.assign(settings, result.settings)
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

const saveSettings = async () => {
  try {
    await chrome.storage.local.set({ settings })
    console.log('设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

const addKeyword = () => {
  settings.keywords.push('')
  saveSettings()
}

const exportData = async () => {
  try {
    const result = await chrome.storage.local.get(null)
    const dataStr = JSON.stringify(result, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tabtamer-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出数据失败:', error)
    alert('导出数据失败: ' + error.message)
  }
}

const importData = () => {
  fileInput.value.click()
}

const handleFileImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    if (confirm('确定要导入这些数据吗？这将覆盖当前的所有设置和数据。')) {
      await chrome.storage.local.clear()
      await chrome.storage.local.set(data)
      
      // 重新加载设置
      await loadSettings()
      
      alert('数据导入成功！')
    }
  } catch (error) {
    console.error('导入数据失败:', error)
    alert('导入数据失败: ' + error.message)
  }
  
  // 清空文件输入
  event.target.value = ''
}

const clearData = async () => {
  if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
    try {
      await chrome.storage.local.clear()
      await loadSettings()
      alert('数据已清除')
    } catch (error) {
      console.error('清除数据失败:', error)
      alert('清除数据失败: ' + error.message)
    }
  }
}
</script>

<style scoped>
.options-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.settings-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.settings-section h2 {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 20px;
  font-weight: 600;
}

.setting-item {
  margin-bottom: 24px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.setting-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

.setting-description {
  margin: 8px 0 0 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.4;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.keyword-inputs {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.keyword-input {
  flex: 1;
}

.data-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  user-select: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

@media (max-width: 600px) {
  .options-page {
    padding: 16px;
  }
  
  .settings-section {
    padding: 16px;
  }
  
  .data-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
