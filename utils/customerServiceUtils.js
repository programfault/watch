/**
 * 客服功能工具类
 * 使用 uni-app API 提供跨平台客服支持
 */

import { useFavoritesStore } from '@/stores/favorites'
import { post } from '@/utils/request'

// 企业客服配置
const CORP_ID = 'ww17da4a406b6bf90b'

/**
 * 获取场景标识
 * 使用最近访问的产品ID作为场景，多条用连字符连接
 * @returns {string} 场景标识
 */
const getSceneIdentifier = () => {
    try {
        const favoritesStore = useFavoritesStore()
        const recentlyViewed = favoritesStore.getRecentlyViewed()

        if (recentlyViewed && recentlyViewed.length > 0) {
            const ids = recentlyViewed.map(item => item.id).join('-')
            console.log('📍 使用最近浏览的产品作为场景:', ids)
            return ids
        }
    } catch (error) {
        console.warn('⚠️ 获取最近浏览产品失败:', error)
    }

    return ''
}

/**
 * 从服务器获取客服链接
 * @param {string} scene - 场景标识
 * @returns {Promise<string>} 返回客服 URL
 */
const fetchCustomerServiceUrl = async (scene = '') => {
    console.log('🔗 正在获取客服链接...', `场景: ${scene}`)

    const result = await post('/link', { scene }, {
        needAuth: false,
        showError: false
    })

    if (result?.url) {
        console.log('✅ 客服链接获取成功')
        return result.url
    }

    throw new Error('无效的响应数据')
}

/**
 * 打开客服聊天窗口
 * @param {Object} options - 配置选项
 * @param {string} options.scene - 场景标识（可选，默认为最近浏览的产品ID）
 * @param {string} options.corpId - 企业ID（可选）
 * @returns {Promise<void>}
 */
export const openCustomerService = async (options = {}) => {
    const { scene = getSceneIdentifier(), corpId = CORP_ID, sendProductCard = true, product = null } = options

    console.log('📞 打开微信客服...', { scene })

    try {
        // 获取动态客服 URL
        const kfServiceUrl = await fetchCustomerServiceUrl(scene)

        // 打开客服会话
        const api = uni.openCustomerServiceChat || wx?.openCustomerServiceChat

        if (!api) {
            console.warn('⚠️ 当前环境不支持客服功能')
            uni.showToast({ title: '客服功能仅在小程序中可用', icon: 'none' })
            return
        }
        const chatConfig = {
            extInfo: { url: kfServiceUrl },
            corpId,
            success: (res) => {
                console.log('✅ 客服打开成功', res)
            },
            fail: (error) => {
                console.error('❌ 客服打开失败:', error)
                uni.showToast({ title: '打开客服失败，请稍后重试', icon: 'none' })
            }
        }
        if (sendProductCard && product) {
            chatConfig.showMessageCard = true
            chatConfig.sendMessageTitle = 'productTitle'
            chatConfig.sendMessageImg = 'productImage'
            chatConfig.showMessageCard = true
        }
        api(chatConfig)
    } catch (error) {
        console.error('❌ 打开客服异常:', error)
        uni.showToast({ title: '无法打开客服，请稍后重试', icon: 'none' })
    }
}
