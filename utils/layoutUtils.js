/**
 * 布局工具类 - 处理不同设备的布局适配
 */

/**
 * 获取设备窗口信息
 * @returns {Object} 设备信息对象
 */
export function getDeviceInfo() {
  try {
    // 直接使用 uni.getWindowInfo()，这是推荐的现代API
    const windowInfo = uni.getWindowInfo();
    console.log('✅ 获取设备窗口信息成功:', windowInfo);

    return {
      statusBarHeight: windowInfo.statusBarHeight || 44, // 默认值改为更常见的44px
      screenWidth: windowInfo.screenWidth || 375,
      screenHeight: windowInfo.screenHeight || 667,
      windowWidth: windowInfo.windowWidth || windowInfo.screenWidth || 375,
      windowHeight: windowInfo.windowHeight || windowInfo.screenHeight || 667,
      platform: windowInfo.platform || 'unknown',
      safeArea: windowInfo.safeArea || {},
      safeAreaInsets: windowInfo.safeAreaInsets || {}
    };
  } catch (error) {
    console.error('❌ 获取设备信息失败:', error);
    // 返回默认值
    return {
      statusBarHeight: 44, // 统一使用44px作为默认值
      screenWidth: 375,
      screenHeight: 667,
      windowWidth: 375,
      windowHeight: 667,
      platform: 'unknown',
      safeArea: {},
      safeAreaInsets: {}
    };
  }
}

/**
 * 计算navbar相关尺寸
 * @param {Object} deviceInfo 设备信息
 * @returns {Object} navbar尺寸信息
 */
export function calculateNavbarDimensions(deviceInfo) {
  const navbarHeight = 44; // navbar固定高度
  const statusBarHeight = deviceInfo.statusBarHeight;

  // up-navbar组件的safe-area-inset-top="true"工作原理：
  // 1. navbar会占据状态栏空间，但内容会自动下移
  // 2. navbar的实际高度还是44px，但总占用空间是statusBarHeight + navbarHeight
  // 3. navbarBottomPosition就是状态栏高度 + navbar高度
  const totalNavbarHeight = statusBarHeight + navbarHeight;

  return {
    navbarHeight,
    statusBarHeight,
    totalNavbarHeight,
    navbarBottomPosition: totalNavbarHeight // 54 + 44 = 98px
  };
}/**
 * 计算搜索框布局信息
 * @param {Object} navbarDims navbar尺寸信息
 * @param {Object} options 配置选项
 * @returns {Object} 搜索框布局信息
 */
export function calculateSearchLayout(navbarDims, options = {}) {
  const {
    searchHeight = 44,
    searchMargin = 0,   // 搜索框上下边距
    sideGap = '4%'      // 左右边距
  } = options;

  // 修正：page-content已经基于navbar，搜索框相对于page-content顶部计算
  const searchTopInPageContent = searchMargin; // 相对于page-content的top位置
  const searchBottomInPageContent = searchTopInPageContent + searchHeight;

  return {
    searchHeight,
    searchTop: searchTopInPageContent,  // 相对于page-content的位置
    sideGap,
    searchMargin,
    totalSearchAreaHeight: searchHeight + (2 * searchMargin),
    contentStartPosition: searchBottomInPageContent + searchMargin // 内容开始位置
  };
}

/**
 * 计算完整的页面布局信息
 * @param {Object} options 配置选项
 * @returns {Object} 完整布局信息
 */
export function calculatePageLayout(options = {}) {
  const deviceInfo = getDeviceInfo();
  console.log('📱 设备信息:', deviceInfo);

  const navbarDims = calculateNavbarDimensions(deviceInfo);
  console.log('📏 Navbar尺寸:', navbarDims);

  const searchLayout = calculateSearchLayout(navbarDims, options);
  console.log('🔍 搜索框布局:', searchLayout);

  const tabbarHeight = 70; // tabbar高度
  const safeAreaBottom = deviceInfo.safeAreaInsets.bottom || 0;

  // 如果tabBar组件已经处理了safeArea，那么实际占据的高度就是tabbarHeight + safeAreaBottom
  // 但在计算可用高度时，我们需要减去tabBar的总占用空间
  const tabBarTotalHeight = tabbarHeight;

  const result = {
    device: deviceInfo,
    navbar: navbarDims,
    search: searchLayout,
    tabbar: {
      height: tabbarHeight,
      safeAreaBottom,
      totalHeight: tabBarTotalHeight
    },
    content: {
      startPosition: searchLayout.contentStartPosition,
      // 可用高度 = 窗口高度 - 内容开始位置 - tabBar总高度
      availableHeight: deviceInfo.windowHeight - searchLayout.contentStartPosition - tabBarTotalHeight
      },
    navbarTotalHeight: navbarDims.totalNavbarHeight,
    searchHeight: searchLayout.searchHeight,
  };

  console.log('📊 完整布局计算结果:', {
    windowHeight: deviceInfo.windowHeight,
    statusBarHeight: deviceInfo.statusBarHeight,
    navbarTotalHeight: navbarDims.totalNavbarHeight,
    navbarBottomPosition: navbarDims.navbarBottomPosition,
    searchTop: searchLayout.searchTop,
    searchHeight: searchLayout.searchHeight,
    searchBottom: searchLayout.searchTop + searchLayout.searchHeight,
    contentStartPosition: searchLayout.contentStartPosition,
    tabBarTotalHeight: tabBarTotalHeight,
    availableHeight: result.content.availableHeight
  });

  return result;
}

/**
 * 生成搜索框的动态样式对象
 * @param {Object} layoutInfo 布局信息
 * @returns {Object} Vue样式对象
 */
export function generateSearchContainerStyle(layoutInfo) {
  // 搜索框需要全局固定定位，top值 = navbar底部位置 + 搜索框边距
  const searchTopGlobal = layoutInfo.navbar.navbarBottomPosition + layoutInfo.search.searchMargin;

  return {
    position: 'fixed', // 保持全局固定定位
    top: `${searchTopGlobal}px`,
    left: '0',
    right: '0',
    height: `${layoutInfo.search.searchHeight}px`,
    padding: `0 ${layoutInfo.search.sideGap}`,
    backgroundColor: '#f8f8f8',
    zIndex: 10,
    boxSizing: 'border-box'
  };
}

/**
 * 生成内容区域的动态样式对象
 * @param {Object} layoutInfo 布局信息
 * @returns {Object} Vue样式对象
 */
export function generateContentStyle(layoutInfo) {
  return {
    marginTop: `${layoutInfo.content.startPosition}px`,
    minHeight: `${layoutInfo.content.availableHeight}px`,
    paddingBottom: `calc(100px + ${layoutInfo.tabbar.safeAreaBottom}px)`
  };
}

/**
 * 计算安全区域底部高度
 * 统一的安全区域计算逻辑，供 TabBar 和其他组件使用
 * @param {Object} deviceInfo 设备信息对象，如果不传则自动获取
 * @returns {number} 安全区域底部高度(px)
 */
export function getSafeAreaBottom(deviceInfo = null) {
  try {
    // 如果没有传入设备信息，则获取
    const device = deviceInfo || getDeviceInfo();

    // iOS 设备使用 safeAreaInsets（推荐方式）
    if (device.platform === 'ios' && device.safeAreaInsets) {
      return device.safeAreaInsets.bottom || 0;
    }
    // 兼容旧版本，使用 safeArea 计算
    else if (device.safeArea) {
      const screenHeight = device.screenHeight || device.windowHeight || 0;
      const safeAreaBottom = device.safeArea.bottom || screenHeight;
      return Math.max(0, screenHeight - safeAreaBottom);
    }
    // 其他情况返回0
    else {
      return 0;
    }
  } catch (error) {
    console.warn('获取安全区域高度失败，使用默认值:', error);
    return 0;
  }
}

/**
 * 响应式边距计算
 * @param {number} screenWidth 屏幕宽度
 * @returns {string} 边距值
 */
export function getResponsiveMargin(screenWidth) {
  if (screenWidth <= 375) {
    return '3%'; // 小屏幕
  } else if (screenWidth >= 768) {
    return '8%'; // 大屏幕
  } else {
    return '4%'; // 标准屏幕
  }
}

// 默认导出所有函数
export default {
  getDeviceInfo,
  calculateNavbarDimensions,
  calculateSearchLayout,
  calculatePageLayout,
  generateSearchContainerStyle,
  generateContentStyle,
  getResponsiveMargin,
  getSafeAreaBottom
};
