import { getBrands, getCarousel, getFilterOptions } from '@/api'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 轮播图数据
    carouselList: [],
    carouselLoading: false,

    // 品牌数据
    brandsList: [],
    brandsLoading: false,

    // 表的属性筛选选项
    filterOptions: [],
    filterOptionsLoading: false,

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
    }
  },

  actions: {
    // 获取轮播图数据
    async fetchCarousel() {
      if (this.carouselLoading) return

      this.carouselLoading = true
      try {
        const data = await getCarousel()
        // 映射 API 返回的字段到组件期望的字段
        const mappedData = (data || []).map(item => ({
          ...item,
          image: item.carousel_image || item.image // 映射 carousel_image 为 image
        }))
        this.carouselList = mappedData
        return mappedData
      } catch (error) {
        console.error('获取轮播图失败:', error)
        this.carouselList = []
        throw error
      } finally {
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

    // 初始化应用数据
    async initApp() {
      if (this.initialized) return

      this.setGlobalLoading(true)
      try {
        // 并行获取初始数据
        await Promise.all([
          this.fetchCarousel(),
          this.fetchBrands(),
          this.fetchFilterOptions()
        ])

        this.initialized = true
      } catch (error) {
        console.error('应用初始化失败:', error)
        throw error
      } finally {
        this.setGlobalLoading(false)
      }
    },

    // 刷新应用数据
    async refreshApp() {
      try {
        await Promise.all([
          this.fetchCarousel(),
          this.fetchBrands(),
          this.fetchFilterOptions()
        ])
      } catch (error) {
        console.error('刷新应用数据失败:', error)
        throw error
      }
    },

    // 重置应用状态
    resetApp() {
      this.carouselList = []
      this.brandsList = []
      this.filterOptions = []
      this.initialized = false
      this.globalLoading = false
    }
  }
})
