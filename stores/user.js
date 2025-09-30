import { addCustomer, getCustomers, getUserInfo, login, updateCustomer } from '@/api'
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
    }
  }
})
