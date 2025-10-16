/**
 * 初始化相关API
 */
import { request } from '@/utils/request.js'

/**
 * 获取小程序初始化数据
 * 包含页面、品牌、筛选选项、店铺等所有初始化需要的数据
 * @returns {Promise} API响应
 */
export const getInitData = () => {
  return request({
    url: '/init',
    method: 'GET',
    needAuth: false, // 初始化数据不需要认证
    showLoading: false, // 不显示loading，由页面自己控制
    showError: true
  })
}

export default {
  getInitData
}