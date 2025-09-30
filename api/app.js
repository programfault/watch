/**
 * 应用相关 API 接口
 * 包括轮播图、品牌等
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


