/**
 * 布局状态管理 Store
 * 统一管理页面布局相关的状态和计算
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDeviceInfo,
  calculatePageLayout,
  generateSearchContainerStyle,
  generateContentStyle,
  getResponsiveMargin
} from '@/utils/layoutUtils'

export const useLayoutStore = defineStore('layout', () => {
  // 设备信息
  const deviceInfo = ref(null)

  // 布局信息
  const layoutInfo = ref(null)

  // 是否已初始化
  const isInitialized = ref(false)

  // 搜索框选项
  const searchOptions = ref({
    searchHeight: 44,
    searchMargin: 0,  // 修正：使用searchMargin替代topGap
    sideGap: '4%'
  })

  /**
   * 初始化布局信息
   * 应在 App.vue 中调用，确保全局只初始化一次
   */
  const initializeLayout = () => {
    try {
      console.log('🚀 开始初始化布局信息...')

      // 获取设备信息
      deviceInfo.value = getDeviceInfo()

      // 计算响应式边距
      searchOptions.value.sideGap = getResponsiveMargin(deviceInfo.value.screenWidth)

      // 计算完整布局信息
      layoutInfo.value = calculatePageLayout(searchOptions.value)

      isInitialized.value = true

      console.log('✅ 布局信息初始化完成:', {
        device: deviceInfo.value,
        layout: layoutInfo.value,
        searchOptions: searchOptions.value
      })

      return layoutInfo.value
    } catch (error) {
      console.error('❌ 布局信息初始化失败:', error)
      isInitialized.value = false
      throw error
    }
  }

  /**
   * 更新搜索框配置
   * @param {Object} options 新的配置选项
   */
  const updateSearchOptions = (options) => {
    searchOptions.value = { ...searchOptions.value, ...options }

    if (deviceInfo.value) {
      // 重新计算布局
      layoutInfo.value = calculatePageLayout(searchOptions.value)
      console.log('🔄 搜索框配置已更新，布局重新计算完成')
    }
  }

  // 计算属性 - 搜索框样式
  const searchContainerStyle = computed(() => {
    if (!layoutInfo.value) return {}
    return generateSearchContainerStyle(layoutInfo.value)
  })

  // 计算属性 - 内容区域样式
  const contentStyle = computed(() => {
    if (!layoutInfo.value) return {}
    return generateContentStyle(layoutInfo.value)
  })

  // 计算属性 - 导航栏总高度
  const navbarTotalHeight = computed(() => {
    if (!layoutInfo.value) return 88 // 默认值
    return layoutInfo.value.navbar.totalNavbarHeight
  })

  // 计算属性 - 状态栏高度
  const statusBarHeight = computed(() => {
    if (!deviceInfo.value) return 44 // 默认值
    return deviceInfo.value.statusBarHeight
  })

  // 计算属性 - 屏幕宽度
  const screenWidth = computed(() => {
    if (!deviceInfo.value) return 375 // 默认值
    return deviceInfo.value.screenWidth
  })

  // 计算属性 - 是否为小屏幕
  const isSmallScreen = computed(() => {
    return screenWidth.value <= 375
  })

  // 计算属性 - 是否为大屏幕
  const isLargeScreen = computed(() => {
    return screenWidth.value >= 768
  })

  /**
   * 获取页面布局样式 (用于兼容旧版本)
   * @param {Object} customOptions 自定义配置
   * @returns {Object} 包含搜索框和内容样式的对象
   */
  const getPageStyles = (customOptions = {}) => {
    if (!isInitialized.value) {
      console.warn('⚠️ 布局未初始化，使用默认样式')
      return {
        searchContainerStyle: { top: '88px' },
        contentStyle: { marginTop: '140px' }
      }
    }

    // 如果有自定义配置，临时计算
    if (Object.keys(customOptions).length > 0) {
      const tempOptions = { ...searchOptions.value, ...customOptions }
      const tempLayout = calculatePageLayout(tempOptions)
      return {
        searchContainerStyle: generateSearchContainerStyle(tempLayout),
        contentStyle: generateContentStyle(tempLayout)
      }
    }

    return {
      searchContainerStyle: searchContainerStyle.value,
      contentStyle: contentStyle.value
    }
  }

  return {
    // 状态
    deviceInfo,
    layoutInfo,
    isInitialized,
    searchOptions,

    // 计算属性
    searchContainerStyle,
    contentStyle,
    navbarTotalHeight,
    statusBarHeight,
    screenWidth,
    isSmallScreen,
    isLargeScreen,

    // 方法
    initializeLayout,
    updateSearchOptions,
    getPageStyles
  }
})