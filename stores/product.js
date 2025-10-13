import { getWatchDetail, getWatches, searchWatches } from '@/api/app'
import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', {
  state: () => ({
    // 手表列表数据
    watchesList: [],
    watchesLoading: false,
    watchesPagination: {
      current_page: 1,
      per_page: 10,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false
    },

    // 筛选条件
    watchesFilters: {
      brand_id: null,
      keyword: '',
      attribute_filters: [],  // 新格式：[{attribute_id: 1, values: [...]}]
      price_range: null
      // 注意：排序参数由toolbarStore管理，不在这里设置
    },

    // 当前品牌信息
    currentBrand: null,

    // 当前手表详情
    currentWatch: null,
    watchDetailLoading: false,

    // 搜索相关
    searchResults: [],
    searchLoading: false,
    searchKeyword: ''
  }),

  getters: {
    // 所有手表列表
    allWatches: (state) => {
      return state.watchesList
    },

    // 是否有手表数据
    hasWatches: (state) => {
      return state.watchesList.length > 0
    },

    // 是否可以加载更多手表
    canLoadMore: (state) => {
      return state.watchesPagination.has_next && !state.watchesLoading
    },

    // 按品牌分组的手表
    watchesByBrand: (state) => {
      const grouped = {}
      state.watchesList.forEach(watch => {
        const brandId = watch.brand_id
        if (!grouped[brandId]) {
          grouped[brandId] = {
            brand: watch.brand,
            watches: []
          }
        }
        grouped[brandId].watches.push(watch)
      })
      return grouped
    },

    // 获取手表的主图片
    getWatchMainImage: (state) => (watchId) => {
      const watch = state.watchesList.find(w => w.id === watchId)
      if (!watch || !watch.images || watch.images.length === 0) return null
      // 按 weight 排序，获取权重最高的图片
      return watch.images.sort((a, b) => b.weight - a.weight)[0]
    },

    // 热门手表（根据排序或推荐）
    hotWatches: (state) => {
      return state.watchesList
        .filter(watch => watch.sort >= 90)
        .slice(0, 10)
    },

    // 根据筛选条件过滤的手表
    filteredWatches: (state) => {
      let filtered = state.watchesList

      // 品牌筛选
      if (state.watchesFilters.brand_id) {
        filtered = filtered.filter(watch => watch.brand_id === state.watchesFilters.brand_id)
      }

      // 关键词筛选
      if (state.watchesFilters.keyword) {
        const keyword = state.watchesFilters.keyword.toLowerCase()
        filtered = filtered.filter(watch =>
          watch.name_cn.toLowerCase().includes(keyword) ||
          watch.name_en.toLowerCase().includes(keyword) ||
          watch.summary.toLowerCase().includes(keyword)
        )
      }

      // 价格筛选
      if (state.watchesFilters.price_range) {
        const { min, max } = state.watchesFilters.price_range
        filtered = filtered.filter(watch => {
          const price = parseFloat(watch.price)
          return (!min || price >= min) && (!max || price <= max)
        })
      }

      return filtered
    }
  },

  actions: {
    // 简单查询手表列表
    async fetchWatches(params = {}, isLoadMore = false) {
      if (!isLoadMore) {
        this.watchesLoading = true
        this.watchesList = []
      }

      try {
        const requestParams = {
          page: isLoadMore ? this.watchesPagination.current_page + 1 : 1,
          per_page: this.watchesPagination.per_page || 10,
          ...params
        }

        const response = await getWatches(requestParams)
        console.log('fetchWatches API响应:', response)

        // 处理两种可能的响应格式
        let data
        if (response.code === 200 && response.data) {
          // 标准格式: {code: 200, data: {...}}
          data = response.data
        } else if (response.watches && response.pagination) {
          // 直接格式: {watches: [...], pagination: {...}, brand: {...}}
          data = response
        } else {
          console.warn('手表数据格式异常:', response)
          if (!isLoadMore) {
            this.watchesList = []
          }
          return
        }

        const { watches, pagination, brand } = data
        console.log('解构数据:', { watches, pagination, brand })
        console.log('watches数组长度:', watches?.length)

        if (watches && Array.isArray(watches)) {
          if (isLoadMore) {
            this.watchesList.push(...watches)
          } else {
            this.watchesList = watches
          }

          // 设置品牌信息
          if (brand) {
            this.currentBrand = brand
          } else if (watches.length > 0 && watches[0].brand) {
            this.currentBrand = watches[0].brand
          }
        } else {
          console.warn('watches不是数组或为空:', watches)
          if (!isLoadMore) {
            this.watchesList = []
          }
        }

        this.watchesPagination = pagination || {}

        console.log('store状态更新后:', {
          watchesListLength: this.watchesList.length,
          hasWatches: this.watchesList.length > 0,
          total: pagination?.total,
          currentPage: pagination?.current_page,
          brand: this.currentBrand?.name_cn
        })

        return data
      } catch (error) {
        console.error('获取手表列表失败:', error)
        if (!isLoadMore) {
          this.watchesList = []
        }
        throw error
      } finally {
        this.watchesLoading = false
      }
    },

    // 复杂查询手表列表 (简化版本，直接调用API)
    async searchWatches(filters = {}, isLoadMore = false) {
      if (!isLoadMore) {
        this.watchesLoading = true
        this.watchesList = []
        // 设置搜索关键词，用于后续的加载更多
        if (filters.keyword) {
          this.searchKeyword = filters.keyword
        }
      }

      try {
        const requestFilters = {
          page: isLoadMore ? this.watchesPagination.current_page + 1 : 1,
          per_page: this.watchesPagination.per_page || 10,
          ...filters
        }

        console.log('=== POST 请求数据格式检查 ===')
        console.log('发送到API的参数:', JSON.stringify(requestFilters, null, 2))
        if (requestFilters.attribute_filters) {
          console.log('属性筛选数组格式:', requestFilters.attribute_filters)
        }

        const response = await searchWatches(requestFilters)
        console.log('searchWatches API响应:', response)

        // 处理两种可能的响应格式
        let data
        if (response.code === 200 && response.data) {
          // 标准格式: {code: 200, data: {...}}
          data = response.data
        } else if (response.watches && response.pagination) {
          // 直接格式: {watches: [...], pagination: {...}, brand: {...}}
          data = response
        } else {
          console.warn('复杂查询数据格式异常:', response)
          if (!isLoadMore) {
            this.watchesList = []
          }
          return
        }

        const { watches, pagination, brand } = data
        console.log('解构复杂查询数据:', { watches, pagination, brand })

        if (watches && Array.isArray(watches)) {
          if (isLoadMore) {
            this.watchesList.push(...watches)
          } else {
            this.watchesList = watches
          }

          this.watchesPagination = pagination || {}
          if (brand) {
            this.currentBrand = brand
          }

          console.log('复杂查询成功，手表数量:', watches.length)
          return data
        } else {
          console.warn('复杂查询结果不是数组或为空:', watches)
          if (!isLoadMore) {
            this.watchesList = []
          }
        }

      } catch (error) {
        console.error('复杂查询手表失败:', error)
        if (!isLoadMore) {
          this.watchesList = []
        }
        throw error
      } finally {
        this.watchesLoading = false
      }
    },

    // 复杂查询手表列表 (高级版本)
    async searchWatchesAdvanced(filters = {}, isLoadMore = false) {
      if (!isLoadMore) {
        this.watchesLoading = true
        this.watchesList = []
      }

      try {
        const requestFilters = {
          page: isLoadMore ? this.watchesPagination.current_page + 1 : 1,
          per_page: this.watchesPagination.per_page || 10,
          ...this.watchesFilters,
          ...filters
        }

        const response = await searchWatches(requestFilters)

        if (response.code === 200 && response.data) {
          const { watches, pagination, brand, filters: responseFilters } = response.data

          if (isLoadMore) {
            this.watchesList.push(...watches)
          } else {
            this.watchesList = watches
          }

          this.watchesPagination = pagination
          this.currentBrand = brand
          this.watchesFilters = { ...this.watchesFilters, ...responseFilters }

          console.log('高级搜索手表数据获取成功:', {
            total: pagination.total,
            currentPage: pagination.current_page,
            brand: brand?.name_cn,
            filters: responseFilters
          })

          return response.data
        } else {
          console.warn('搜索手表数据格式异常:', response)
          if (!isLoadMore) {
            this.watchesList = []
          }
        }
      } catch (error) {
        console.error('搜索手表失败:', error)
        if (!isLoadMore) {
          this.watchesList = []
        }
        throw error
      } finally {
        this.watchesLoading = false
      }
    },

    // 加载更多手表
    async loadMore() {
      if (!this.canLoadMore) return
      return await this.fetchWatches({}, true)
    },

    // 设置筛选条件
    setFilters(filters) {
      this.watchesFilters = { ...this.watchesFilters, ...filters }
    },

    // 重置筛选条件
    resetFilters() {
      this.watchesFilters = {
        brand_id: null,
        keyword: '',
        attribute_filters: [],  // 新格式：[{attribute_id: 1, values: [...]}]
        price_range: null
        // 注意：排序参数由toolbarStore管理，不在这里重置
      }
    },

    // 根据品牌ID获取手表
    async fetchByBrand(brandId, params = {}) {
      return await this.fetchWatches({
        brand_id: brandId,
        ...params
      })
    },

    // 搜索手表关键词
    async searchByKeyword(keyword, params = {}) {
      this.searchKeyword = keyword

      // 合并搜索关键词、传入参数和当前筛选条件
      const searchParams = {
        keyword: keyword,
        ...params,
        ...this.watchesFilters
      }

      // 检查是否有来自FilterPanel的筛选条件，决定使用哪个API
      const hasFilterPanelConditions =
        this.watchesFilters.min_price || this.watchesFilters.max_price ||
        this.watchesFilters.attribute_filters ||
        Object.keys(this.watchesFilters).some(key =>
          !['page', 'per_page', 'brand_id', 'sort_by', 'sort_order', 'keyword'].includes(key)
        )

      console.log('searchByKeyword - 筛选条件检查:', {
        hasMinPrice: !!this.watchesFilters.min_price,
        hasMaxPrice: !!this.watchesFilters.max_price,
        hasAttributeFilters: !!this.watchesFilters.attribute_filters,
        attributeFiltersCount: this.watchesFilters.attribute_filters ? this.watchesFilters.attribute_filters.length : 0,
        shouldUsePostAPI: hasFilterPanelConditions,
        searchParams
      })

      if (hasFilterPanelConditions) {
        return await this.searchWatches(searchParams)
      } else {
        return await this.fetchWatches(searchParams)
      }
    },

    // 搜索结果处理
    async performSearch(keyword) {
      this.searchLoading = true
      this.searchKeyword = keyword

      try {
        // 合并搜索关键词和当前筛选条件
        const searchParams = {
          keyword: keyword,
          ...this.watchesFilters
        }

        // 检查是否有来自FilterPanel的筛选条件，决定使用哪个API
        const hasFilterPanelConditions =
          this.watchesFilters.min_price || this.watchesFilters.max_price ||
          this.watchesFilters.attribute_filters ||
          Object.keys(this.watchesFilters).some(key =>
            !['page', 'per_page', 'brand_id', 'sort_by', 'sort_order', 'keyword'].includes(key)
          )

        console.log('performSearch - 筛选条件检查:', {
          hasMinPrice: !!this.watchesFilters.min_price,
          hasMaxPrice: !!this.watchesFilters.max_price,
          hasAttributeFilters: !!this.watchesFilters.attribute_filters,
          attributeFiltersCount: this.watchesFilters.attribute_filters ? this.watchesFilters.attribute_filters.length : 0,
          shouldUsePostAPI: hasFilterPanelConditions,
          searchParams
        })

        let data
        if (hasFilterPanelConditions) {
          data = await this.searchWatches(searchParams)
        } else {
          data = await this.fetchWatches(searchParams)
        }

        this.searchResults = data?.watches || []
        return data
      } catch (error) {
        console.error('搜索手表失败:', error)
        this.searchResults = []
        throw error
      } finally {
        this.searchLoading = false
      }
    },

    // 清除搜索结果
    clearSearchResults() {
      this.searchResults = []
      this.searchKeyword = ''
    },

    // 重置所有数据
    reset() {
      this.watchesList = []
      this.watchesPagination = {
        current_page: 1,
        per_page: 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
      }
      this.currentBrand = null
      this.currentWatch = null
      this.clearSearchResults()
    },

    // 加载更多手表（分页加载）
    async loadMoreWatches() {
      console.log('开始加载更多手表数据')

      // 检查是否有下一页
      if (!this.watchesPagination.has_next || this.watchesLoading) {
        console.log('没有更多数据或正在加载中')
        return
      }

      try {
        // 如果有搜索关键词，使用搜索方法
        if (this.searchKeyword) {
          console.log('使用搜索方法加载更多:', this.searchKeyword)
          await this.searchWatches({ keyword: this.searchKeyword }, true)
        } else {
          // 否则使用普通获取方法
          console.log('使用普通方法加载更多')
          await this.fetchWatches({}, true)
        }

        console.log('加载更多完成，当前总数:', this.watchesList.length)
      } catch (error) {
        console.error('加载更多手表失败:', error)
        throw error
      }
    },

    // 获取指定手表详情
    getWatchById(watchId) {
      // 考虑ID可能是字符串或数字的情况
      return this.watchesList.find(watch =>
        watch.id === watchId ||
        watch.id === Number(watchId) ||
        String(watch.id) === String(watchId)
      )
    },

    // 设置当前手表详情
    setCurrentWatch(watch) {
      this.currentWatch = watch
    },

    // 价格排序
    async sortByPrice(direction) {
      console.log('开始价格排序:', direction)

      try {
        // 准备排序参数
        const sortParams = {
          sort_by: 'price',
          sort_order: direction
        }

        // 合并当前筛选条件和排序参数
        const requestParams = {
          ...this.watchesFilters,
          ...sortParams
        }

        // 如果有搜索关键词，加入到参数中
        if (this.searchKeyword) {
          requestParams.keyword = this.searchKeyword
        }

        console.log('价格排序请求参数:', requestParams)

        // 检查是否有复杂筛选条件，决定使用哪个API
        const hasFilterPanelConditions =
          this.watchesFilters.min_price ||
          this.watchesFilters.max_price ||
          this.watchesFilters.attribute_filters ||
          Object.keys(this.watchesFilters).some(key =>
            !['page', 'per_page', 'brand_id', 'sort_by', 'sort_order', 'keyword'].includes(key)
          )

        let data
        if (hasFilterPanelConditions) {
          // 使用复杂搜索API
          data = await this.searchWatches(requestParams)
        } else {
          // 使用简单查询API
          data = await this.fetchWatches(requestParams)
        }

        console.log('价格排序完成，数据量:', this.watchesList.length)
        return data
      } catch (error) {
        console.error('价格排序失败:', error)
        throw error
      }
    },

    // 获取手表详情
    async fetchWatchDetail(watchId) {
      this.watchDetailLoading = true
      this.currentWatch = null

      try {
        // 先查找本地缓存
        const cachedWatch = this.getWatchById(watchId)
        if (cachedWatch) {
          this.currentWatch = cachedWatch
          return cachedWatch
        }

        // 本地缓存未找到，调用 API 获取详情
        console.log('本地缓存未找到，调用 API 获取手表详情:', watchId)
        const response = await getWatchDetail(watchId)
        if (response?.data) {
          this.currentWatch = response.data
          // 将获取的详情添加到本地缓存
          if (!this.watchesList.find(watch => watch.id === response.data.id)) {
            this.watchesList.push(response.data)
          }
          return response.data
        }

        // API 也没有找到
        throw new Error('手表信息不存在')
      } catch (error) {
        console.error('获取手表详情失败:', error)
        throw error
      } finally {
        this.watchDetailLoading = false
      }
    }
  }
})
