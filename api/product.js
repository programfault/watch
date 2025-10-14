/**
 * 产品相关 API 接口
 * 包括产品列表、详情、分类等
 */

import { get, post } from '@/utils/request'

/**
 * 获取产品列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.category 分类
 * @param {string} params.keyword 搜索关键词
 * @returns {Promise}
 */
export function getProducts(params = {}) {
  return get('/products', params, {
    showLoading: false,
    showError: true
  })
}

/**
 * 获取产品详情
 * @param {number|string} id 产品ID
 * @returns {Promise}
 */
export function getProductDetail(id) {
  return get(`/products/${id}`, {}, {
    showLoading: true,
    showError: true
  })
}

/**
 * 获取产品分类
 * @returns {Promise}
 */
export function getProductCategories() {
  return get('/categories', {}, {
    showLoading: false,
    showError: true
  })
}

/**
 * 搜索产品
 * @param {Object} searchData 搜索参数
 * @param {string} searchData.keyword 关键词
 * @param {string} searchData.type 搜索类型
 * @returns {Promise}
 */
export function searchProducts(searchData) {
  return post('/search', searchData, {
    showLoading: false,
    showError: true
  })
}

/**
 * 记录手表浏览行为
 * @param {number|string} watchId 手表ID
 * @returns {Promise}
 */
export function recordWatchView(watchId) {
  return post('/watch/view', {
    watch_id: watchId
  }, {
    showLoading: false,  // 不显示加载状态
    showError: false     // 不显示错误信息，浏览记录失败不影响用户体验
  })
}
