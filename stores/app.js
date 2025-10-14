import { getBrands, getFilterOptions, getPages, getStores } from '@/api'
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
    // 获取页面数据（轮播图和其他页面）
    async fetchPages() {
      if (this.pagesLoading) return

      this.pagesLoading = true
      this.carouselLoading = true

      try {
        const data = await getPages()
        console.log('页面API响应:', data)

        // 重置列表
        this.carouselList = []
        this.pagesList = []

        if (data && Array.isArray(data)) {
          // 根据 is_carousel 字段分类数据
          data.forEach(item => {
            if (item.is_carousel === 1) {
              // 是轮播图，映射字段到组件期望的格式
              const carouselItem = {
                ...item,
                image: item.carousel_image || item.image || item.page_image
              }
              this.carouselList.push(carouselItem)
            } else {
              // 不是轮播图，添加到页面列表
              this.pagesList.push(item)
            }
          })
        }

        console.log('轮播图数据:', this.carouselList)
        console.log('页面数据:', this.pagesList)

        return { carouselList: this.carouselList, pagesList: this.pagesList }
      } catch (error) {
        console.error('获取页面数据失败:', error)
        this.carouselList = []
        this.pagesList = []
        throw error
      } finally {
        this.pagesLoading = false
        this.carouselLoading = false
      }
    },

    // 获取品牌数据
    async fetchBrands() {
      if (this.brandsLoading) return

      this.brandsLoading = true
      try {
        const data = await getBrands()
        this.brandsList = data || []
        return data
      } catch (error) {
        console.error('获取品牌失败:', error)
        this.brandsList = []
        throw error
      } finally {
        this.brandsLoading = false
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

    // 获取店铺数据
    async fetchStores() {
      if (this.storesLoading) return

      this.storesLoading = true
      try {
        const response = await getStores()
        console.log('店铺API响应:', response)

        // 处理多种可能的响应格式
        if (response && response.code === 200 && response.data) {
          // 标准格式: {code: 200, data: {stores: [...], total: 7}}
          if (response.data.stores && Array.isArray(response.data.stores)) {
            this.storesList = response.data.stores
            console.log('店铺数据获取成功(标准格式):', this.storesList)
          } else if (Array.isArray(response.data)) {
            // 数据格式: {code: 200, data: [...]}
            this.storesList = response.data
            console.log('店铺数据获取成功(数组格式):', this.storesList)
          } else {
            console.warn('店铺数据结构异常 - data字段:', response.data)
            this.storesList = []
          }
        } else if (response && response.stores && Array.isArray(response.stores)) {
          // 直接格式: {stores: [...], total: 7}
          this.storesList = response.stores
          console.log('店铺数据获取成功(直接格式):', this.storesList)
        } else if (response && Array.isArray(response)) {
          // 直接数组格式: [...]
          this.storesList = response
          console.log('店铺数据获取成功(直接数组):', this.storesList)
        } else {
          console.warn('店铺API响应异常:', response)
          this.storesList = []
        }

        return this.storesList
      } catch (error) {
        console.error('获取店铺失败:', error)
        this.storesList = []
        throw error
      } finally {
        this.storesLoading = false
      }
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

    // 获取表的属性筛选选项
    async fetchFilterOptions() {
      this.filterOptionsLoading = true
      try {
        const response = await getFilterOptions()
        console.log('筛选选项API响应:', response)

        // 处理多种可能的响应格式
        if (response && response.code === 200 && response.data) {
          // 标准格式: {code: 200, data: {attributes: [...]}}
          if (response.data.attributes && Array.isArray(response.data.attributes)) {
            this.filterOptions = response.data.attributes.sort((a, b) => a.sort - b.sort)
            console.log('筛选选项数据获取成功(标准格式):', this.filterOptions)
          } else if (Array.isArray(response.data)) {
            // 数据格式: {code: 200, data: [...]}
            this.filterOptions = response.data.sort((a, b) => a.sort - b.sort)
            console.log('筛选选项数据获取成功(数组格式):', this.filterOptions)
          } else {
            console.warn('筛选选项数据结构异常 - data字段:', response.data)
            this.filterOptions = []
          }
        } else if (response && response.attributes && Array.isArray(response.attributes)) {
          // 直接格式: {attributes: [...]}
          this.filterOptions = response.attributes.sort((a, b) => a.sort - b.sort)
          console.log('筛选选项数据获取成功(直接格式):', this.filterOptions)
        } else if (response && Array.isArray(response)) {
          // 直接数组格式: [...]
          this.filterOptions = response.sort((a, b) => a.sort - b.sort)
          console.log('筛选选项数据获取成功(直接数组):', this.filterOptions)
        } else {
          console.warn('筛选选项API响应异常:')
          console.warn('- response.code:', response?.code)
          console.warn('- 完整响应:', response)
          this.filterOptions = []
        }
      } catch (error) {
        console.error('获取筛选选项失败:', error)
        this.filterOptions = []
        throw error
      } finally {
        this.filterOptionsLoading = false
      }
    },

    // 根据属性ID获取筛选选项
    getFilterOptionById(attributeId) {
      return this.filterOptions.find(option => option.attribute_id === attributeId)
    },

    // 根据属性名称获取筛选选项
    getFilterOptionByName(attributeName) {
      return this.filterOptions.find(option => option.attribute_name === attributeName)
    },

    // 获取核心页面数据（轮播图和品牌）
    async fetchCoreData() {
      console.log('🏪 AppStore fetchCoreData 开始')

      try {
        await Promise.all([
          this.fetchPages(),
          this.fetchBrands()
        ])
        console.log('🏪 AppStore fetchCoreData 完成')
      } catch (error) {
        console.error('🏪 AppStore 核心数据获取失败:', error)
        throw error
      }
    },

    // 获取次要数据（筛选选项和店铺）
    async fetchSecondaryData() {
      console.log('🏪 AppStore fetchSecondaryData 开始')

      try {
        await Promise.all([
          this.fetchFilterOptions(),
          this.fetchStores()
        ])
        console.log('🏪 AppStore fetchSecondaryData 完成')
        this.initialized = true
      } catch (error) {
        console.error('🏪 AppStore 次要数据获取失败:', error)
        // 次要数据失败不影响主要功能
      }
    },

    // 初始化应用数据 - 优化版本，不设置全局Loading
    async initApp() {
      console.log('🏪 AppStore initApp 开始')

      try {
        // 并行获取初始数据
        await Promise.all([
          this.fetchPages(),
          this.fetchBrands(),
          this.fetchFilterOptions(),
          this.fetchStores()
        ])

        this.initialized = true
        console.log('🏪 AppStore initApp 完成')
      } catch (error) {
        console.error('🏪 AppStore 应用初始化失败:', error)
        throw error
      }
    },

    // 刷新应用数据
    async refreshApp() {
      try {
        await Promise.all([
          this.fetchPages(),
          this.fetchBrands(),
          this.fetchFilterOptions(),
          this.fetchStores()
        ])
      } catch (error) {
        console.error('刷新应用数据失败:', error)
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
