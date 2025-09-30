/**
 * HTTP 请求封装工具
 * 统一处理 API 请求，包括错误处理、loading 状态等
 */

// API 基础配置
const API_CONFIG = {
  baseURL: 'http://localhost:8000/api/mini',
  timeout: 10000,
  // 可以根据环境变量切换
  // baseURL: process.env.NODE_ENV === 'production' ? 'https://api.yoursite.com/api/mini' : 'http://localhost:8000/api/mini'
}

/**
 * 统一的请求方法
 * @param {Object} options 请求配置
 * @param {string} options.url API 路径 (不包含基础路径)
 * @param {string} options.method 请求方法 GET|POST|PUT|DELETE
 * @param {Object} options.data 请求数据
 * @param {Object} options.header 请求头
 * @param {boolean} options.showLoading 是否显示加载提示
 * @param {boolean} options.showError 是否显示错误提示
 * @returns {Promise}
 */
export function request(options = {}) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoading = false,
    showError = true
  } = options

  // 显示加载提示
  if (showLoading) {
    uni.showLoading({
      title: '加载中...',
      mask: true
    })
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_CONFIG.baseURL}${url}`,
      method,
      data,
      timeout: API_CONFIG.timeout,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        // 隐藏加载提示
        if (showLoading) {
          uni.hideLoading()
        }

        // 根据业务需要调整状态码判断
        if (res.statusCode === 200) {
          // 假设后端返回的数据结构为 { code, data, message }
          const { code, data, message } = res.data

          if (code === 200 || code === 0) {
            resolve(data)
          } else {
            // 业务错误
            const error = new Error(message || '请求失败')
            error.code = code

            if (showError) {
              uni.showToast({
                title: message || '请求失败',
                icon: 'none'
              })
            }

            reject(error)
          }
        } else {
          // HTTP 错误
          const error = new Error(`HTTP ${res.statusCode}`)
          error.statusCode = res.statusCode

          if (showError) {
            uni.showToast({
              title: `请求失败 (${res.statusCode})`,
              icon: 'none'
            })
          }

          reject(error)
        }
      },
      fail: (error) => {
        // 隐藏加载提示
        if (showLoading) {
          uni.hideLoading()
        }

        console.error('Request failed:', error)

        if (showError) {
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
        }

        reject(error)
      }
    })
  })
}

/**
 * GET 请求
 * @param {string} url API 路径
 * @param {Object} params 查询参数
 * @param {Object} options 其他选项
 */
export function get(url, params = {}, options = {}) {
  // 将参数拼接到 URL 中
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')

  const fullUrl = queryString ? `${url}?${queryString}` : url

  return request({
    url: fullUrl,
    method: 'GET',
    ...options
  })
}

/**
 * POST 请求
 * @param {string} url API 路径
 * @param {Object} data 请求数据
 * @param {Object} options 其他选项
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 * @param {string} url API 路径
 * @param {Object} data 请求数据
 * @param {Object} options 其他选项
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 * @param {string} url API 路径
 * @param {Object} options 其他选项
 */
export function del(url, options = {}) {
  return request({
    url,
    method: 'DELETE',
    ...options
  })
}

// 导出配置，方便其他地方使用
export { API_CONFIG }
