/**
 * 应用相关 API 接口
 * 包括轮播图、品牌等
 */

import { get, post } from '@/utils/request'

/**
 * 获取页面数据（包括轮播图和其他页面）
 * @returns {Promise}
 */
export function getPages() {
  return get('/pages', {}, {
    showLoading: false,
    showError: true
  })
}

/**
 * 获取品牌列表
 * @returns {Promise}
 */
export function getBrands() {
  return get('/brands', {}, {
    showLoading: false,
    showError: true
  })
}

/**
 * 获取表的属性筛选选项
 * @returns {Promise}
 */
export function getFilterOptions() {
  return get('/filter-options', {}, {
    showLoading: false,
    showError: true
  })
}

/**
 * 获取店铺列表
 * @returns {Promise}
 */
export function getStores() {
  return get('/stores', {}, {
    showLoading: false,
    showError: true
  })
}

/**
 * 简单查询手表列表 (GET方式)
 * @param {Object} params - 查询参数 (通过URL参数传递)
 * @param {number} [params.brand_id] - 品牌ID
 * @param {string} [params.keyword] - 搜索关键词
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.per_page=10] - 每页数量
 * @returns {Promise}
 */
export function getWatches(params = {}) {
  return get('/watches', params, {
    showLoading: false,
    showError: true
  })
}

/**
 * 复杂查询手表列表 (POST方式)
 * @param {Object} filters - 筛选条件
 * @param {number} [filters.brand_id] - 品牌ID
 * @param {string} [filters.keyword] - 搜索关键词
 * @param {Array} [filters.attributes] - 属性筛选条件
 * @param {Object} [filters.price_range] - 价格范围
 * @param {string} [filters.sort_by] - 排序字段
 * @param {string} [filters.sort_order] - 排序方向
 * @param {number} [filters.page=1] - 页码
 * @param {number} [filters.per_page=10] - 每页数量
 * @returns {Promise}
 */
export function searchWatches(filters = {}) {
  return post('/watches', filters, {
    showLoading: false,
    showError: true
  })
}

/**
 * 获取用户福利信息（优惠券和特权）
 * @param {Object} params - 查询参数
 * @param {string} [params.type] - 筛选类型 (coupon, privilege)
 * @param {string} [params.status] - 状态筛选 (active, expired)
 * @returns {Promise}
 */
export function getBenefits(params = {}) {
  return get('/benefits', params, {
    showLoading: false,
    showError: true
  })
}

/**
 * 消费者操作接口（赠送或核销）
 * @param {Object} payload - 操作数据
 * @param {string} payload.actionType - 操作类型 ('gift' | 'verify')
 * @param {string} payload.consumerId - 消费者ID
 * @param {number} [payload.points=0] - 积分数量
 * @param {Array<string>} [payload.coupons=[]] - 优惠券ID列表
 * @param {Array<string>} [payload.privileges=[]] - 特权ID列表
 * @returns {Promise}
 */
export function processConsumerAction(payload) {
  return post('/consumers', payload, {
    showLoading: true,
    showError: true
  })
}
