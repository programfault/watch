/**
 * 客服相关工具函数
 */
import { useConfigStore } from '@/stores'

/**
 * 打开客服聊天
 * @param {Object} options 配置选项
 * @param {string} options.customerServiceId 客服ID，默认从配置获取
 * @param {string} options.url 客服聊天URL，默认从配置获取
 * @param {Function} options.onSuccess 成功回调
 * @param {Function} options.onFail 失败回调
 */
export const openCustomerService = (options = {}) => {
  const configStore = useConfigStore()

  const {
    customerServiceId = configStore.customerServiceId,
    url = configStore.customerServiceUrl,
    onSuccess,
    onFail
  } = options
    console.log("=======================")
    console.log(customerServiceId)
    console.log(url)
    console.log("=======================")
  uni.openCustomerServiceChat({
    extInfo: {
      url: url
    },
    corpId: customerServiceId,
    success: (res) => {
      console.log('客服聊天打开成功:', res)
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(res)
      }
    },
    fail: (err) => {
      console.error('客服聊天打开失败:', err)

      // 默认失败处理
      uni.showModal({
        title: '客服提示',
        content: '无法打开客服聊天，请联系客服微信',
        showCancel: false
      })

      if (onFail && typeof onFail === 'function') {
        onFail(err)
      }
    }
  })
}

/**
 * 显示客服联系方式
 * @param {string} customerServiceId 客服微信ID，默认从配置获取
 */
export const showCustomerServiceInfo = (customerServiceId) => {
  const configStore = useConfigStore()
  const serviceId = customerServiceId || configStore.customerServiceId
  uni.showModal({
    title: '客服联系方式',
    content: `客服微信：${serviceId}\n\n请添加客服微信获取帮助`,
    confirmText: '复制微信号',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        // 复制客服微信号到剪贴板
        uni.setClipboardData({
          data: serviceId,
          success: () => {
            uni.showToast({
              title: '已复制客服微信号',
              icon: 'success'
            })
          }
        })
      }
    }
  })
}

/**
 * 快速联系客服（带图标按钮点击处理）
 * @param {Object} options 配置选项
 */
export const quickContactCustomerService = (options = {}) => {
  // 先尝试打开客服聊天
  openCustomerService({
    ...options,
    onFail: (err) => {
      // 如果打开失败，显示联系方式
      showCustomerServiceInfo(options.customerServiceId)

      // 如果有自定义失败回调，也调用它
      if (options.onFail && typeof options.onFail === 'function') {
        options.onFail(err)
      }
    }
  })
}

export default {
  openCustomerService,
  showCustomerServiceInfo,
  quickContactCustomerService
}
