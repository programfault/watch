/**
 * 客服相关工具函数
 */
import { useConfigStore } from '@/stores'

/**
 * 打开客服聊天
 * @param {Object} options 配置选项
 * @param {string} options.customerServiceId 客服ID，默认从配置获取
 * @param {string} options.url 客服聊天URL，默认从配置获取
 * @param {Object} options.extInfo 额外信息，可传递给客服
 * @param {boolean} options.showMessageCard 是否显示会话内消息卡片
 * @param {string} options.sendMessageTitle 会话内消息卡片标题
 * @param {string} options.sendMessagePath 会话内消息卡片跳转路径
 * @param {string} options.sendMessageImg 会话内消息卡片图片
 * @param {Object} options.userInfo 用户信息（可传递给客服）
 * @param {Function} options.onSuccess 成功回调
 * @param {Function} options.onFail 失败回调
 */
export const openCustomerService = (options = {}) => {
  const configStore = useConfigStore()

  const {
    customerServiceId = configStore.customerServiceId,
    url = configStore.customerServiceUrl,
    extInfo = {},
    showMessageCard = false,
    sendMessageTitle,
    sendMessagePath,
    sendMessageImg,
    userInfo,
    onSuccess,
    onFail
  } = options

  console.log("=======================")
  console.log('客服ID:', customerServiceId)
  console.log('URL:', url)
  console.log('传递给客服的信息:', { extInfo, userInfo, showMessageCard })
  console.log("=======================")

  // 构建传递给客服的额外信息
  const customerServiceExtInfo = {
    url: url,
    ...extInfo
  }

  // 如果有用户信息，添加到extInfo中
  if (userInfo) {
    customerServiceExtInfo.userInfo = userInfo
  }

  // 构建API参数
  const apiParams = {
    extInfo: customerServiceExtInfo,
    corpId: customerServiceId,
  }

  // 如果需要显示消息卡片，添加相关参数
  if (showMessageCard) {
    apiParams.showMessageCard = true
    if (sendMessageTitle) apiParams.sendMessageTitle = sendMessageTitle
    if (sendMessagePath) apiParams.sendMessagePath = sendMessagePath
    if (sendMessageImg) apiParams.sendMessageImg = sendMessageImg
  }

  uni.openCustomerServiceChat({
    ...apiParams,
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
 * @param {Object} options.userInfo 用户信息（会传递给客服）
 * @param {Object} options.extInfo 额外信息（会传递给客服）
 * @param {string} options.sendMessageTitle 消息卡片标题
 * @param {boolean} options.showMessageCard 是否显示消息卡片
 * @example
 * // 传递用户信息给客服
 * quickContactCustomerService({
 *   userInfo: { userId: '123', userName: '张三', phone: '138xxxx' },
 *   extInfo: { fromPage: 'productDetail', productId: 'P001' },
 *   sendMessageTitle: '用户咨询产品详情'
 * })
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
