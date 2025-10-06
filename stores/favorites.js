import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * 收藏和浏览记录管理 Store
 * 功能：
 * 1. 收藏功能：添加/移除收藏，持久化存储
 * 2. 浏览记录：自动记录最近5条浏览记录，持久化存储
 */
export const useFavoritesStore = defineStore('favorites', () => {
	// ==================== 收藏功能 ====================

	// 收藏列表
	const favorites = ref([])

	// 从本地存储加载收藏列表
	const loadFavorites = () => {
		try {
			const stored = uni.getStorageSync('favorites')
			if (stored && Array.isArray(stored)) {
				favorites.value = stored
			}
		} catch (error) {
			console.error('加载收藏列表失败:', error)
			favorites.value = []
		}
	}

	// 保存收藏列表到本地存储
	const saveFavorites = () => {
		try {
			uni.setStorageSync('favorites', favorites.value)
		} catch (error) {
			console.error('保存收藏列表失败:', error)
		}
	}

	// 添加到收藏
	const addToFavorites = (product) => {
		if (!product || !product.id) {
			console.error('无效的产品数据')
			return false
		}

		// 检查是否已经收藏
		if (isFavorited(product.id)) {
			console.log('产品已在收藏列表中')
			return false
		}

		// 创建收藏项
		const favoriteItem = {
			id: product.id,
			title: product.title || product.name,
			model: product.model,
			price: product.price,
			image: product.images && product.images.length > 0
				? (product.images[0].image_url || product.images[0].url || '')
				: '',
			addedAt: new Date().toISOString()
		}

		// 调试输出
		console.log('收藏产品数据:', product)
		console.log('创建的收藏项:', favoriteItem)
		console.log('图片数据:', product.images)
		console.log('提取的图片URL:', favoriteItem.image)

		// 添加到收藏列表开头
		favorites.value.unshift(favoriteItem)

		// 保存到本地存储
		saveFavorites()

		uni.showToast({
			title: '已添加到收藏',
			icon: 'success',
			duration: 1500
		})

		return true
	}

	// 从收藏中移除
	const removeFromFavorites = (productId) => {
		const index = favorites.value.findIndex(item => item.id === productId)
		if (index > -1) {
			favorites.value.splice(index, 1)
			saveFavorites()

			uni.showToast({
				title: '已取消收藏',
				icon: 'success',
				duration: 1500
			})

			return true
		}
		return false
	}

	// 切换收藏状态
	const toggleFavorite = (product) => {
		if (isFavorited(product.id)) {
			return removeFromFavorites(product.id)
		} else {
			return addToFavorites(product)
		}
	}

	// 检查是否已收藏
	const isFavorited = (productId) => {
		return favorites.value.some(item => item.id === productId)
	}

	// 清空收藏列表
	const clearFavorites = () => {
		favorites.value = []
		saveFavorites()
		uni.showToast({
			title: '已清空收藏',
			icon: 'success',
			duration: 1500
		})
	}

	// 收藏数量
	const favoritesCount = computed(() => favorites.value.length)

	// ==================== 浏览记录功能 ====================

	// 浏览记录列表（最多5条）
	const browsingHistory = ref([])

	// 从本地存储加载浏览记录
	const loadBrowsingHistory = () => {
		try {
			const stored = uni.getStorageSync('browsing_history')
			if (stored && Array.isArray(stored)) {
				browsingHistory.value = stored
			}
		} catch (error) {
			console.error('加载浏览记录失败:', error)
			browsingHistory.value = []
		}
	}

	// 保存浏览记录到本地存储
	const saveBrowsingHistory = () => {
		try {
			uni.setStorageSync('browsing_history', browsingHistory.value)
		} catch (error) {
			console.error('保存浏览记录失败:', error)
		}
	}

	// 添加浏览记录
	const addToBrowsingHistory = (product) => {
		if (!product || !product.id) {
			console.error('无效的产品数据')
			return
		}

		// 创建浏览记录项
		const historyItem = {
			id: product.id,
			title: product.title || product.name || '未知产品',
			price: product.price || 0,
			viewedAt: new Date().toISOString()
		}

		// 移除已存在的相同产品记录
		const existingIndex = browsingHistory.value.findIndex(item => item.id === product.id)
		if (existingIndex > -1) {
			browsingHistory.value.splice(existingIndex, 1)
		}

		// 添加到记录列表开头
		browsingHistory.value.unshift(historyItem)

		// 保持最多5条记录
		if (browsingHistory.value.length > 5) {
			browsingHistory.value = browsingHistory.value.slice(0, 5)
		}

		// 保存到本地存储
		saveBrowsingHistory()

		console.log('已记录浏览历史:', historyItem)
	}

	// 清空浏览记录
	const clearBrowsingHistory = () => {
		browsingHistory.value = []
		saveBrowsingHistory()
		console.log('已清空浏览记录')
	}

	// 获取最近浏览的产品
	const getRecentlyViewed = (limit = 5) => {
		return browsingHistory.value.slice(0, limit)
	}

	// 浏览记录数量
	const browsingHistoryCount = computed(() => browsingHistory.value.length)

	// ==================== 初始化 ====================

	// 初始化数据（从本地存储加载）
	const init = () => {
		loadFavorites()
		loadBrowsingHistory()
	}

	// 导出状态和方法
	return {
		// 收藏相关
		favorites,
		favoritesCount,
		addToFavorites,
		removeFromFavorites,
		toggleFavorite,
		isFavorited,
		clearFavorites,

		// 浏览记录相关
		browsingHistory,
		browsingHistoryCount,
		addToBrowsingHistory,
		clearBrowsingHistory,
		getRecentlyViewed,

		// 初始化
		init
	}
})
