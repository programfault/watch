/**
 * HTTP 请求封装工具 - 基于 Axios
 * 支持 token 拦截、自动刷新、错误处理等
 */
import axios from 'axios'
import mpAdapter from 'axios-miniprogram-adapter'

// 配置 uni-app 适配器
axios.defaults.adapter = mpAdapter

// API 配置
const API_CONFIG = {
  baseURL: 'http://116.198.203.44:8000/api/mini',
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
    const tokens = uni.getStorageSync('tokens')
    return tokens ? JSON.parse(tokens) : null
  } catch (error) {
    console.error('获取 tokens 失败:', error)
    return null
  }
}

function saveTokens(tokens) {
  try {
    uni.setStorageSync('tokens', JSON.stringify(tokens))
  } catch (error) {
    console.error('保存 tokens 失败:', error)
  }
}

function clearAuth() {
  uni.removeStorageSync('tokens')
  uni.removeStorageSync('userInfo')
  uni.removeStorageSync('session_key')
}

/**
 * 创建 Axios 实例
 */
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout
  // 不在这里设置全局content-type，让axios根据请求方法自动处理
})

/**
 * 请求拦截器 - 自动添加 token 和 loading
 */
api.interceptors.request.use(
  (config) => {
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
        // 小程序环境中需要确保headers是普通对象
        // 创建纯净的headers对象，避免axios内部属性影响
        const plainHeaders = {}

        // 复制现有的headers，过滤掉非字符串属性
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

        // 设置回纯净的headers对象
        config.headers = plainHeaders
        console.log('🔍 请求拦截器 - 已添加Authorization头:', config.headers.Authorization)
        console.log('🔍 请求拦截器 - 完整headers:', config.headers)
        console.log('🔍 请求拦截器 - 最终config:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
          params: config.params
        })
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器 - 自动处理错误和 token 刷新
 */
api.interceptors.response.use(
  (response) => {
    // 隐藏 loading
    if (response.config.showLoading) {
      uni.hideLoading()
    }



    // 支持新老两种 API 格式
    if (response.data.success !== undefined) {
      // 新格式 { success, data, message }
      if (response.data.success) {
        return response.data
      } else {
        const error = new Error(response.data.message || '请求失败')
        if (response.config.showError !== false) {
          uni.showToast({ title: response.data.message || '请求失败', icon: 'none' })
        }
        return Promise.reject(error)
      }
    } else {
      // 老格式 { code, data, message }
      const { code, data, message } = response.data
      if (code === 200 || code === 0) {
        return data
      } else {
        const error = new Error(message || '请求失败')
        if (response.config.showError !== false) {
          uni.showToast({ title: message || '请求失败', icon: 'none' })
        }
        return Promise.reject(error)
      }
    }
  },
  async (error) => {
    const originalRequest = error.config

    // 隐藏 loading
    if (originalRequest.showLoading) {
      uni.hideLoading()
    }

    // 记录请求错误
    console.error('请求失败:', error.message)

    // 处理 401 错误（token 过期）
    if (error.response?.status === 401 && originalRequest.needAuth !== false) {
      if (!isRefreshing) {
        isRefreshing = true

        try {
          // 刷新 token
          const tokens = getTokens()

          if (!tokens?.refresh_token) {
            throw new Error('没有 refresh_token')
          }          const response = await axios.post(`${API_CONFIG.baseURL}/refresh`, {
            refresh_token: tokens.refresh_token
          }, {
            headers: {
              'content-type': 'application/json'
            }
          })

          if (response.data.success) {
            const newTokens = response.data.data.tokens
            saveTokens(newTokens)

            // 更新原请求的 Authorization 头
            originalRequest.headers = {
              ...originalRequest.headers,
              'Authorization': `Bearer ${newTokens.access_token}`
            }

            // 处理队列中的请求
            requestQueue.forEach(({ resolve, reject, config }) => {
              config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${newTokens.access_token}`
              }
              api.request(config).then(resolve).catch(reject)
            })
            requestQueue.length = 0
            isRefreshing = false

            // 重新发起原请求
            return api.request(originalRequest)
          } else {
            throw new Error('刷新 token 失败')
          }
        } catch (refreshError) {
          console.error('刷新 token 失败:', refreshError)
          isRefreshing = false
          requestQueue.length = 0

          // 清除认证信息并跳转到登录页
          clearAuth()
          uni.reLaunch({ url: '/pages/profile/profile' })

          return Promise.reject(refreshError)
        }
      } else {
        // 正在刷新，将请求加入队列
        return new Promise((resolve, reject) => {
          requestQueue.push({ resolve, reject, config: originalRequest })
        })
      }
    }

    // 其他错误处理
    if (originalRequest.showError !== false) {
      const message = error.response?.data?.message ||
                     error.message ||
                     '网络请求失败'
      uni.showToast({ title: message, icon: 'none' })
    }

    return Promise.reject(error)
  }
)

/**
 * 封装的请求方法
 */
export function get(url, params = {}, options = {}) {
  return api.get(url, {
    params,
    ...options
  })
}

export function post(url, data = {}, options = {}) {
  // 确保POST请求有正确的content-type
  const config = {
    headers: {
      'content-type': 'application/json'
    },
    ...options
  }

  // 添加真机环境的fallback
  return api.post(url, data, config).catch(error => {
    console.warn('🔄 axios请求失败，尝试使用uni.request fallback:', error.message)
    return postWithUniRequest(url, data, options)
  })
}

// 使用uni.request的fallback方法
function postWithUniRequest(url, data = {}, options = {}) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.baseURL}${url}`

    // 准备headers
    const headers = {
      'content-type': 'application/json',
      ...options.headers
    }

    // 添加token（如果需要）
    if (options.needAuth !== false) {
      const tokens = getTokens()
      if (tokens?.access_token) {
        headers['Authorization'] = `Bearer ${tokens.access_token}`
      }
    }

    console.log('📱 使用uni.request发送请求:', { url: fullUrl, headers, data })

    // 显示loading
    if (options.showLoading) {
      uni.showLoading({ title: '加载中...', mask: true })
    }

    uni.request({
      url: fullUrl,
      method: 'POST',
      header: headers,
      data: data,
      success: (res) => {
        console.log('✅ uni.request成功响应:', res)

        // 隐藏loading
        if (options.showLoading) {
          uni.hideLoading()
        }

        // 处理响应数据格式
        const response = res.data
        if (response.success !== undefined) {
          // 新格式
          if (response.success) {
            resolve(response)
          } else {
            const error = new Error(response.message || '请求失败')
            if (options.showError !== false) {
              uni.showToast({ title: response.message || '请求失败', icon: 'none' })
            }
            reject(error)
          }
        } else {
          // 老格式
          const { code, data: responseData, message } = response
          if (code === 200 || code === 0) {
            resolve(responseData)
          } else {
            const error = new Error(message || '请求失败')
            if (options.showError !== false) {
              uni.showToast({ title: message || '请求失败', icon: 'none' })
            }
            reject(error)
          }
        }
      },
      fail: (err) => {
        console.error('❌ uni.request也失败了:', err)

        // 隐藏loading
        if (options.showLoading) {
          uni.hideLoading()
        }

        if (options.showError !== false) {
          uni.showToast({ title: '网络请求失败，请检查网络连接', icon: 'none' })
        }

        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

export function put(url, data = {}, options = {}) {
  // 确保PUT请求有正确的content-type
  const config = {
    headers: {
      'content-type': 'application/json'
    },
    ...options
  }
  return api.put(url, data, config)
}

export function del(url, options = {}) {
  return api.delete(url, options)
}

// 测试用原生uni.request发送带token的请求
export function testNativeRequest() {
  const tokens = getTokens()
  if (!tokens?.access_token) {
    return
  }

  const headers = {
    'Authorization': `Bearer ${tokens.access_token}`,
    'content-type': 'application/json'
  }

  uni.request({
    url: `${API_CONFIG.baseURL}/user`,
    method: 'GET',
    header: headers,
    success: (res) => {
      // 静默成功
    },
    fail: (err) => {
      console.error('Native request failed:', err)
    }
  })
}// 导出 axios 实例，便于直接使用
export { API_CONFIG, api as request }
