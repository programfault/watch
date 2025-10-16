import { getInitData } from '@/api'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 轮播图数据
    carouselList: [],
    carouselLoading: false,

    // 页面数据
    pagesList: [],
    pagesLoading: false,

    // 品牌数据
    brandsList: [],
    brandsLoading: false,

    // 表的属性筛选选项
    filterOptions: [],
    filterOptionsLoading: false,

    // 店铺数据
    storesList: [],
    storesLoading: false,

    // 全局加载状态
    globalLoading: false,

    // 网络状态
    networkStatus: true,

    // 应用初始化状态
    initialized: false
  }),

  getters: {
    // 有效的轮播图（所有轮播图）
    activeCarousel: (state) => {
      return state.carouselList
    },

    // 是否有轮播图
    hasCarousel: (state) => {
      return state.carouselList.length > 0
    },

    // 有效的页面（is_carousel != 1）
    activePages: (state) => {
      return state.pagesList
    },

    // 是否有页面数据
    hasPages: (state) => {
      return state.pagesList.length > 0
    },

    // 所有品牌
    allBrands: (state) => {
      return state.brandsList
    },

    // 是否有品牌数据
    hasBrands: (state) => {
      return state.brandsList.length > 0
    },

    // 按首字母分组的品牌
    brandsGroupedByLetter: (state) => {
      const grouped = {}
      state.brandsList.forEach(brand => {
        const firstLetter = brand.name_en.charAt(0).toUpperCase()
        if (!grouped[firstLetter]) {
          grouped[firstLetter] = []
        }
        grouped[firstLetter].push(brand)
      })
      return grouped
    },

    // 所有筛选选项
    allFilterOptions: (state) => {
      return state.filterOptions
    },

    // 是否有筛选选项数据
    hasFilterOptions: (state) => {
      return state.filterOptions.length > 0
    },

    // 按属性类型分组的筛选选项
    filterOptionsByType: (state) => {
      const grouped = {}
      state.filterOptions.forEach(option => {
        if (!grouped[option.attribute_type]) {
          grouped[option.attribute_type] = []
        }
        grouped[option.attribute_type].push(option)
      })
      return grouped
    },

    // 所有店铺
    allStores: (state) => {
      return state.storesList
    },

    // 是否有店铺数据
    hasStores: (state) => {
      return state.storesList.length > 0
    },

    // 按城市分组的店铺
    storesGroupedByCity: (state) => {
      const grouped = {}
      state.storesList.forEach(store => {
        // 从地址中提取城市名称（简单实现）
        const cityMatch = store.address.match(/^(.{2,4}市)/)
        const city = cityMatch ? cityMatch[1] : '其他'
        if (!grouped[city]) {
          grouped[city] = []
        }
        grouped[city].push(store)
      })
      return grouped
    }
  },

  actions: {
    // 一键初始化所有数据
    async fetchInitData() {
      console.log('🚀 开始获取初始化数据...')

      // 设置所有相关的loading状态
      this.pagesLoading = true
      this.carouselLoading = true
      this.brandsLoading = true
      this.filterOptionsLoading = true
      this.storesLoading = true

      try {
        const data = await getInitData()
        console.log('📦 初始化数据API响应:', data)

        // request 工具已经处理了响应格式，直接使用返回的数据
        if (data && typeof data === 'object') {
          const { pages = [], brands = [], filter_options = {}, stores = {} } = data

          // 处理页面数据（轮播图和其他页面）
          this.carouselList = []
          this.pagesList = []

          pages.forEach(item => {
            if (item.is_carousel === 1) {
              // 是轮播图，映射字段到组件期望的格式
              const carouselItem = {
                ...item,
                image: item.carousel_image,
                url: `/pages/activity/activity?pageId=${item.id}`,
                action_url: `/pages/activity/activity?pageId=${item.id}`
              }
              this.carouselList.push(carouselItem)
            } else {
              // 不是轮播图的页面
              this.pagesList.push(item)
            }
          })

          // 处理品牌数据
          this.brandsList = brands

          // 处理筛选选项
          this.filterOptions = filter_options.attributes || []

          // 处理店铺数据
          this.storesList = stores.stores || []

          // 设置初始化完成标志
          this.initialized = true

          console.log('✅ 初始化数据处理完成:', {
            轮播图: this.carouselList.length,
            页面: this.pagesList.length,
            品牌: this.brandsList.length,
            筛选选项: this.filterOptions.length,
            店铺: this.storesList.length
          })

          return data
        } else {
          console.error('❌ 数据格式不符合预期:', data)
          throw new Error('初始化数据格式错误')
        }
      } catch (error) {
        console.error('❌ 获取初始化数据失败:', error)
        // 重置为空数据，避免显示错误状态
        this.carouselList = []
        this.pagesList = []
        this.brandsList = []
        this.filterOptions = []
        this.storesList = []
        throw error
      } finally {
        // 重置所有loading状态
        this.pagesLoading = false
        this.carouselLoading = false
        this.brandsLoading = false
        this.filterOptionsLoading = false
        this.storesLoading = false
      }
    },





    // 根据 ID 获取品牌信息
    getBrandById(brandId) {
      return this.brandsList.find(brand => brand.id === brandId)
    },

    // 根据英文名称搜索品牌
    searchBrandsByName(keyword) {
      if (!keyword) return this.brandsList

      const searchTerm = keyword.toLowerCase()
      return this.brandsList.filter(brand =>
        brand.name_en.toLowerCase().includes(searchTerm) ||
        brand.name_cn.includes(searchTerm)
      )
    },

    // 根据 ID 获取页面信息
    getPageById(pageId) {
      return this.pagesList.find(page => page.id === pageId)
    },

    // 根据 ID 获取轮播图信息
    getCarouselById(carouselId) {
      return this.carouselList.find(carousel => carousel.id === carouselId)
    },



    // 根据 ID 获取店铺信息
    getStoreById(storeId) {
      return this.storesList.find(store => store.id === storeId)
    },

    // 根据名称或地址搜索店铺
    searchStoresByKeyword(keyword) {
      if (!keyword) return this.storesList

      const searchTerm = keyword.toLowerCase()
      return this.storesList.filter(store =>
        store.name.toLowerCase().includes(searchTerm) ||
        store.address.toLowerCase().includes(searchTerm) ||
        store.description?.toLowerCase().includes(searchTerm)
      )
    },

    // 根据城市筛选店铺
    getStoresByCity(city) {
      return this.storesList.filter(store =>
        store.address.includes(city)
      )
    },

    // 设置全局加载状态
    setGlobalLoading(loading) {
      this.globalLoading = loading
    },

    // 设置网络状态
    setNetworkStatus(status) {
      this.networkStatus = status
    },



    // 根据属性ID获取筛选选项
    getFilterOptionById(attributeId) {
      return this.filterOptions.find(option => option.attribute_id === attributeId)
    },

    // 根据属性名称获取筛选选项
    getFilterOptionByName(attributeName) {
      return this.filterOptions.find(option => option.attribute_name === attributeName)
    },





    // 初始化应用数据 - 调用一体化初始化API
    async initApp() {
      console.log('🏪 AppStore initApp 开始')
      try {
        await this.fetchInitData()
        console.log('🏪 AppStore initApp 完成')
      } catch (error) {
        console.error('🏪 AppStore 应用初始化失败:', error)
        throw error
      }
    },



    // 重置应用状态
    resetApp() {
      this.carouselList = []
      this.pagesList = []
      this.brandsList = []
      this.filterOptions = []
      this.storesList = []
      this.initialized = false
      this.globalLoading = false
    }
  }
})
