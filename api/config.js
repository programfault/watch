/**
 * 配置相关API
 */
import { request } from '@/utils/request.js'

/**
 * 获取应用配置信息
 * @returns {Promise} API响应
 */
export const getConfig = () => {
  return request({
    url: '/config',
    method: 'GET'
  })
}

export default {
  getConfig
}
