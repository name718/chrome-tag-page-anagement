<template>
  <header class="header">
    <div class="header-content">
      <!-- 品牌信息 -->
      <div class="brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h1 class="title">TabTamer</h1>
        <span class="subtitle">智能标签页管理</span>
      </div>

      <!-- 右侧操作区 -->
      <div class="header-actions">
        <!-- 分组策略选择器 -->
        <div class="strategy-selector">
          <select 
            :value="groupStrategy" 
            @change="onStrategyChange"
            class="strategy-select"
          >
            <option 
              v-for="strategy in groupStrategies" 
              :key="strategy.value" 
              :value="strategy.value"
            >
              {{ strategy.icon }} {{ strategy.label }}
            </option>
          </select>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button 
            @click="$emit('create-snapshot')" 
            class="btn btn-snapshot tooltip" 
            data-tooltip="创建快照"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span class="btn-text">快照</span>
          </button>
          
          <button 
            @click="$emit('toggle-staging')" 
            class="btn btn-staging tooltip" 
            :class="{ 'active': stagingVisible }"
            :data-tooltip="stagingVisible ? '收起暂存区' : '打开暂存区'"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            </svg>
            <span class="btn-text">暂存</span>
          </button>
          
          <button 
            @click="$emit('toggle-help')" 
            class="btn btn-help tooltip" 
            :class="{ 'active': showHelp }"
            :data-tooltip="showHelp ? '关闭说明' : '使用说明'"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
            <span class="btn-text">帮助</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  groupStrategy: {
    type: String,
    required: true
  },
  stagingVisible: {
    type: Boolean,
    default: false
  },
  showHelp: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'update:groupStrategy',
  'create-snapshot',
  'toggle-staging',
  'toggle-help'
])

// 分组策略选项
const groupStrategies = [
  { value: 'domain', label: '按域名', icon: '🌐' },
  { value: 'keyword', label: '按关键词', icon: '🏷️' },
  { value: 'time', label: '按时间', icon: '⏰' },
  { value: 'manual', label: '手动分组', icon: '✋' }
]

// 策略变化处理
const onStrategyChange = () => {
  emit('update:groupStrategy', props.groupStrategy)
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #ffffff;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon { 
  width: 20px; 
  height: 20px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border-radius: 3px; 
  background: #eef2f7; 
}

.icon-svg {
  width: 24px;
  height: 24px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.strategy-selector {
  margin-right: 8px;
}

.strategy-select {
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.strategy-select:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.strategy-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.btn { 
  display: inline-flex; 
  align-items: center; 
  gap: 6px; 
  height: 32px; 
  padding: 0 12px; 
  font-size: 12px; 
  font-weight: 500; 
  border: 1px solid #e5e7eb; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: all 0.2s ease;
  background: #ffffff;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-snapshot {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.btn-snapshot:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  border-color: #5a6fd8;
}

.btn-staging {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.btn-staging:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.btn-staging.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-staging.active:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-help {
  background: #fef3c7;
  color: #92400e;
  border-color: #fbbf24;
}

.btn-help:hover {
  background: #fde68a;
  border-color: #f59e0b;
}

.btn-help.active {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.btn-help.active:hover {
  background: #d97706;
  border-color: #d97706;
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-text {
  font-weight: 500;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
