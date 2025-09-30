import { getProductCategories, getProductDetail, getProducts, searchProducts } from '@/api'
import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', {
  state: () => ({
    // 产品列表
    productList: [],
    productLoading: false,
    productPage: 1,
    productPageSize: 10,
    productTotal: 0,
    productHasMore: true,

    // 产品分类
    categories: [],
    categoriesLoading: false,

    // 当前产品详情
    currentProduct: null,
    productDetailLoading: false,

    // 搜索相关
    searchResults: [],
    searchLoading: false,
    searchKeyword: '',

    // 筛选条件
    filters: {
      category: '',
      priceRange: '',
      brand: '',
      sortBy: 'default'
    }
  }),

  getters: {
    // 根据分类过滤的产品
    filteredProducts: (state) => {
      if (!state.filters.category) return state.productList
      return state.productList.filter(product => product.category === state.filters.category)
    },

    // 是否有更多产品可加载
    canLoadMore: (state) => {
      return state.productHasMore && !state.productLoading
    },

    // 热门产品（根据销量或评分）
    hotProducts: (state) => {
      return state.productList
        .filter(product => product.isHot)
        .slice(0, 10)
    },

    // 推荐产品
    recommendedProducts: (state) => {
      return state.productList
        .filter(product => product.isRecommended)
        .slice(0, 6)
    }
  },

  actions: {
    // 获取产品列表
    async fetchProducts(params = {}, isLoadMore = false) {
      if (this.productLoading) return

      this.productLoading = true
      try {
        const requestParams = {
          page: isLoadMore ? this.productPage : 1,
          pageSize: this.productPageSize,
          ...this.filters,
          ...params
        }

        const data = await getProducts(requestParams)
        const { list = [], total = 0, hasMore = false } = data

        if (isLoadMore) {
          this.productList = [...this.productList, ...list]
        } else {
          this.productList = list
          this.productPage = 1
        }

        this.productTotal = total
        this.productHasMore = hasMore

        if (isLoadMore) {
          this.productPage += 1
        }

        return data
      } catch (error) {
        console.error('获取产品列表失败:', error)
        if (!isLoadMore) {
          this.productList = []
        }
        throw error
      } finally {
        this.productLoading = false
      }
    },

    // 加载更多产品
    async loadMoreProducts() {
      if (!this.canLoadMore) return
      return await this.fetchProducts({}, true)
    },

    // 获取产品详情
    async fetchProductDetail(productId) {
      if (this.productDetailLoading) return

      this.productDetailLoading = true
      try {
        const data = await getProductDetail(productId)
        this.currentProduct = data
        return data
      } catch (error) {
        console.error('获取产品详情失败:', error)
        this.currentProduct = null
        throw error
      } finally {
        this.productDetailLoading = false
      }
    },

    // 获取产品分类
    async fetchCategories() {
      if (this.categoriesLoading) return

      this.categoriesLoading = true
      try {
        const data = await getProductCategories()
        this.categories = data || []
        return data
      } catch (error) {
        console.error('获取产品分类失败:', error)
        this.categories = []
        throw error
      } finally {
        this.categoriesLoading = false
      }
    },

    // 搜索产品
    async searchProductsByKeyword(keyword, type = 'all') {
      if (this.searchLoading) return

      this.searchLoading = true
      this.searchKeyword = keyword

      try {
        const data = await searchProducts({ keyword, type })
        this.searchResults = data || []
        return data
      } catch (error) {
        console.error('搜索产品失败:', error)
        this.searchResults = []
        throw error
      } finally {
        this.searchLoading = false
      }
    },

    // 设置筛选条件
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      // 重新获取产品列表
      this.fetchProducts()
    },

    // 清除筛选条件
    clearFilters() {
      this.filters = {
        category: '',
        priceRange: '',
        brand: '',
        sortBy: 'default'
      }
      this.fetchProducts()
    },

    // 重置产品列表
    resetProducts() {
      this.productList = []
      this.productPage = 1
      this.productHasMore = true
      this.productTotal = 0
    },

    // 清除搜索结果
    clearSearchResults() {
      this.searchResults = []
      this.searchKeyword = ''
    },

    // 清除当前产品详情
    clearCurrentProduct() {
      this.currentProduct = null
    }
  }
})
