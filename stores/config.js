/**
 * 配置相关状态管理
 */
import { getConfig } from '@/api'
import { CUSTOMER_SERVICE } from '@/utils/constants.js'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    // 配置数据
    config: {
      customer_service_id: '',
      kf_id: ''
    },
    // 加载状态
    loading: false,
    // 是否已加载过配置
    loaded: false
  }),

  getters: {
    // 客服ID
    customerServiceId: (state) => state.config.customer_service_id || CUSTOMER_SERVICE.DEFAULT_CONFIG.CUSTOMER_SERVICE_ID,

    // 客服聊天ID
    kfId: (state) => state.config.kf_id || CUSTOMER_SERVICE.DEFAULT_CONFIG.KF_ID,

    // 完整的客服聊天URL
    customerServiceUrl: (state) => {
      const kfId = state.config.kf_id || CUSTOMER_SERVICE.DEFAULT_CONFIG.KF_ID
      return CUSTOMER_SERVICE.BASE_URL + kfId
    },

    // 配置是否已加载
    isConfigLoaded: (state) => state.loaded && !state.loading
  },

  actions: {
    /**
     * 获取配置信息
     */
    async fetchConfig() {
      if (this.loading) {
        console.log('🔧 配置正在加载中，跳过重复请求')
        return
      }

      this.loading = true

      try {
        console.log('🔧 开始获取配置信息...')
        const res = await getConfig()

        if (res.code === 200 && res.data) {
          this.config = {
            customer_service_id: res.data.customer_service_id || '',
            kf_id: res.data.kf_id || ''
          }
          this.loaded = true
          console.log('🔧 配置信息获取成功:', this.config)
        } else {
          console.warn('🔧 配置信息获取失败:', res.message || '未知错误')
          // 使用默认配置
          this.setDefaultConfig()
        }
      } catch (error) {
        console.error('🔧 配置信息获取异常:', error)
        // 使用默认配置
        this.setDefaultConfig()
      } finally {
        this.loading = false
      }
    },

    /**
     * 设置默认配置
     */
    setDefaultConfig() {
      this.config = {
        customer_service_id: CUSTOMER_SERVICE.DEFAULT_CONFIG.CUSTOMER_SERVICE_ID,
        kf_id: CUSTOMER_SERVICE.DEFAULT_CONFIG.KF_ID
      }
      this.loaded = true
      console.log('🔧 使用默认配置:', this.config)
    },

    /**
     * 重置配置状态
     */
    resetConfig() {
      this.config = {
        customer_service_id: '',
        kf_id: ''
      }
      this.loading = false
      this.loaded = false
    },

    /**
     * 手动设置配置（用于测试或特殊情况）
     */
    setConfig(config) {
      this.config = {
        customer_service_id: config.customer_service_id || '',
        kf_id: config.kf_id || ''
      }
      this.loaded = true
      console.log('🔧 手动设置配置:', this.config)
    }
  }
})
