/**
 * 用户相关 API 接口
 * 包括用户信息、登录、客户管理等
 */

import { get, post, put } from '@/utils/request'

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return get('/user/info', {}, {
    showLoading: false,
    showError: true
  })
}

/**
 * 用户登录
 * @param {Object} loginData 登录数据
 * @param {string} loginData.code 微信登录code
 * @returns {Promise}
 */
export function login(loginData) {
  return post('/auth/login', loginData, {
    showLoading: true,
    showError: true
  })
}

/**
 * 获取客户列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getCustomers(params = {}) {
  return get('/customers', params, {
    showLoading: false,
    showError: true
  })
}

/**
 * 添加客户
 * @param {Object} customerData 客户数据
 * @returns {Promise}
 */
export function addCustomer(customerData) {
  return post('/customers', customerData, {
    showLoading: true,
    showError: true
  })
}

/**
 * 更新客户信息
 * @param {number|string} id 客户ID
 * @param {Object} customerData 客户数据
 * @returns {Promise}
 */
export function updateCustomer(id, customerData) {
  return put(`/customers/${id}`, customerData, {
    showLoading: true,
    showError: true
  })
}

/**
 * 获取消费者列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getConsumers(params = {}) {
  console.log('发送消费者API请求，参数:', params)
  return get('/consumers', params, {
    showLoading: false,
    showError: true
  }).then(response => {
    console.log('消费者API响应:', response)
    return response
  }).catch(error => {
    console.error('消费者API请求失败:', error)
    throw error
  })
}
