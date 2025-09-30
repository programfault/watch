/**
 * 应用相关 API 接口
 * 包括轮播图等
 */

import { get } from '@/utils/request'

/**
 * 获取轮播图列表
 * @returns {Promise}
 */
export function getCarousel() {
  return get('/carousel', {}, {
    showLoading: false,
    showError: true
  })
}




