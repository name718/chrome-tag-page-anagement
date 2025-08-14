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
            class="btn btn-primary btn-compact tooltip" 
            data-tooltip="创建快照"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
          
          <button 
            @click="$emit('toggle-staging')" 
            class="btn btn-secondary btn-compact tooltip" 
            :data-tooltip="stagingVisible ? '收起暂存区' : '打开暂存区'"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            </svg>
          </button>
          
          <button 
            @click="$emit('toggle-help')" 
            class="btn btn-outline btn-compact tooltip" 
            :data-tooltip="showHelp ? '关闭说明' : '使用说明'"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
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
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  background: #ffffff;
  color: #374151;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.btn { 
  display: inline-flex; 
  align-items: center; 
  gap: 6px; 
  height: 28px; 
  padding: 0 10px; 
  font-size: 12px; 
  font-weight: 500; 
  color: #fff; 
  background: #4f46e5; 
  border: 1px solid #4f46e5; 
  border-radius: 4px; 
  cursor: pointer; 
}

.btn::before { 
  display: none; 
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border-color: #6c757d;
}

.btn-compact {
  padding: 0 8px;
  height: 26px;
}

.btn-icon {
  width: 16px;
  height: 16px;
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
