// 页面loading工具函数

/**
 * 在页面显示时隐藏tab切换loading
 * @param {number} delay 延迟时间，默认100ms
 */
export const hideTabSwitchLoading = (delay = 100) => {
	setTimeout(() => {
		try {
			uni.$emit('hideTabSwitchLoading')
			console.log('✅ Tab切换Loading隐藏事件已发送')
		} catch (error) {
			console.error('❌ 隐藏Tab切换Loading失败:', error)
		}
	}, delay)
}

/**
 * 显示页面加载loading
 * @param {string} pageName 页面名称
 */
export const showPageLoading = (pageName) => {
	try {
		uni.showLoading({
			title: `正在加载${pageName}...`,
			mask: true
		})
	} catch (error) {
		console.error('❌ 显示页面Loading失败:', error)
	}
}

/**
 * 隐藏所有loading
 */
export const hideAllLoading = () => {
	try {
		uni.hideLoading()
	} catch (error) {
		console.error('❌ 隐藏Loading失败:', error)
	}
}
