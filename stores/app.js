import { defineStore } from 'pinia'
import { getBrands, getCarousel } from '@/api'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 轮播图数据
    carouselList: [],
    carouselLoading: false,

    // 品牌数据
    brandsList: [],
    brandsLoading: false,

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

    // 初始化应用数据
    async initApp() {
      if (this.initialized) return

      this.setGlobalLoading(true)
      try {
        // 并行获取初始数据
        await Promise.all([
          this.fetchCarousel(),
          this.fetchBrands()
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
          this.fetchBrands()
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
      this.initialized = false
      this.globalLoading = false
    }
  }
})
