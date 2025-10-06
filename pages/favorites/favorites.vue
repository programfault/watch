<template>
	<view class="container">
		<!-- 页面标题 -->
		<view class="page-header">
			<text class="page-title">我的收藏</text>
			<text class="count-badge">{{ favoritesStore.favoritesCount }}件</text>
		</view>

		<!-- 收藏列表 -->
		<view v-if="favoritesStore.favoritesCount > 0" class="favorites-list">
			<view
				v-for="item in favoritesStore.favorites"
				:key="item.id"
				class="favorite-item"
				@click="goToDetail(item.id)"
			>
				<view class="item-image">
					<image
						:src="item.image || '/static/logo.png'"
						mode="aspectFill"
						class="product-image"
					/>
				</view>
				<view class="item-content">
					<text class="product-name">{{ item.title || item.name }}</text>
					<view class="price-row">
						<text class="product-price">¥{{ formatPrice(item.price) }}</text>
						<text class="added-time">{{ formatTime(item.addedAt) }}</text>
					</view>
				</view>
				<view class="item-actions">
					<view class="remove-btn" @click.stop="removeFavorite(item.id)">
						<uv-icon name="close" size="20" color="#999"></uv-icon>
					</view>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view v-else class="empty-state">
			<view class="empty-icon">
				<uv-icon name="heart" size="80" color="#e0e0e0"></uv-icon>
			</view>
			<text class="empty-title">暂无收藏</text>
			<text class="empty-desc">赶快去收藏心仪的手表吧</text>
			<button class="browse-btn" @click="goToBrowse">
				<text>去逛逛</text>
			</button>
		</view>

		<!-- 底部操作栏 -->
		<view v-if="favoritesStore.favoritesCount > 0" class="bottom-actions">
			<button class="clear-btn" @click="clearAllFavorites">
				<text>清空收藏</text>
			</button>
		</view>
	</view>
</template>

<script setup>
import { useFavoritesStore, useTabBarStore } from '@/stores'
import { onShow } from '@dcloudio/uni-app'
// 定义组件名称
defineOptions({
	name: 'FavoritesPage'
})

const favoritesStore = useFavoritesStore()

// 页面显示时刷新数据
onShow(() => {
	// 由于数据是从本地存储加载的，不需要额外刷新
	console.log('收藏页面显示，当前收藏数量:', favoritesStore.favoritesCount)
})

// 格式化价格
const formatPrice = (price) => {
	if (!price) return '0'
	return Number(price).toLocaleString('zh-CN', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	})
}

// 格式化时间
const formatTime = (timeStr) => {
	if (!timeStr) return ''
	const date = new Date(timeStr)
	const now = new Date()
	const diff = now - date

	// 小于1小时显示分钟
	if (diff < 3600000) {
		const minutes = Math.floor(diff / 60000)
		return minutes < 1 ? '刚刚' : `${minutes}分钟前`
	}

	// 小于24小时显示小时
	if (diff < 86400000) {
		const hours = Math.floor(diff / 3600000)
		return `${hours}小时前`
	}

	// 小于7天显示天数
	if (diff < 604800000) {
		const days = Math.floor(diff / 86400000)
		return `${days}天前`
	}

	// 超过7天显示具体日期
	return date.toLocaleDateString('zh-CN', {
		month: 'short',
		day: 'numeric'
	})
}

// 跳转到产品详情
const goToDetail = (productId) => {
	uni.navigateTo({
		url: `/pages/product/detail?id=${productId}`
	})
}

// 移除收藏
const removeFavorite = (productId) => {
	uni.showModal({
		title: '确认移除',
		content: '确定要取消收藏这个商品吗？',
		success: (res) => {
			if (res.confirm) {
				favoritesStore.removeFromFavorites(productId)
			}
		}
	})
}

// 清空所有收藏
const clearAllFavorites = () => {
	uni.showModal({
		title: '确认清空',
		content: '确定要清空所有收藏吗？此操作不可恢复。',
		success: (res) => {
			if (res.confirm) {
				favoritesStore.clearFavorites()
			}
		}
	})
}

// 去浏览商品
const goToBrowse = () => {
    const tabbarStore = useTabBarStore()
    tabbarStore.setActiveTab("home")
	uni.switchTab({
		url: '/pages/index/index'
	})
}
</script>

<style lang="scss" scoped>
@import './favorites.scss';
</style>
