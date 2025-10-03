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
  console.log('🔍 调用getUserInfo API: /user')
  return get('/user', {}, {
    showLoading: false,
    showError: true
  }).then(response => {
    console.log('🔍 getUserInfo API 成功响应:', response)
    return response
  }).catch(error => {
    console.log('🔍 getUserInfo API 失败:', error)
    throw error
  })
}

/**
 * 微信小程序登录
 * @param {Object} loginData 登录数据
 * @param {string} loginData.code 微信登录code
 * @returns {Promise}
 */
export function login(loginData) {
  return post('/login', loginData, {
    showLoading: true,
    showError: true
  })
}

/**
 * 刷新 token
 * @param {Object} refreshData 刷新数据
 * @param {string} refreshData.refresh_token 刷新token
 * @returns {Promise}
 */
export function refreshToken(refreshData) {
  return post('/refresh', refreshData, {
    showLoading: false,
    showError: false
  })
}

/**
 * 发送手机号加密数据给后端解密
 * @param {Object} phoneData 手机号加密数据
 * @param {string} phoneData.encryptedData 微信加密的手机号数据
 * @param {string} phoneData.iv 解密用的初始向量
 * @param {string} phoneData.code 登录code（后端用于获取session_key）
 * @returns {Promise} 返回解密后的手机号
 */
export function decryptPhoneNumber(phoneData) {
  return post('/decrypt-phone', phoneData, {
    showLoading: false,
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
