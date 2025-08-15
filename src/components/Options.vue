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
        <h2>{{ $t('options.autoGrouping') }}</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.autoGrouping"
              @change="saveSettings"
            />
            {{ $t('options.autoGrouping') }}
          </label>
          <p class="setting-description">
            {{ $t('options.autoGroupingDesc') }}
          </p>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            {{ $t('options.keywords') }}
          </label>
          <div class="keyword-inputs">
            <input 
              v-for="(keyword, index) in settings.keywords" 
              :key="index"
              v-model="settings.keywords[index]"
              class="input keyword-input"
              :placeholder="$t('options.keywords')"
              @blur="saveSettings"
            />
            <button @click="addKeyword" class="btn btn-secondary">+</button>
          </div>
          <p class="setting-description">
            {{ $t('options.keywordsDesc') }}
          </p>
        </div>
      </div>

      <div class="settings-section">
        <h2>{{ $t('options.dormancyThreshold') }}</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            {{ $t('options.dormancyThreshold') }}
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
            {{ $t('options.dormancyThresholdDesc') }}
          </p>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.enableDormancy"
              @change="saveSettings"
            />
            {{ $t('options.enableDormancy') }}
          </label>
          <p class="setting-description">
            {{ $t('options.enableDormancyDesc') }}
          </p>
        </div>
      </div>

      <div class="settings-section">
        <h2>{{ $t('options.maxTabsPerWindow') }}</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            {{ $t('options.maxTabsPerWindow') }}
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
            {{ $t('options.maxTabsPerWindowDesc') }}
          </p>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.enableStagingArea"
              @change="saveSettings"
            />
            {{ $t('options.enableStagingArea') }}
          </label>
          <p class="setting-description">
            {{ $t('options.enableStagingAreaDesc') }}
          </p>
        </div>
      </div>

      <div class="settings-section">
        <h2>{{ $t('options.snapshotSettings') }}</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            {{ $t('options.maxSnapshots') }}
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
            {{ $t('options.maxSnapshotsDesc') }}
          </p>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.autoBackup"
              @change="saveSettings"
            />
            {{ $t('options.autoBackup') }}
          </label>
          <p class="setting-description">
            {{ $t('options.autoBackupDesc') }}
          </p>
        </div>
      </div>

      <div class="settings-section">
        <h2>{{ $t('options.dataManagement') }}</h2>
        
        <div class="data-actions">
                      <button @click="exportData" class="btn btn-primary">
              {{ $t('options.exportData') }}
            </button>
            <button @click="importData" class="btn btn-secondary">
              {{ $t('options.importData') }}
            </button>
            <button @click="clearData" class="btn btn-danger">
              {{ $t('options.clearData') }}
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
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--text-inverse);
  border-radius: 12px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.settings-section {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px var(--shadow-light);
}

.settings-section h2 {
  margin: 0 0 20px 0;
  color: var(--text-secondary);
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
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.setting-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-primary);
}

.setting-description {
  margin: 8px 0 0 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.4;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--shadow-light);
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
