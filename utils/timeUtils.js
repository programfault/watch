/**
 * 时间工具函数
 * 提供各种时间格式化功能
 */

/**
 * 获取当前时间的ISO字符串（精确到分钟）
 * @returns {string} ISO格式的时间字符串，精确到分钟
 */
export const getCurrentTimeToMinute = () => {
	const now = new Date()
	// 将秒和毫秒设为0，只保留到分钟
	now.setSeconds(0, 0)
	return now.toISOString()
}

/**
 * 获取当前时间戳（精确到分钟）
 * @returns {number} 时间戳，精确到分钟
 */
export const getCurrentTimestampToMinute = () => {
	const now = new Date()
	// 将秒和毫秒设为0，只保留到分钟
	now.setSeconds(0, 0)
	return now.getTime()
}

/**
 * 格式化时间为本地显示格式（精确到分钟）
 * @param {string|Date} time - 时间字符串或Date对象
 * @returns {string} 格式化后的时间字符串
 */
export const formatTimeToMinute = (time) => {
	const date = typeof time === 'string' ? new Date(time) : time
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')

	return `${year}-${month}-${day} ${hour}:${minute}`
}

/**
 * 获取相对时间描述（如：刚刚访问、5分钟前访问等）
 * @param {string|Date} time - 时间字符串或Date对象
 * @returns {string} 相对时间描述
 */
export const getRelativeTime = (time) => {
	const date = typeof time === 'string' ? new Date(time) : time
	const now = new Date()
	const diff = now.getTime() - date.getTime()

	// 小于1分钟
	if (diff < 60000) {
		return '刚刚访问'
	}

	// 小于1小时，显示分钟
	if (diff < 3600000) {
		const minutes = Math.floor(diff / 60000)
		return `${minutes}分钟前访问`
	}

	// 小于24小时，显示小时
	if (diff < 86400000) {
		const hours = Math.floor(diff / 3600000)
		return `${hours}小时前访问`
	}

	// 小于7天，显示天数
	if (diff < 604800000) {
		const days = Math.floor(diff / 86400000)
		return `${days}天前访问`
	}

	// 超过7天，显示具体日期
	return formatTimeToMinute(date)
}
