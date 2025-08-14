<!--
  TabTamer - 智能标签页管理 Chrome 插件
  Copyright (c) 2024 TabTamer Team
  Licensed under MIT License
-->

<template>
  <div class="stats-section">
    <div class="stats-container">
      <!-- 概览卡片 -->
      <div class="stat-card overview-card">
        <div class="stat-header">
          <div class="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="currentColor" class="stat-icon-svg">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div class="stat-title-group">
            <h3 class="stat-title">概览</h3>
            <p class="stat-subtitle">内存与标签/分组</p>
          </div>
        </div>
        
        <div class="overview-content">
          <!-- 内存效率 -->
          <div class="overview-item">
            <div class="overview-title">内存效率</div>
            <div class="overview-value">{{ memoryEfficiency }}%</div>
            <div class="overview-details">
              <span>使用: {{ estimatedMemoryUsage }}MB</span>
              <span class="ok">节省: {{ estimatedMemorySaved }}MB</span>
            </div>
          </div>
          
          <!-- 标签页统计 -->
          <div class="overview-item">
            <div class="overview-title">标签页</div>
            <div class="overview-value">{{ totalTabs }}</div>
            <div class="overview-details">
              <span class="ok">活跃: {{ activeTabs }}</span>
              <span class="muted">休眠: {{ dormantTabs }}</span>
            </div>
          </div>
          
          <!-- 分组统计 -->
          <div class="overview-item">
            <div class="overview-title">分组</div>
            <div class="overview-value">{{ groupCount }}</div>
            <div class="overview-details">
              <span class="warn">暂存: {{ stagingCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  totalTabs: {
    type: Number,
    default: 0
  },
  activeTabs: {
    type: Number,
    default: 0
  },
  dormantTabs: {
    type: Number,
    default: 0
  },
  groupCount: {
    type: Number,
    default: 0
  },
  stagingCount: {
    type: Number,
    default: 0
  },
  memoryEfficiency: {
    type: Number,
    default: 0
  },
  estimatedMemoryUsage: {
    type: Number,
    default: 0
  },
  estimatedMemorySaved: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.stats-section {
  padding: 8px 10px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.stats-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px var(--shadow-light);
}

.overview-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 6px;
}

.stat-icon-svg {
  width: 20px;
  height: 20px;
  color: var(--accent-primary);
}

.stat-title-group h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-title-group p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.overview-content {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  flex-wrap: wrap;
}

.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--bg-primary);
  padding: 8px;
  border-radius: 6px;
  border: 1px solid var(--border-primary);
  box-shadow: 0 1px 3px var(--shadow-light);
  min-width: 100px;
  flex: 1;
}

.overview-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.overview-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.overview-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  color: #6b7280;
}

.overview-details span {
  display: block;
}

.overview-details .ok {
  color: #059669;
  font-weight: 500;
}

.overview-details .warn {
  color: #d97706;
  font-weight: 500;
}

.overview-details .muted {
  color: #9ca3af;
  font-weight: 500;
}





/* 响应式设计 */
@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .overview-content {
    gap: 12px;
    align-items: stretch;
  }
  
  .overview-item {
    min-width: auto;
    width: 100%;
  }
  
  .overview-value {
    font-size: 24px;
  }
  
  .overview-title {
    font-size: 13px;
  }
  
  .overview-details {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .overview-content {
    padding: 16px 0;
    gap: 20px;
  }
  
  .gauge-sm {
    width: 80px;
    height: 80px;
  }
  
  .gauge-value {
    font-size: 16px;
  }
  
  .gauge-label {
    font-size: 12px;
  }
  
  .memory-brief {
    padding: 12px;
    gap: 8px;
  }
  
  .kv {
    font-size: 12px;
    gap: 12px;
  }
  
  .metric {
    padding: 12px;
  }
  
  .metric-grid {
    gap: 8px;
  }
  
  .cell {
    padding: 8px 4px;
  }
  
  .num {
    font-size: 20px;
  }
  
  .lbl {
    font-size: 11px;
  }
}

/* 加载动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(2) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.2s;
}
</style>
