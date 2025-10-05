/**
 * 页面ID枚举
 * 用于标识不同的内容页面
 */
export const PAGE_IDS = {
  // 保养手册页面
  MAINTENANCE_MANUAL: 1,

  // 可以在这里添加其他页面的ID
  // USER_AGREEMENT: 2,
  // PRIVACY_POLICY: 3,
  // ABOUT_US: 4,
}

/**
 * 页面ID对应的描述信息
 * 方便调试和维护时查看
 */
export const PAGE_DESCRIPTIONS = {
  [PAGE_IDS.MAINTENANCE_MANUAL]: '保养手册',
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