<template>
	<view class="container">
		<view class="page-header">
			<text class="page-title">维修保养服务</text>
			<text class="page-subtitle">专业的手表维修和保养服务</text>
		</view>

		<!-- 店铺列表 -->
		<view class="stores-section">
			<view class="section-header">
				<view class="section-title">服务门店</view>
				<view class="manual-entry" @click="goToManual">
					<up-icon name="file-text" size="14" color="#007aff" />
					<text class="manual-text">保养手册</text>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading" v-if="appStore.storesLoading">
				<uni-load-more status="loading" />
			</view>

			<!-- 店铺列表 -->
			<view class="stores-list" v-else-if="appStore.hasStores">
				<StoreCard
					v-for="store in sortedStores"
					:key="store.id"
					:store="store"
					:location-authorized="locationAuthorized"
					:user-location="userLocation"
					:format-store-distance="formatStoreDistance"
					@show-detail="showStoreDetail"
					@call="callStore"
					@navigate="navigateToStore"
					@request-location="requestLocationOnClick"
				/>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-else>
				<text class="empty-text">暂无服务门店信息</text>
			</view>
		</view>

		<!-- 底部标签栏组件 -->
		<CustomTabBar v-show="true" />
	</view>
</template>

<script setup>
import CustomTabBar from '@/components/CustomTabBar.vue'
import StoreCard from '@/components/StoreCard.vue'
import { useAppStore, useTabBarStore } from '@/stores'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
// 导入工具函数
import { hideTabSwitchLoading } from '@/utils/loadingUtils.js'
// 导入位置相关工具函数
import {
    calculateDistance,
    checkLocationPermission,
    formatDistance,
    getUserLocation,
    openMapNavigation,
    requestLocationPermission
} from '@/utils/locationUtils.js'

// 初始化 stores
const appStore = useAppStore()
const tabBarStore = useTabBarStore()

// 响应式数据
const locationAuthorized = ref(false)
const userLocation = ref(null)

// 计算属性 - 根据用户位置排序的门店列表
const sortedStores = computed(() => {
	if (!appStore.allStores || !userLocation.value) {
		return appStore.allStores || []
	}

	// 计算距离并排序
	return [...appStore.allStores].sort((a, b) => {
		const distanceA = calculateDistance(userLocation.value, a)
		const distanceB = calculateDistance(userLocation.value, b)
		return distanceA - distanceB
	})
})

// 计算门店距离
const calculateStoreDistance = (store) => {
	if (!userLocation.value || !store.latitude || !store.longitude) {
		return Infinity
	}
	return calculateDistance(userLocation.value, store)
}

// 格式化门店距离显示
const formatStoreDistance = (store) => {
	const distance = calculateStoreDistance(store)
	if (distance === Infinity) return null
	return formatDistance(distance)
}

// 显示店铺详情
const showStoreDetail = (store) => {
	uni.showModal({
		title: store.name,
		content: `地址: ${store.address}\n电话: ${store.phone}\n营业时间: ${store.opening_hours}\n\n${store.description}`,
		showCancel: false
	})
}

// 拨打电话
const callStore = (store) => {
	uni.makePhoneCall({
		phoneNumber: store.phone,
		fail: (err) => {
			console.error('拨打电话失败:', err)
			uni.showToast({
				title: '拨打电话失败',
				icon: 'none'
			})
		}
	})
}

// 地图导航 - 参考product/detail.vue的做法，点击时才请求权限
const navigateToStore = async (store) => {
	// 先检查权限
	if (!locationAuthorized.value) {
		const hasPermission = await requestLocationPermission()
		if (!hasPermission) {
			return
		}
		locationAuthorized.value = true
	}

	// 获取用户位置
	if (!userLocation.value) {
		const location = await getUserLocation()
		if (!location) {
			return
		}
		userLocation.value = location
	}

	// 打开地图导航
	await openMapNavigation(store)
}

// 请求开启定位
const requestLocationOnClick = async () => {
	const hasPermission = await requestLocationPermission()
	if (hasPermission) {
		locationAuthorized.value = true
		const location = await getUserLocation()
		if (location) {
			userLocation.value = location
		}
	}
}

// 跳转到保养手册
const goToManual = () => {
	uni.navigateTo({
		url: '/pages/maintenance/manual'
	})
}



// 初始化函数
const initPage = async () => {
	// 店铺数据已通过 init 接口获取，无需额外请求
	// 仅静默检查权限状态，不主动请求，也不自动获取位置信息
	const hasPermission = await checkLocationPermission()
	locationAuthorized.value = hasPermission
}

// uniapp 生命周期 - 页面显示时
onShow(async () => {
	// 设置当前页面的tabBar状态
	tabBarStore.setActiveTab('maintenance')
	// 页面显示时初始化
	await initPage()
	// 隐藏tab切换loading
	hideTabSwitchLoading()
})
</script>

<style lang="scss">
.container {
	height: 100vh;
	padding: 20px;
	padding-top: calc(20px + env(safe-area-inset-top));
	padding-bottom: calc(20px + 50px + env(safe-area-inset-bottom));
	background-color: #f8f8f8;
	box-sizing: border-box;
	overflow-y: auto;
}

.page-header {
	text-align: center;
	margin-bottom: 30px;

	.page-title {
		display: block;
		font-size: 24px;
		font-weight: bold;
		color: #333;
		margin-bottom: 8px;
	}

	.page-subtitle {
		font-size: 14px;
		color: #666;
	}
}

.stores-section {
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;

		.section-title {
			font-size: 18px;
			font-weight: bold;
			color: #333;
		}

		.manual-entry {
			display: flex;
			align-items: center;
			background: #f0f8ff;
			padding: 6px 12px;
			border-radius: 20px;
			transition: all 0.2s ease;

			&:active {
				background: #e6f3ff;
				transform: scale(0.95);
			}

			.manual-text {
				font-size: 12px;
				color: #007aff;
				margin-left: 4px;
				font-weight: 500;
			}
		}
	}
}

.loading {
	text-align: center;
	padding: 40px 0;
}

/* 店铺卡片样式已封装到StoreCard组件中，无需额外样式 */

.empty-state {
	text-align: center;
	padding: 60px 20px;

	.empty-text {
		font-size: 14px;
		color: #999;
	}
}
</style>
