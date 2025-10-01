<template>
  <view class="search-container">
    <!-- 搜索框 -->
    <view class="search-box">
      <uni-search-bar
        ref="searchBar"
        v-model="keyword"
        :placeholder="searchPlaceholder"
        :radius="10"
        :maxlength="50"
        clearButton="auto"
        :cancelButton="showCancel"
        cancelText="取消"
        bgColor="#f5f5f5"
        textColor="#333"
        @input="onInput"
        @confirm="onSearch"
        @clear="onClear"
        @cancel="onCancel"
        @focus="onFocus"
        @blur="onBlur"
      />
    </view>

    <!-- 搜索面板 (历史记录和热门搜索) -->
    <view class="search-panel" v-if="showSearchPanel">
      <!-- 热门搜索 -->
      <!-- <view class="hot-search" v-if="showHot">
        <view class="hot-header">
          <text class="hot-title">热门搜索</text>
        </view>
        <view class="hot-list" v-if="searchStore.hotSearchList.length > 0">
          <text
            class="hot-item"
            v-for="(item, index) in searchStore.hotSearchList"
            :key="index"
            @click="selectHot(item)"
          >
            {{ item }}
          </text>
        </view>
        <view class="empty-hot" v-else>
          <text class="empty-text">暂无热门搜索</text>
        </view>
      </view> -->

      <!-- 搜索历史 -->
      <view class="search-history" v-if="showHistory">
        <view class="history-header">
          <text class="history-title">搜索历史</text>
          <text class="clear-btn" v-if="searchStore.validSearchHistory.length > 0" @click="clearHistory">清空</text>
        </view>
        <view class="history-list" v-if="searchStore.validSearchHistory.length > 0">
          <view
            class="history-item"
            v-for="(item, index) in searchStore.validSearchHistory"
            :key="index"
            @click="selectHistory(item)"
          >
            <text class="history-text">{{ item }}</text>
            <uni-icons
              type="closeempty"
              size="14"
              color="#ccc"
              @click.stop="removeHistory(item)"
            />
          </view>
        </view>
        <view class="empty-history" v-else>
          <text class="empty-text">暂无搜索历史</text>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="search-results" v-if="showResults && searchStore.hasResults">
      <view class="results-header">
        <text class="results-title">搜索结果 ({{ searchStore.resultCount }})</text>
      </view>
      <view class="results-list">
        <view
          class="result-item"
          v-for="item in searchStore.searchResults"
          :key="item.id"
          @click="selectResult(item)"
        >
          <text class="result-title">{{ item.title }}</text>
          <text class="result-type">{{ getTypeText(item.type) }}</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading" v-if="searchStore.loading">
      <uni-load-more status="loading" />
    </view>
  </view>
</template>

<script>
import { useSearchStore } from '@/stores'

export default {
  name: 'SearchComponent',
  props: {
    // 是否显示搜索历史
    showHistory: {
      type: Boolean,
      default: true
    },
    // 是否显示热门搜索
    showHot: {
      type: Boolean,
      default: true
    },
    // 是否显示搜索结果
    showResults: {
      type: Boolean,
      default: true
    },
    from:{
        type: String,
        default: '' // 可选值: 'home' (首页), 'product' (商品列表页), 'other' (其他页面)
    }
  },
  setup() {
    const searchStore = useSearchStore()
    return {
      searchStore
    }
  },
  data() {
    return {
      // 搜索框占位符文本
      searchPlaceholder: '搜索劳力士、保养服务、客户...',
      keyword: '',
      showSearchPanel: false,
      showCancel: 'none', // 初始隐藏，避免首次加载问题
      isResetting: false // 标记是否正在重置，用于屏蔽聚焦事件
    }
  },
  mounted() {
    console.log('SearchComponent mounted')
    // 初始化搜索store
    this.searchStore.init()

    // 设置热门搜索示例数据
    this.searchStore.setHotSearchList([
      '劳力士保养',
      'Rolex维修',
      '手表清洁',
      '客户管理',
      '预约服务'
    ])
  },
  methods: {
    // 输入事件
    onInput(value) {
      this.searchStore.setKeyword(value)
      this.$emit('input', value)

      // 可以在这里实现实时搜索 (防抖)
      // this.debounceSearch(value)
    },

    // 搜索事件 (确认搜索)
    async onSearch(e) {
      const keyword = e.value || this.searchStore.keyword

      if (!keyword.trim()) {
        uni.showToast({
          title: '请输入搜索关键词',
          icon: 'none'
        })
        return
      }
      if(this.from==='home'){
          uni.navigateTo({
              url:`/pages/product/list?keyword=${encodeURIComponent(keyword)}`
          })
          this.keyword=''
          this.searchStore.clearResults()
          this.searchStore.hidePanel()
          return
      }
    //   await this.searchStore.performSearch(keyword)
      this.searchStore.hidePanel()

      // 只在需要时发射搜索事件（用于特定页面的业务处理）
      this.$emit('search', keyword)
      console.log('执行搜索:', keyword)

    },

    // 清空输入
    onClear(e) {
    //   this.searchStore.clearResults()
    //   this.$emit('clear', e)
    },

    // 取消搜索
    onCancel(e) {
      this.resetSearch()
      this.$emit('cancel', e)
    },

    // 获得焦点
    onFocus(e) {
      // 如果是重置过程中触发的聚焦，不执行显示逻辑
      if (this.isResetting) {
        console.log('正在重置过程中，忽略聚焦事件')
        return
      }

      console.log("onFocus triggered - test", {
        timestamp: new Date().toLocaleTimeString(),
        event: e,
        currentKeyword: this.keyword
      })

      // 显示取消按钮和搜索面板
      this.showCancel = 'auto'
      this.showSearchPanel = true
      this.searchStore.showPanel()
      this.$emit('focus', e)
    },

    // 失去焦点
    onBlur(e) {
      console.log("onBlur triggered", {
        timestamp: new Date().toLocaleTimeString(),
        event: e
      })

      // 如果没有关键词，隐藏取消按钮
      if (!this.keyword) {
        this.showCancel = 'none'
      }

      this.$emit('blur', e)
    },

    // 关闭搜索面板
    closePanel() {
      this.searchStore.hidePanel()
      this.$emit('panel-close')
    },

    // 重置搜索框
    resetSearch() {
      console.log('重置搜索框')

      // 1. 标记为正在重置
      this.isResetting = true

      // 2. 清空内容
      this.keyword = ''
      this.searchStore.setKeyword('')

      // 3. 强制隐藏取消按钮和面板
      this.showCancel = 'none'
      this.showSearchPanel = false
      this.searchStore.hidePanel()
      this.searchStore.clearResults()

      // 4. 失焦（关键：确保输入框失去焦点）
      if (this.$refs.searchBar) {
        this.$refs.searchBar.blur()
      }

      // 5. 延迟解除重置标记（等待可能的聚焦事件触发后）
      setTimeout(() => {
        this.isResetting = false
        console.log('重置标记已解除')
      }, 300)

      this.$emit('reset')
    },

    // 选择历史记录
    async selectHistory(keyword) {
      this.searchStore.setKeyword(keyword)
      await this.searchStore.performSearch(keyword)
      this.searchStore.hidePanel()
      // 组件内部处理，不再向父组件发射事件
      console.log('选择历史关键词:', keyword)
    },

    // 删除历史记录
    removeHistory(keyword) {
      this.searchStore.removeHistoryItem(keyword)
    },

    // 清空历史记录
    clearHistory() {
      uni.showModal({
        title: '提示',
        content: '确定要清空搜索历史吗？',
        success: (res) => {
          if (res.confirm) {
            this.searchStore.clearHistory()
          }
        }
      })
    },

    // 选择热门搜索
    async selectHot(keyword) {
      this.searchStore.setKeyword(keyword)
      await this.searchStore.performSearch(keyword)
      this.searchStore.hidePanel()
      // 组件内部处理，不再向父组件发射事件
      console.log('选择热门关键词:', keyword)
    },

    // 选择搜索结果
    selectResult(result) {
      console.log('选择搜索结果:', result)
      // 组件内部处理页面跳转
      this.searchStore.hidePanel()

      switch(result.type) {
        case 'maintenance':
          uni.navigateTo({
            url: '/pages/maintenance/maintenance'
          })
          break
        case 'rolex':
          uni.navigateTo({
            url: '/pages/rolex/rolex'
          })
          break
        case 'customer':
          uni.navigateTo({
            url: '/pages/customer/customer'
          })
          break
        default:
          // 返回首页
          uni.switchTab({
            url: '/pages/index/index'
          })
          break
      }
    },

    // 获取类型文本
    getTypeText(type) {
      const typeTexts = {
        maintenance: '保养',
        rolex: '劳力士',
        customer: '客户',
        all: '全部'
      }
      return typeTexts[type] || '其他'
    },

    // 防抖搜索 (可选功能)
    debounceSearch(keyword) {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        if (keyword.trim()) {
          this.searchStore.performSearch(keyword)
        }
      }, 500) // 500ms 防抖
    }
  },

  activated() {
    console.log('SearchComponent activated')
  },

  deactivated() {
    console.log('SearchComponent deactivated')
  },

  beforeUnmount() {
    console.log('SearchComponent beforeUnmount')
    // 清理防抖搜索定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  }
}
</script>

<style lang="scss">
.search-container {
  .search-box {
    margin-bottom: 10px;

    // 自定义 uni-search-bar 样式
    :deep(.uni-searchbar) {
      background-color: transparent;

      .uni-searchbar__box {
        border: 1px solid #e5e5e5;
        transition: border-color 0.3s ease;

        &:hover {
          border-color: #007aff;
        }
      }

      .uni-searchbar__cancel {
        color: #007aff;
        font-size: 16px;
      }
    }
  }

  .search-panel {
    padding: 15px;
    margin-bottom: 20px;
  }

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
      .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: #f8f8f8;
        border-radius: 8px;
        margin-bottom: 8px;

        .history-text {
          font-size: 14px;
          color: #666;
        }
      }
    }

    .empty-history {
      text-align: center;
      padding: 20px 0;

      .empty-text {
        font-size: 14px;
        color: #999;
      }
    }
  }

  .hot-search {
    margin-bottom: 20px;

    .hot-header {
      margin-bottom: 10px;

      .hot-title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
    }

    .hot-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .hot-item {
        padding: 6px 12px;
        background: #f0f0f0;
        border-radius: 15px;
        font-size: 12px;
        color: #666;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
          background: #e0e0e0;
        }
      }
    }

    .empty-hot {
      text-align: center;
      padding: 20px 0;

      .empty-text {
        font-size: 14px;
        color: #999;
      }
    }
  }

  .search-results {
    .results-header {
      margin-bottom: 10px;

      .results-title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
    }

    .results-list {
      .result-item {
        padding: 15px;
        background: #fff;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);

        .result-title {
          font-size: 16px;
          color: #333;
          margin-bottom: 5px;
        }

        .result-type {
          font-size: 12px;
          color: #007aff;
          background: #f0f8ff;
          padding: 2px 6px;
          border-radius: 4px;
        }
      }
    }
  }

  .loading {
    text-align: center;
    padding: 20px;
  }
}
</style>
