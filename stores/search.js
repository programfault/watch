import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    // 搜索关键词
    keyword: '',
    // 搜索历史
    searchHistory: [],
    // 搜索结果
    searchResults: [],
    // 搜索加载状态
    loading: false,
    // 热门搜索
    hotSearchList: [],
    // 搜索类型 (可根据需要扩展: 'all', 'maintenance', 'rolex', 'customer' 等)
    searchType: 'all',
    // 搜索过滤条件
    filters: {
      category: '',
      dateRange: '',
      priceRange: ''
    },
    // 搜索面板显示状态 (历史记录和热门搜索)
    showSearchPanel: false
  }),

  getters: {
    // 获取非空搜索历史
    validSearchHistory: (state) => {
      return state.searchHistory.filter(item => item.trim().length > 0)
    },

    // 是否有搜索结果
    hasResults: (state) => {
      return state.searchResults.length > 0
    },

    // 搜索结果数量
    resultCount: (state) => {
      return state.searchResults.length
    }
  },

  actions: {
    // 设置搜索关键词
    setKeyword(keyword) {
      this.keyword = keyword
    },

    // 执行搜索
    async performSearch(keyword = this.keyword) {
      if (!keyword.trim()) return

      this.loading = true
      try {
        // 添加到搜索历史
        this.addToHistory(keyword)

        // 调用真实搜索 API
        // 在开发阶段可以切换为模拟搜索
        if (process.env.NODE_ENV === 'development') {
          await this.simulateSearch(keyword)
        } else {
          await this.performRealSearch(keyword)
        }      } catch (error) {
        console.error('搜索失败:', error)
        this.searchResults = []
      } finally {
        this.loading = false
      }
    },

    // 执行真实搜索 - 调用产品 store 的搜索方法
    async performRealSearch(keyword) {
      try {
        // 这里可以调用产品 store 的搜索方法
        // 或者直接调用搜索 API
        const { useProductStore } = await import('./product.js')
        const productStore = useProductStore()

        const results = await productStore.searchProductsByKeyword(keyword, this.searchType)
        this.searchResults = results
        return results
      } catch (error) {
        console.error('搜索失败:', error)
        this.searchResults = []
        throw error
      }
    },

    // 模拟搜索 - 开发阶段使用
    async simulateSearch(keyword) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 模拟搜索结果
          this.searchResults = [
            { id: 1, title: `${keyword} 相关结果1`, type: 'maintenance' },
            { id: 2, title: `${keyword} 相关结果2`, type: 'rolex' },
            { id: 3, title: `${keyword} 相关结果3`, type: 'customer' }
          ]
          resolve()
        }, 500)
      })
    },

    // 添加到搜索历史
    addToHistory(keyword) {
      const trimmedKeyword = keyword.trim()
      if (!trimmedKeyword) return

      // 移除重复项
      const index = this.searchHistory.indexOf(trimmedKeyword)
      if (index > -1) {
        this.searchHistory.splice(index, 1)
      }

      // 添加到开头
      this.searchHistory.unshift(trimmedKeyword)

      // 限制历史记录数量
      if (this.searchHistory.length > 20) {
        this.searchHistory = this.searchHistory.slice(0, 20)
      }

      // 保存到本地存储
      this.saveHistoryToLocal()
    },

    // 清除搜索历史
    clearHistory() {
      this.searchHistory = []
      this.saveHistoryToLocal()
    },

    // 删除单个历史记录
    removeHistoryItem(keyword) {
      const index = this.searchHistory.indexOf(keyword)
      if (index > -1) {
        this.searchHistory.splice(index, 1)
        this.saveHistoryToLocal()
      }
    },

    // 设置搜索类型
    setSearchType(type) {
      this.searchType = type
    },

    // 设置过滤条件
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    // 清除搜索结果
    clearResults() {
      this.searchResults = []
      this.keyword = ''
    },

    // 设置热门搜索
    setHotSearchList(list) {
      this.hotSearchList = list
    },

    // 从本地存储加载搜索历史
    loadHistoryFromLocal() {
      try {
        const history = uni.getStorageSync('searchHistory')
        if (history) {
          this.searchHistory = JSON.parse(history)
        }
      } catch (error) {
        console.error('加载搜索历史失败:', error)
      }
    },

    // 保存搜索历史到本地存储
    saveHistoryToLocal() {
      try {
        uni.setStorageSync('searchHistory', JSON.stringify(this.searchHistory))
      } catch (error) {
        console.error('保存搜索历史失败:', error)
      }
    },

    // 显示搜索面板
    showPanel() {
      this.showSearchPanel = true
    },

    // 隐藏搜索面板
    hidePanel() {
      this.showSearchPanel = false
    },

    // 切换搜索面板显示状态
    togglePanel() {
      this.showSearchPanel = !this.showSearchPanel
    },

    // 初始化搜索store
    init() {
      this.loadHistoryFromLocal()
      // 可以在这里加载热门搜索等初始数据
    }
  }
})
