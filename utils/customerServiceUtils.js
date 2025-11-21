/**
 * 客服功能工具类
 * 使用 uni-app API 提供跨平台客服支持
 */

import { useFavoritesStore } from '@/stores/favorites'

const MINI_LINK_API = 'https://www.timepalace.cn/api/mini/link'
const CORP_ID = 'ww17da4a406b6bf90b'

/**
 * 获取场景标识
 * 优先使用最近访问的产品标题作为场景，如果没有则使用默认值
 * @returns {string} 场景标识
 */
const getSceneIdentifier = () => {
  try {
    const favoritesStore = useFavoritesStore()
    const recentlyViewed = favoritesStore.getRecentlyViewed(1)

    if (recentlyViewed && recentlyViewed.length > 0) {
      const title = recentlyViewed[0].title
      console.log('📍 使用最近浏览的产品作为场景:', title)
      return title
    }
  } catch (error) {
    console.warn('⚠️ 获取最近浏览产品失败:', error)
  }

  // 如果获取失败，使用默认场景
  return ''
}

/**
 * 从服务器获取客服链接
 * @param {string} scene - 场景标识
 * @returns {Promise<string>} 返回客服 URL
 */
const fetchCustomerServiceUrl = async (scene = '') => {
  try {
    console.log('🔗 正在获取客服链接...', `场景: ${scene}`)
    const response = await uni.request({
      url: MINI_LINK_API,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        scene: scene
      }
    })

    if (response.statusCode === 200) {
      const data = response.data
      if (data && data.data && data.data.url) {
        console.log('✅ 客服链接获取成功')
        return data.data.url
      } else {
        console.warn('⚠️ 响应数据格式异常:', data)
        throw new Error('无效的响应数据')
      }
    } else {
      throw new Error(`API 请求失败: ${response.statusCode}`)
    }
  } catch (error) {
    console.error('❌ 获取客服链接失败:', error)
    throw error
  }
}

/**
 * 打开客服聊天窗口
 * 使用 uni-app 提供的 API，确保在不同环境中的兼容性
 * 先从服务器获取动态的客服 URL，然后打开客服
 * @param {Object} options - 配置选项
 * @param {string} options.scene - 场景标识（可选，默认为最近浏览的产品标题）
 * @param {string} options.corpId - 企业ID（可选，默认值为配置的企业 ID）
 * @returns {Promise<void>}
 */
export const openCustomerService = async (options = {}) => {
  const {
    scene = getSceneIdentifier(),
    corpId = CORP_ID
  } = options

  console.log('📞 打开微信客服...')

  try {
    // 检查是否在微信小程序环境中
    if (typeof wx === 'undefined' && typeof uni === 'undefined') {
      console.warn('⚠️ 当前不在小程序环境中，无法打开客服')
      uni.showToast({
        title: '客服功能仅在小程序中可用',
        icon: 'none'
      })
      return
    }

    // 第一步：获取动态的客服 URL
    let kfServiceUrl
    try {
      kfServiceUrl = await fetchCustomerServiceUrl(scene)
    } catch (error) {
      console.error('❌ 获取客服链接失败:', error)
      uni.showToast({
        title: '无法获取客服链接，请稍后重试',
        icon: 'none'
      })
      return
    }

    // 第二步：使用获取到的 URL 打开客服
    // 优先使用 uni-app API
    if (typeof uni !== 'undefined' && uni.openCustomerServiceChat) {
      // 使用 uni-app 的 openCustomerServiceChat API
      uni.openCustomerServiceChat({
        extInfo: {
          url: kfServiceUrl
        },
        corpId: corpId,
        success: (res) => {
          console.log('✅ 客服打开成功', res)
          uni.showToast({
            title: '客服已打开',
            icon: 'success',
            duration: 1500
          })
        },
        fail: (error) => {
          console.error('❌ 客服打开失败:', error)
          uni.showToast({
            title: '打开客服失败，请稍后重试',
            icon: 'none'
          })
        },
        complete: () => {
          console.log('客服接口调用完成')
        }
      })
    } else if (typeof wx !== 'undefined' && wx.openCustomerServiceChat) {
      // 降级方案：使用原生微信 API
      wx.openCustomerServiceChat({
        extInfo: {
          url: kfServiceUrl
        },
        corpId: corpId,
        success: (res) => {
          console.log('✅ 客服打开成功', res)
          uni.showToast({
            title: '客服已打开',
            icon: 'success',
            duration: 1500
          })
        },
        fail: (error) => {
          console.error('❌ 客服打开失败:', error)
          uni.showToast({
            title: '打开客服失败，请稍后重试',
            icon: 'none'
          })
        },
        complete: () => {
          console.log('客服接口调用完成')
        }
      })
    } else {
      console.warn('⚠️ 当前环境不支持客服功能')
      uni.showToast({
        title: '当前环境不支持客服功能',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('❌ 打开客服异常:', error)
    uni.showToast({
      title: '打开客服异常，请稍后重试',
      icon: 'none'
    })
  }
}
