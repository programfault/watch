import { getCarousel } from '@/api'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 轮播图数据
    carouselList: [],
    carouselLoading: false,

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
        // 获取初始数据
        await this.fetchCarousel()

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
        await this.fetchCarousel()
      } catch (error) {
        console.error('刷新应用数据失败:', error)
        throw error
      }
    },

    // 重置应用状态
    resetApp() {
      this.carouselList = []
      this.initialized = false
      this.globalLoading = false
    }
  }
})
