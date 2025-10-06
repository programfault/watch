/**
 * 浏览记录通用工具函数
 * 提供统一的浏览记录获取、格式化和处理功能
 */

import { getRelativeTime } from './timeUtils.js'

/**
 * 从本地存储直接获取浏览记录
 * @param {number} limit - 获取记录的数量限制，默认5条
 * @returns {Array} 浏览记录数组
 */
export const getBrowsingHistoryFromStorage = (limit = 5) => {
	try {
		const stored = uni.getStorageSync('browsing_history')
		if (stored && Array.isArray(stored)) {
			return stored.slice(0, limit)
		}
		return []
	} catch (error) {
		console.error('获取浏览记录失败:', error)
		return []
	}
}

/**
 * 使用Pinia store获取浏览记录（推荐方式）
 * @param {number} limit - 获取记录的数量限制，默认5条
 * @returns {Array} 浏览记录数组
 */
export const getBrowsingHistoryFromStore = (limit = 5) => {
	// 优先使用本地存储，这样更稳定且不依赖store
	return getBrowsingHistoryFromStorage(limit)
}

/**
 * 格式化浏览记录的时间显示
 * @param {string} timeStr - ISO时间字符串
 * @returns {string} 格式化后的时间文本
 */
export const formatBrowsingTime = (timeStr) => {
	if (!timeStr) return ''
	return getRelativeTime(timeStr)
}

/**
 * 格式化浏览记录的价格显示
 * @param {number} price - 价格数值
 * @returns {string} 格式化后的价格文本
 */
export const formatBrowsingPrice = (price) => {
	if (!price || price === 0) return '价格面议'
	return `¥${Number(price).toLocaleString('zh-CN', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	})}`
}

/**
 * 获取格式化的浏览记录列表
 * @param {number} limit - 获取记录的数量限制，默认5条
 * @param {boolean} useStore - 是否使用store获取，默认true
 * @returns {Array} 格式化后的浏览记录数组
 */
export const getFormattedBrowsingHistory = (limit = 5, useStore = false) => {
	const rawHistory = useStore
		? getBrowsingHistoryFromStore(limit)
		: getBrowsingHistoryFromStorage(limit)

	return rawHistory.map(item => ({
		...item,
		formattedTime: formatBrowsingTime(item.viewedAt),
		formattedPrice: formatBrowsingPrice(item.price),
		displayImage: item.image || '/static/logo.png'
	}))
}

/**
 * 根据产品ID查找浏览记录
 * @param {string|number} productId - 产品ID
 * @param {boolean} useStore - 是否使用store获取，默认true
 * @returns {Object|null} 找到的浏览记录项或null
 */
export const findBrowsingHistoryById = (productId, useStore = false) => {
	const history = useStore
		? getBrowsingHistoryFromStore()
		: getBrowsingHistoryFromStorage()

	return history.find(item => item.id === productId) || null
}

/**
 * 检查产品是否在浏览记录中
 * @param {string|number} productId - 产品ID
 * @param {boolean} useStore - 是否使用store获取，默认true
 * @returns {boolean} 是否存在于浏览记录中
 */
export const isInBrowsingHistory = (productId, useStore = false) => {
	return findBrowsingHistoryById(productId, useStore) !== null
}

/**
 * 获取浏览记录统计信息
 * @param {boolean} useStore - 是否使用store获取，默认true
 * @returns {Object} 统计信息对象
 */
export const getBrowsingHistoryStats = (useStore = false) => {
	const history = useStore
		? getBrowsingHistoryFromStore()
		: getBrowsingHistoryFromStorage()

	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

	const todayCount = history.filter(item =>
		new Date(item.viewedAt) >= today
	).length

	const yesterdayCount = history.filter(item => {
		const viewDate = new Date(item.viewedAt)
		return viewDate >= yesterday && viewDate < today
	}).length

	return {
		total: history.length,
		todayCount,
		yesterdayCount,
		hasHistory: history.length > 0,
		latestViewTime: history.length > 0 ? history[0].viewedAt : null
	}
}

/**
 * 清空浏览记录（直接操作存储）
 * 注意：此方法会绕过store，建议在store不可用时使用
 * @returns {boolean} 操作是否成功
 */
export const clearBrowsingHistoryFromStorage = () => {
	try {
		uni.setStorageSync('browsing_history', [])
		console.log('浏览记录已清空')
		return true
	} catch (error) {
		console.error('清空浏览记录失败:', error)
		return false
	}
}

/**
 * 获取浏览记录的产品ID列表
 * @param {number} limit - 获取记录的数量限制，默认5条
 * @param {boolean} useStore - 是否使用store获取，默认true
 * @returns {Array} 产品ID数组
 */
export const getBrowsingHistoryIds = (limit = 5, useStore = false) => {
	const history = useStore
		? getBrowsingHistoryFromStore(limit)
		: getBrowsingHistoryFromStorage(limit)

	return history.map(item => item.id)
}
