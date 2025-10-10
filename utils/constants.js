/**
 * 页面ID枚举
 * 用于标识不同的内容页面
 */
export const PAGE_IDS = {
  // 保养手册页面
  MAINTENANCE_MANUAL: 1,

  // 招聘页面
  RECRUITMENT: 2,

  // 可以在这里添加其他页面的ID
  // USER_AGREEMENT: 3,
  // PRIVACY_POLICY: 4,
  // ABOUT_US: 5,
}

/**
 * 页面ID对应的描述信息
 * 方便调试和维护时查看
 */
export const PAGE_DESCRIPTIONS = {
  [PAGE_IDS.MAINTENANCE_MANUAL]: '保养手册',
  [PAGE_IDS.RECRUITMENT]: '招聘信息',
  // [PAGE_IDS.USER_AGREEMENT]: '用户协议',
  // [PAGE_IDS.PRIVACY_POLICY]: '隐私政策',
  // [PAGE_IDS.ABOUT_US]: '关于我们',
}

/**
 * 获取页面描述
 * @param {number} pageId 页面ID
 * @returns {string} 页面描述
 */
export const getPageDescription = (pageId) => {
  return PAGE_DESCRIPTIONS[pageId] || `未知页面(ID: ${pageId})`
}

/**
 * 客服相关常量
 */
export const CUSTOMER_SERVICE = {
  // 企业微信客服URL基础路径
  BASE_URL: 'https://work.weixin.qq.com/kfid/',

  // 默认配置（作为回退方案）
  DEFAULT_CONFIG: {
    CUSTOMER_SERVICE_ID: 'ww17da4a406b6bf90b',
    KF_ID: 'kfc222a4433ef7716d7'
  }
}
