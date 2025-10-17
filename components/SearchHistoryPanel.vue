<template>
  <view class="search-panel" v-if="visible" :style="panelStyle">
    <!-- 搜索历史 -->
    <view class="search-history">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <text
          class="clear-btn"
          v-if="searchStore.validSearchHistory.length > 0"
          @click="handleClearHistory"
        >清空</text>
      </view>
      <view
        class="history-list"
        v-if="searchStore.validSearchHistory.length > 0"
      >
        <view
          class="history-item"
          v-for="(item, index) in searchStore.validSearchHistory"
          :key="index"
          @click="handleSelectHistory(item)"
        >
          <text class="history-text">{{ item }}</text>
        </view>
      </view>
      <view class="empty-history" v-else>
        <text class="empty-text">暂无搜索历史</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useSearchStore, useLayoutStore } from '@/stores'
import { computed } from 'vue'

// 定义组件名称
defineOptions({
  name: 'SearchHistoryPanel'
})

// 定义 props
defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 定义 emits
const emit = defineEmits(['select-history', 'clear-history'])

// 获取stores
const searchStore = useSearchStore()
const layoutStore = useLayoutStore()

// 动态计算面板样式 - 与 page-content 使用相同的高度计算逻辑
const panelStyle = computed(() => {
  if (layoutStore.isInitialized && layoutStore.layoutInfo) {
    const layout = layoutStore.layoutInfo
    // 使用与 page-content 完全相同的计算逻辑
    const marginTop = layout.content.startPosition + 4  // 减少间距从8px到4px
    const minHeight = layout.content.availableHeight - 4

    return {
      marginTop: `${marginTop}px`,
      minHeight: `${minHeight}px`
    }
  }
  // 布局未初始化时的默认样式
  return {
    marginTop: '48px', // searchHeight(44px) + 4px间距
    minHeight: 'calc(100vh - 48px - 70px)'
  }
})

// 选择历史记录
const handleSelectHistory = (keyword) => {
  emit('select-history', keyword)
}

// 清空历史记录
const handleClearHistory = () => {
  emit('clear-history')
}
</script>

<style lang="scss" scoped>
.search-panel {
  padding: 15px;
  padding-top: 10px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom)); /* 确保搜索历史完整显示，增加足够空间 */
  background-color: #f8f8f8;
  /* marginTop 和 minHeight 现在通过 JavaScript 动态计算 */

  .search-history {
    margin-bottom: 20px;

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .history-title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }

      .clear-btn {
        font-size: 14px;
        color: #007aff;
      }
    }

    .history-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .history-item {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        background: #fff;
        border-radius: 16px;
        border: 1px solid #e0e0e0;

        .history-text {
          font-size: 14px;
          color: #666;
        }
      }
    }

    .empty-history {
      text-align: center;
      padding: 40px 0;

      .empty-text {
        color: #999;
        font-size: 14px;
      }
    }
  }
}
</style>
