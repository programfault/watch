/**
 * HTTP 请求封装工具 - 基于 uni.request
 * 支持 token 拦截、自动刷新、错误处理等
 */

import { useUserStore } from '@/stores/user.js'

// API 配置
const API_CONFIG = {
  baseURL: 'https://roc.tailtweak.com/api/mini',
  timeout: 10000
}

// 是否正在刷新token
let isRefreshing = false
// 等待刷新的请求队列
const requestQueue = []

/**
 * 工具函数
 */

function getTokens() {
  try {
    // 直接从Pinia store获取tokens
    const userStore = useUserStore()
    if (userStore && userStore.tokens && userStore.tokens.access_token) {
      console.log('🔍 getTokens - 从Pinia store获取到有效token:', userStore.tokens.access_token.substring(0, 10) + '...')
      console.log('🔍 getTokens - 完整tokens信息:', {
        access_token: userStore.tokens.access_token.substring(0, 10) + '...',
        refresh_token: userStore.tokens.refresh_token ? userStore.tokens.refresh_token.substring(0, 10) + '...' : '无',
        expires_in: userStore.tokens.expires_in
      })
      return userStore.tokens
    }

    console.log('🔍 getTokens - Pinia store中无有效token')
    return null
  } catch (error) {
    console.error('🔍 getTokens - 获取失败:', error)
    return null
  }
}function saveTokens(tokens) {
  try {
    // 通过Pinia store更新tokens（会自动触发持久化）
    const userStore = useUserStore()
    userStore.tokens = tokens
    console.log('🔄 saveTokens - 已通过Pinia store更新tokens，自动持久化到storage')
  } catch (error) {
    console.error('🔄 saveTokens - 通过Pinia store更新失败:', error)
  }
}

function clearAuth() {
  try {
    // 通过Pinia store清除认证信息
    const userStore = useUserStore()
    // 调用store的logout方法，会清理所有相关状态并触发持久化
    userStore.logout(false) // false表示不跳转页面
    console.log('🔄 clearAuth - 已通过Pinia store清除认证信息')
  } catch (error) {
    console.error('🔄 clearAuth - 通过Pinia store清除失败:', error)
  }
}/**
 * 请求拦截器函数 - 处理请求配置
 */
function requestInterceptor(config) {
  // 显示 loading（如果需要）
  if (config.showLoading) {
    uni.showLoading({ title: '加载中...', mask: true })
  }

  // 自动添加 Authorization 头（如果需要认证）
  if (config.needAuth !== false) { // 默认需要认证
    const tokens = getTokens()
    console.log('🔍 请求拦截器 - tokens:', tokens)
    if (tokens?.access_token) {
      // 确保headers对象存在且格式正确
      if (!config.headers) {
        config.headers = {}
      }

      // 创建纯净的headers对象，确保没有__proto__属性
      const plainHeaders = {}

      // 复制现有的headers
      if (config.headers) {
        Object.keys(config.headers).forEach(key => {
          const value = config.headers[key]
          if (typeof value === 'string' || typeof value === 'number') {
            plainHeaders[key] = value
          }
        })
      }

      // 添加Authorization头
      plainHeaders['Authorization'] = `Bearer ${tokens.access_token}`

      // 确保Content-Type存在
      if (!plainHeaders['content-type'] && !plainHeaders['Content-Type']) {
        plainHeaders['content-type'] = 'application/json'
      }

      // 设置回纯净的headers对象
      config.headers = plainHeaders
      console.log('🔍 请求拦截器 - 已添加Authorization头:', config.headers.Authorization)
      console.log('🔍 请求拦截器 - 完整headers:', config.headers)
    }
  }

  return config
}

/**
 * 响应处理函数 - 处理响应数据和错误
 */
async function responseHandler(res, config) {
  // 这里不处理loading，统一在doRequest的finally中处理

  // 检查是否有响应数据
  if (!res.data) {
    const error = new Error('请求失败，未返回数据')
    if (config.showError !== false) {
      uni.showToast({ title: '请求失败，未返回数据', icon: 'none' })
    }
    return Promise.reject(error)
  }

  // 支持新老两种 API 格式
  if (res.data.success !== undefined) {
    // 新格式 { success, data, message }
    if (res.data.success) {
      return res.data
    } else {
      const error = new Error(res.data.message || '请求失败')
      if (config.showError !== false) {
        uni.showToast({ title: res.data.message || '请求失败', icon: 'none' })
      }
      return Promise.reject(error)
    }
  } else {
    // 老格式 { code, data, message }
    const { code, data, message } = res.data
    if (code === 200 || code === 0) {
      return data
    } else {
      const error = new Error(message || '请求失败')
      if (config.showError !== false) {
        uni.showToast({ title: message || '请求失败', icon: 'none' })
      }
      return Promise.reject(error)
    }
  }
}

/**
 * 错误处理函数 - 处理请求错误和401刷新token
 */
async function errorHandler(err, config) {
  // 记录请求错误
  console.error('请求失败:', err.errMsg || err.message || '未知错误')

  // 处理 401 错误（token 过期）
  if (err.status === 401 && config.needAuth !== false) {
    console.log('🔄 检测到401错误，开始处理token刷新流程')

    if (!isRefreshing) {
      isRefreshing = true
      console.log('🔄 开始刷新token流程，保持loading状态')

      try {
        // 刷新 token
        const tokens = getTokens()

        if (!tokens?.refresh_token) {
          throw new Error('没有 refresh_token')
        }

        console.log('🔄 开始刷新 token，refresh_token:', tokens.refresh_token.substring(0, 10) + '...')

        // 使用uni.request刷新token
        const refreshResult = await new Promise((resolve, reject) => {
          uni.request({
            url: `${API_CONFIG.baseURL}/refresh`,
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            data: {
              refresh_token: tokens.refresh_token
            },
            success: resolve,
            fail: reject
          })
        })

        console.log('🔄 刷新 token 响应:', refreshResult)

        if (refreshResult.data?.success) {
          const newTokens = refreshResult.data.data.tokens
          console.log('🔄 获取到新 tokens:', {
            access_token: newTokens.access_token.substring(0, 10) + '...',
            refresh_token: newTokens.refresh_token.substring(0, 10) + '...',
            expires_in: newTokens.expires_in
          })

          // 保存新的 tokens（会自动同步到 user-store）
          const completeTokens = {
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token,
            token_type: newTokens.token_type || 'bearer',
            expires_in: newTokens.expires_in,
            refresh_expires_in: newTokens.refresh_expires_in
          }
          saveTokens(completeTokens)

          // 更新原请求的 Authorization 头
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${newTokens.access_token}`
          }

          console.log('🔄 原请求头已更新，新 access_token:', newTokens.access_token.substring(0, 10) + '...')

          // 处理队列中的请求
          console.log('🔄 处理队列中的请求，队列长度:', requestQueue.length)
          requestQueue.forEach(({ resolve, reject, config: queuedConfig }, index) => {
            queuedConfig.headers = {
              ...queuedConfig.headers,
              'Authorization': `Bearer ${newTokens.access_token}`
            }
            console.log(`🔄 队列请求 ${index + 1} 已更新 Authorization 头:`, newTokens.access_token.substring(0, 10) + '...')

            // 队列中的请求不应该再显示loading，因为用户已经在等待了
            const queueRetryConfig = {
              ...queuedConfig,
              showLoading: false
            }

            // 重新发起队列中的请求
            doRequest(queueRetryConfig).then(resolve).catch(reject)
          })
          requestQueue.length = 0
          isRefreshing = false

          // 重新发起原请求，保持原有的loading配置
          console.log('🔄 重新发起原请求，使用新 access_token:', newTokens.access_token.substring(0, 10) + '...')

          // 确保重新发起的请求保持原有的showLoading配置，但不重复显示loading
          const retryConfig = {
            ...config,
            showLoading: false // 避免重复显示loading
          }

          return doRequest(retryConfig)
        } else {
          throw new Error('刷新 token 失败')
        }
      } catch (refreshError) {
        console.error('刷新 token 失败:', refreshError)
        isRefreshing = false
        requestQueue.length = 0

        // 刷新失败时确保隐藏loading
        if (config.showLoading) {
          uni.hideLoading()
        }

        // 清除认证信息并跳转到登录页
        clearAuth()
        uni.reLaunch({ url: '/pages/profile/profile' })

        return Promise.reject(refreshError)
      }
    } else {
      // 正在刷新，将请求加入队列
      console.log('🔄 正在刷新token中，将请求加入队列，队列长度:', requestQueue.length + 1)
      return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, config })
      })
    }
  }

  // 其他错误处理 - loading在doRequest的finally中统一处理

  if (config.showError !== false) {
    const message = err.data?.message ||
                   err.errMsg ||
                   err.message ||
                   '网络请求失败'
    uni.showToast({ title: message, icon: 'none' })
  }

  return Promise.reject(err)
}

/**
 * 核心请求函数 - 统一处理所有请求
 */
function doRequest(options) {
  // 合并默认配置
  const config = {
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    needAuth: true,
    showLoading: false,
    showError: true,
    ...options
  }

  // 应用请求拦截器
  const processedConfig = requestInterceptor(config)

  // 构建完整URL
  let fullUrl = processedConfig.url
  if (!fullUrl.startsWith('http')) {
    fullUrl = `${processedConfig.baseURL}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`
  }

  // 如果是GET请求，构建查询参数
  if (processedConfig.method?.toUpperCase() === 'GET' && processedConfig.params) {
    const queryString = Object.keys(processedConfig.params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(processedConfig.params[key])}`)
      .join('&')
    if (queryString) {
      fullUrl = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}${queryString}`
    }
  }

  console.log('📤 发送请求:', {
    url: fullUrl,
    method: processedConfig.method,
    headers: processedConfig.headers,
    data: processedConfig.data
  })

  // 创建请求Promise
  return new Promise((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method: processedConfig.method || 'GET',
      header: processedConfig.headers || {},
      data: processedConfig.data || {},
      timeout: processedConfig.timeout,
      success: (res) => {
        console.log('📥 请求成功响应:', res)
        // 响应状态码处理
        if (res.statusCode >= 200 && res.statusCode < 300) {
          responseHandler(res, processedConfig).then(resolve).catch(reject)
        } else {
          // 将HTTP错误码包装为错误对象
          const error = {
            status: res.statusCode,
            data: res.data,
            errMsg: `HTTP Error: ${res.statusCode}`
          }
          errorHandler(error, processedConfig).then(resolve).catch(reject)
        }
      },
      fail: (err) => {
        console.error('📥 请求失败:', err)
        errorHandler(err, processedConfig).then(resolve).catch(reject)
      }
    })
  }).finally(() => {
    // 统一在这里处理loading隐藏
    if (processedConfig.showLoading) {
      uni.hideLoading()
      console.log('🔄 请求结束，隐藏loading')
    }
  })
}

/**
 * 封装的请求方法
 */
export function get(url, params = {}, options = {}) {
  return doRequest({
    url,
    method: 'GET',
    params,
    ...options
  })
}

export function post(url, data = {}, options = {}) {
  return doRequest({
    url,
    method: 'POST',
    data,
    headers: {
      'content-type': 'application/json',
      ...options.headers
    },
    ...options
  })
}

export function put(url, data = {}, options = {}) {
  return doRequest({
    url,
    method: 'PUT',
    data,
    headers: {
      'content-type': 'application/json',
      ...options.headers
    },
    ...options
  })
}

export function del(url, options = {}) {
  return doRequest({
    url,
    method: 'DELETE',
    ...options
  })
}

// 导出配置和核心函数
export { API_CONFIG, doRequest as request }
