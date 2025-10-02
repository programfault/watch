import { addCustomer, getBenefits, getConsumers, getCustomers, getUserInfo, login, updateCustomer } from '@/api'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户信息
    userInfo: null,
    isLoggedIn: false,
    userInfoLoading: false,

    // 登录状态
    loginLoading: false,

    // 客户管理
    customers: [],
    customersLoading: false,
    customersPage: 1,
    customersPageSize: 20,
    customersTotal: 0,
    customersHasMore: true,

		// 消费者管理
		consumers: [],
		consumersLoading: false,
		consumersTotal: 0,
		consumersSearchKeyword: '', // 消费者搜索关键词
        consumersCardNumber: '', // 消费者搜索会员卡号

		// 福利管理（优惠券和特权）
		benefits: {
			coupons: [],
			privileges: [],
			coupons_count: 0,
			privileges_count: 0,
			total_count: 0,
			filters: {
				type: null,
				status: 'active'
			}
		},
		benefitsLoading: false,

    // 权限相关
    permissions: [],

    // 用户设置
    settings: {
      notifications: true,
      theme: 'light',
      language: 'zh-CN'
    }
  }),

  getters: {
    // 用户昵称
    nickname: (state) => {
      return state.userInfo?.nickname || '未登录'
    },

    // 用户头像
    avatar: (state) => {
      return state.userInfo?.avatar || '/static/default-avatar.png'
    },

    // 是否是管理员
    isAdmin: (state) => {
      return state.userInfo?.role === 'admin'
    },

    // 是否有特定权限
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    },

    // VIP 客户列表
    vipCustomers: (state) => {
      return state.customers.filter(customer => customer.level === 'vip')
    },

    // 消费者列表是否有数据
    hasConsumers: (state) => {
      return state.consumers.length > 0
    },

    // 消费者总数
    consumersCount: (state) => {
      return state.consumers.length
    },

    // 过滤后的消费者列表（根据搜索关键词）
    filteredConsumers: (state) => {
      console.log('filteredConsumers计算开始:', {
        consumersLength: state.consumers?.length || 0,
        searchKeyword: state.consumersSearchKeyword,
        consumersArray: state.consumers
      })

      if (!state.consumersSearchKeyword && !state.consumersCardNumber) {
        console.log('无搜索关键词，返回全部consumers:', state.consumers?.length || 0)
        return state.consumers || []
      }

      const keyword = state.consumersSearchKeyword.toLowerCase().trim()
      const filtered = (state.consumers || []).filter(consumer => {
        // 只搜索手机号和卡号
        const phone = (consumer.phone || '').toLowerCase()
        const cardNumber = (consumer.card_number || '').toLowerCase()
        return phone.includes(keyword) || cardNumber.includes(keyword)
      })

      console.log('搜索过滤结果:', {
        keyword: keyword,
        filteredLength: filtered.length
      })

      return filtered
    },    // 过滤后的消费者数量
    filteredConsumersCount: (_state, getters) => {
      return getters.filteredConsumers.length
    },

    // 是否有过滤后的消费者数据
    hasFilteredConsumers: (state) => {
      // 直接基于 state 计算，避免 getter 依赖问题
      if (!state.consumersSearchKeyword) {
        const hasData = state.consumers && state.consumers.length > 0
        console.log('hasFilteredConsumers计算(无搜索):', {
          consumersLength: state.consumers?.length || 0,
          hasData: hasData
        })
        return hasData
      } else {
        const keyword = state.consumersSearchKeyword.toLowerCase().trim()
        const filtered = (state.consumers || []).filter(consumer => {
          // 只搜索手机号和卡号
          const phone = (consumer.phone || '').toLowerCase()
          const cardNumber = (consumer.card_number || '').toLowerCase()
          return phone.includes(keyword) || cardNumber.includes(keyword)
        })
        const hasData = filtered.length > 0
        console.log('hasFilteredConsumers计算(有搜索):', {
          keyword: keyword,
          filteredLength: filtered.length,
          hasData: hasData
        })
        return hasData
      }
    },

    // 福利相关 getters
    hasBenefits: (state) => {
      return state.benefits.coupons.length > 0 || state.benefits.privileges.length > 0
    },

    // 可用优惠券数量
    availableCouponsCount: (state) => {
      return state.benefits.coupons.filter(coupon => coupon.is_valid && coupon.status).length
    },

    // 可用特权数量
    availablePrivilegesCount: (state) => {
      return state.benefits.privileges.filter(privilege => privilege.is_valid && privilege.status).length
    },

    // 获取所有优惠券（响应式）
    benefitsCoupons: (state) => {
      return state.benefits.coupons || []
    },

    // 获取所有特权（响应式）
    benefitsPrivileges: (state) => {
      return state.benefits.privileges || []
    }
  },

  actions: {
    // 用户登录
    async loginUser(loginData) {
      if (this.loginLoading) return

      this.loginLoading = true
      try {
        const data = await login(loginData)
        const { userInfo, token, permissions = [] } = data

        // 保存用户信息
        this.userInfo = userInfo
        this.isLoggedIn = true
        this.permissions = permissions

        // 保存 token 到本地存储
        if (token) {
          uni.setStorageSync('token', token)
        }

        return data
      } catch (error) {
        console.error('登录失败:', error)
        this.logout()
        throw error
      } finally {
        this.loginLoading = false
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      if (this.userInfoLoading) return

      this.userInfoLoading = true
      try {
        const data = await getUserInfo()
        this.userInfo = data
        this.isLoggedIn = true
        return data
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.logout()
        throw error
      } finally {
        this.userInfoLoading = false
      }
    },

    // 用户登出
    logout() {
      this.userInfo = null
      this.isLoggedIn = false
      this.permissions = []
      this.customers = []

      // 清除本地存储
      uni.removeStorageSync('token')

      // 可以跳转到登录页
      // uni.reLaunch({ url: '/pages/login/login' })
    },

    // 获取客户列表
    async fetchCustomers(params = {}, isLoadMore = false) {
      if (this.customersLoading) return

      this.customersLoading = true
      try {
        const requestParams = {
          page: isLoadMore ? this.customersPage : 1,
          pageSize: this.customersPageSize,
          ...params
        }

        const data = await getCustomers(requestParams)
        const { list = [], total = 0, hasMore = false } = data

        if (isLoadMore) {
          this.customers = [...this.customers, ...list]
        } else {
          this.customers = list
          this.customersPage = 1
        }

        this.customersTotal = total
        this.customersHasMore = hasMore

        if (isLoadMore) {
          this.customersPage += 1
        }

        return data
      } catch (error) {
        console.error('获取客户列表失败:', error)
        if (!isLoadMore) {
          this.customers = []
        }
        throw error
      } finally {
        this.customersLoading = false
      }
    },

    // 添加客户
    async createCustomer(customerData) {
      try {
        const data = await addCustomer(customerData)
        // 添加到本地列表
        this.customers.unshift(data)
        this.customersTotal += 1
        return data
      } catch (error) {
        console.error('添加客户失败:', error)
        throw error
      }
    },

    // 更新客户信息
    async modifyCustomer(customerId, customerData) {
      try {
        const data = await updateCustomer(customerId, customerData)
        // 更新本地列表
        const index = this.customers.findIndex(c => c.id === customerId)
        if (index > -1) {
          this.customers.splice(index, 1, data)
        }
        return data
      } catch (error) {
        console.error('更新客户失败:', error)
        throw error
      }
    },

    // 删除客户
    removeCustomer(customerId) {
      const index = this.customers.findIndex(c => c.id === customerId)
      if (index > -1) {
        this.customers.splice(index, 1)
        this.customersTotal -= 1
      }
    },

    // 更新用户设置
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings }
      // 保存到本地存储
      uni.setStorageSync('userSettings', JSON.stringify(this.settings))
    },

    // 从本地存储加载设置
    loadSettings() {
      try {
        const settings = uni.getStorageSync('userSettings')
        if (settings) {
          this.settings = { ...this.settings, ...JSON.parse(settings) }
        }
      } catch (error) {
        console.error('加载用户设置失败:', error)
      }
    },

    // 检查登录状态
    async checkLoginStatus() {
      const token = uni.getStorageSync('token')
      if (token && !this.isLoggedIn) {
        try {
          await this.fetchUserInfo()
        } catch {
          // token 无效，清除
          uni.removeStorageSync('token')
        }
      }
    },

    // 初始化用户状态
    async initUser() {
      this.loadSettings()
      await this.checkLoginStatus()
    },

    // 获取消费者列表
    async fetchConsumers(params = {}) {
      if (this.consumersLoading) return

      this.consumersLoading = true
      try {
        console.log('发送消费者请求，参数:', params)
        const response = await getConsumers(params)
        console.log('收到消费者响应:', response)

        // 处理响应数据 - 支持多种响应格式
        let consumersData = []
        let total = 0

        if (response?.users) {
          // 格式1: { users: [...], total: 123 }
          consumersData = response.users || []
          total = response.total || 0
          console.log('解析出的消费者数据(格式1):', consumersData, '总数:', total)
        } else if (response?.data?.users) {
          // 格式2: { data: { users: [...], total: 123 } }
          consumersData = response.data.users || []
          total = response.data.total || 0
          console.log('解析出的消费者数据(格式2):', consumersData, '总数:', total)
        } else if (Array.isArray(response?.data)) {
          // 格式3: { data: [...] }
          consumersData = response.data || []
          total = consumersData.length
          console.log('解析出的消费者数据(格式3):', consumersData, '总数:', total)
        } else if (Array.isArray(response)) {
          // 格式4: 直接返回数组 [...]
          consumersData = response || []
          total = consumersData.length
          console.log('解析出的消费者数据(格式4):', consumersData, '总数:', total)
        } else {
          console.log('响应格式不符合预期:', response)
          console.log('响应数据类型:', typeof response)
          console.log('响应数据键:', Object.keys(response || {}))
        }        // 更新数据
        this.consumers = consumersData
        this.consumersTotal = total
        this.consumersHasMore = false // 不支持分页，所以设为false

        console.log('获取消费者列表成功:', {
          consumers: this.consumers,
          total: this.consumersTotal,
          hasMore: this.consumersHasMore
        })

        return this.consumers
      } catch (error) {
        console.error('获取消费者列表失败:', error)
        throw error
      } finally {
        this.consumersLoading = false
      }
    },

    // 重置消费者列表
    resetConsumers() {
      this.consumers = []
      this.consumersPage = 1
      this.consumersTotal = 0
      this.consumersHasMore = true
      this.consumersSearchKeyword = '' // 重置搜索关键词
      this.consumersCardNumber = '' // 重置会员卡号
    },

    // 设置消费者搜索关键词
    setConsumersSearchKeyword(keyword) {
      this.consumersSearchKeyword = keyword || ''
    },
    setConsumersCardNumber(cardNumber) {
        this.consumersCardNumber = cardNumber || ''
    },
    // 清除消费者搜索
    clearConsumersSearch() {
      this.consumersSearchKeyword = ''
      this.consumersCardNumber = '' // 清除会员卡号
    },

    // 获取福利信息（优惠券和特权）
    async fetchBenefits(params = {}) {
      if (this.benefitsLoading) return

      this.benefitsLoading = true
      try {
        console.log('发送福利请求，参数:', params)
        const response = await getBenefits(params)
        console.log('收到福利响应:', response)

        // 处理响应数据 - 检查两种可能的数据结构
        let benefitsData = null

        if (response?.data) {
          // 数据嵌套在 data 字段中
          benefitsData = response.data
        } else if (response?.coupons || response?.privileges) {
          // 数据直接在根级别
          benefitsData = response
        }

        if (benefitsData) {
          this.benefits = {
            coupons: benefitsData.coupons || [],
            privileges: benefitsData.privileges || [],
            coupons_count: benefitsData.coupons_count || 0,
            privileges_count: benefitsData.privileges_count || 0,
            total_count: benefitsData.total_count || 0,
            filters: benefitsData.filters || { type: null, status: 'active' }
          }

          console.log('福利数据更新成功:', {
            coupons: this.benefits.coupons.length,
            privileges: this.benefits.privileges.length,
            total: this.benefits.total_count
          })
        } else {
          console.log('福利响应格式不符合预期:', response)
        }

        return this.benefits
      } catch (error) {
        console.error('获取福利信息失败:', error)
        throw error
      } finally {
        this.benefitsLoading = false
      }
    },

    // 重置福利数据
    resetBenefits() {
      this.benefits = {
        coupons: [],
        privileges: [],
        coupons_count: 0,
        privileges_count: 0,
        total_count: 0,
        filters: {
          type: null,
          status: 'active'
        }
      }
    }
  }
})
