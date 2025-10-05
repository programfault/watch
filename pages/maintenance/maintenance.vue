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
					<uni-icons type="book" size="14" color="#007aff" />
					<text class="manual-text">保养手册</text>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading" v-if="appStore.storesLoading">
				<uni-load-more status="loading" />
			</view>

			<!-- 店铺列表 -->
			<view class="stores-list" v-else-if="appStore.hasStores">
				<view
					class="store-item"
					v-for="store in sortedStores"
					:key="store.id"
				>
					<view class="store-header">
						<text class="store-name" @click="showStoreDetail(store)">{{ store.name }}</text>
					</view>
					<view class="store-info">
						<text class="store-address" @click="showStoreDetail(store)">{{ store.address }}</text>
					</view>
					<text class="store-description" @click="showStoreDetail(store)">{{ store.description }}</text>
					<view class="store-footer">
						<text class="store-hours">营业时间: {{ store.opening_hours }}</text>
						<view class="action-buttons">
							<!-- 距离显示在左侧 -->
							<view class="distance-info">
								<text class="distance-text" v-if="locationAuthorized && userLocation && formatDistance(store)">距您 {{ formatDistance(store) }}</text>
								<text class="distance-placeholder" v-else-if="!locationAuthorized">位置未授权</text>
								<text class="distance-placeholder" v-else-if="!userLocation">获取位置中...</text>
								<text class="distance-placeholder" v-else-if="!store.latitude || !store.longitude">无位置信息</text>
								<text class="distance-placeholder" v-else>计算异常</text>
							</view>
							<!-- 按钮组在右侧 -->
							<view class="button-group">
								<view class="phone-section" @click.stop="callStore(store)">
									<uni-icons type="phone" size="14" color="#007aff" />
									<text class="store-phone">电话</text>
								</view>
								<!-- 只有有位置权限时才显示导航按钮 -->
								<view v-if="locationAuthorized" class="nav-button" @click.stop="navigateToStore(store)">
									<uni-icons type="navigate" size="16" color="#fff" />
									<text class="nav-text">导航</text>
								</view>
								<!-- 没有位置权限时显示提示 -->
								<view v-else class="nav-disabled">
									<uni-icons type="navigate" size="14" color="#ccc" />
									<text class="nav-disabled-text">导航不可用</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-else>
				<text class="empty-text">暂无服务门店信息</text>
			</view>
		</view>

		<!-- 底部标签栏组件 -->
		<CustomTabBar />
	</view>
</template>

<script setup>
import CustomTabBar from '@/components/CustomTabBar.vue'
import { useAppStore, useTabBarStore } from '@/stores'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'

// 初始化 stores
const appStore = useAppStore()
const tabBarStore = useTabBarStore()

// 响应式数据
const locationAuthorized = ref(false)
const userLocation = ref(null)
const isRefreshing = ref(false)

// 计算属性 - 根据用户位置排序的门店列表
const sortedStores = computed(() => {
	if (!appStore.allStores || !userLocation.value) {
		return appStore.allStores || []
	}

	// 计算距离并排序
	return [...appStore.allStores].sort((a, b) => {
		const distanceA = calculateDistance(a)
		const distanceB = calculateDistance(b)
		return distanceA - distanceB
	})
})

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

// 地图导航（只有有权限时才会调用）
const navigateToStore = (store) => {
	if (!store.latitude || !store.longitude) {
		uni.showToast({
			title: '该店铺暂无位置信息',
			icon: 'none'
		})
		return
	}

	// 直接打开地图导航，因为已经确保有权限
	uni.openLocation({
		latitude: parseFloat(store.latitude),
		longitude: parseFloat(store.longitude),
		name: store.name,
		address: store.address,
		fail: (err) => {
			console.error('打开地图失败:', err)
			uni.showToast({
				title: '打开地图失败',
				icon: 'none'
			})
		}
	})
}

// 跳转到保养手册
const goToManual = () => {
	uni.navigateTo({
		url: '/pages/maintenance/manual'
	})
}

// 下拉刷新处理函数
const handleRefresh = async () => {
	if (isRefreshing.value) return

	isRefreshing.value = true
	try {
		// 重新获取店铺数据
		await appStore.fetchStores()

		// 如果有位置权限，重新获取位置信息
		if (locationAuthorized.value) {
			await getUserLocation()
		}

		uni.showToast({
			title: '刷新成功',
			icon: 'success',
			duration: 1000
		})
	} catch (error) {
		console.error('刷新失败:', error)
		uni.showToast({
			title: '刷新失败，请重试',
			icon: 'none'
		})
	} finally {
		isRefreshing.value = false
		uni.stopPullDownRefresh()
	}
}

// 页面进入时请求位置权限
const requestLocationOnEnter = async () => {
	try {
		// 先检查当前权限状态
		const setting = await uni.getSetting()

		// 如果已经有权限，直接获取位置
		if (setting.authSetting['scope.userLocation'] === true) {
			locationAuthorized.value = true
			await getUserLocation()
			return
		}

		// 如果之前拒绝过，不再主动弹窗
		if (setting.authSetting['scope.userLocation'] === false) {
			locationAuthorized.value = false
			return
		}

		// 首次使用，弹窗请求权限
		const modalResult = await uni.showModal({
			title: '位置权限请求',
			content: '为了为您提供最近门店的导航服务和距离显示，需要获取您的位置信息。\n\n拒绝授权也可以正常使用其他功能。',
			confirmText: '同意授权',
			cancelText: '暂不授权'
		})

		if (modalResult.confirm) {
			// 用户同意，尝试授权
			try {
				await uni.authorize({ scope: 'scope.userLocation' })
				locationAuthorized.value = true
				await getUserLocation()
				uni.showToast({ title: '位置权限开启成功', icon: 'success' })
			} catch (authError) {
				// 授权失败
				locationAuthorized.value = false
				console.log('用户拒绝了位置权限:', authError)
			}
		} else {
			// 用户拒绝
			locationAuthorized.value = false
		}

	} catch (error) {
		console.error('检查位置权限失败:', error)
		locationAuthorized.value = false
	}
}

// 获取用户当前位置（优化版）
const getUserLocation = async () => {
	try {
		const res = await uni.getLocation({
			type: 'gcj02',
			highAccuracyExpireTime: 4000, // 高精度定位超时时间
			isHighAccuracy: true // 开启高精度��位
		})

		userLocation.value = {
			latitude: res.latitude,
			longitude: res.longitude
		}

		console.log('获取用户位置成功:', userLocation.value)
		return userLocation.value

	} catch (error) {
		console.error('获取位置失败:', error)

		// 根据错误类型给出不同提示
		if (error.errMsg?.includes('requiredPrivateInfos')) {
			uni.showModal({
				title: '配置错误',
				content: '小程序需要重新发布才能使用位置功能，请联系开发者',
				showCancel: false
			})
		} else if (error.errMsg?.includes('auth deny')) {
			uni.showToast({
				title: '位置权限被拒绝',
				icon: 'none'
			})
		} else {
			uni.showToast({
				title: '获取位置失败',
				icon: 'none'
			})
		}

		// 重置权限状态
		locationAuthorized.value = false
		return null
	}
}

// 计算门店距离（使用球面距离公式）
const calculateDistance = (store) => {
	if (!userLocation.value || !store.latitude || !store.longitude) {
		return Infinity
	}

	const rad1 = (userLocation.value.latitude * Math.PI) / 180
	const rad2 = (parseFloat(store.latitude) * Math.PI) / 180
	const deltaLat = rad2 - rad1
	const deltaLng = ((parseFloat(store.longitude) - userLocation.value.longitude) * Math.PI) / 180

	const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(rad1) * Math.cos(rad2) *
		Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

	// 地球半径（千米）
	const R = 6371
	return R * c
}

// 格式化距离显示
const formatDistance = (store) => {
	// 调试信息
	console.log('formatDistance - store:', {
		name: store.name,
		latitude: store.latitude,
		longitude: store.longitude,
		userLocation: userLocation.value,
		locationAuthorized: locationAuthorized.value
	})

	// 检查必要的数据
	if (!userLocation.value) {
		console.log('用户位置为空')
		return ''
	}

	if (!store.latitude || !store.longitude) {
		console.log('店铺经纬度为空:', store.latitude, store.longitude)
		return ''
	}

	const distance = calculateDistance(store)
	console.log('计算出的距离:', distance)

	if (distance === Infinity || Number.isNaN(distance)) {
		console.log('距离计算异常')
		return ''
	}

	if (distance < 1) {
		return `${Math.round(distance * 1000)}m`
	} else {
		return `${distance.toFixed(1)}km`
	}
}

// 页面加载时的初始化
onMounted(async () => {
	// 确保店铺数据已加载
	if (!appStore.hasStores && !appStore.storesLoading) {
		await appStore.fetchStores()
	}

	// 进入页面时主动请求位置权限
	await requestLocationOnEnter()
})

// 下拉刷新生命周期
onPullDownRefresh(() => {
	handleRefresh()
})

// uniapp 生命周期 - 页面显示时
onShow(() => {
	// 设置当前页面的tabBar状态
	tabBarStore.setActiveTab('maintenance')
})
</script>

<style lang="scss">
.container {
	padding: 20px;
	background-color: #f8f8f8;
	min-height: 100vh;
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

.stores-list {
	.store-item {
		background: #fff;
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		position: relative;

		.store-header {
			margin-bottom: 8px;

			.store-name {
				font-size: 16px;
				font-weight: bold;
				color: #333;
			}
		}

		.store-info {
			margin-bottom: 6px;

			.store-address {
				font-size: 14px;
				color: #666;
				line-height: 1.4;
			}
		}

		.store-description {
			font-size: 12px;
			color: #999;
			margin-bottom: 12px;
			line-height: 1.3;
		}

		.store-footer {
			.store-hours {
				font-size: 12px;
				color: #666;
				margin-bottom: 10px;
			}

			.action-buttons {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.distance-info {
					flex: 1;

					.distance-text {
						font-size: 11px;
						color: #007aff;
						background: #f0f8ff;
						padding: 4px 8px;
						border-radius: 10px;
						display: inline-block;
					}

					.distance-placeholder {
						font-size: 11px;
						color: #999;
						background: #f5f5f5;
						padding: 4px 8px;
						border-radius: 10px;
						display: inline-block;
					}
				}

				.button-group {
					display: flex;
					gap: 8px;

					.phone-section {
						display: flex;
						align-items: center;
						background: #f0f8ff;
						padding: 6px 12px;
						border-radius: 20px;
						transition: background-color 0.2s ease;
						justify-content: center;
						min-width: 60px;

						&:active {
							background: #e6f3ff;
						}

						.store-phone {
							font-size: 12px;
							color: #007aff;
							margin-left: 4px;
							font-weight: 500;
						}
					}

					.nav-button {
						display: flex;
						align-items: center;
						background: linear-gradient(135deg, #007aff, #5ac8fa);
						padding: 6px 12px;
						border-radius: 20px;
						transition: transform 0.2s ease, box-shadow 0.2s ease;
						justify-content: center;
						min-width: 60px;

						&:active {
							transform: scale(0.95);
							box-shadow: 0 2px 4px rgba(0, 122, 255, 0.3);
						}

						.nav-text {
							font-size: 12px;
							color: #fff;
							margin-left: 4px;
							font-weight: 500;
						}
					}

					.nav-disabled {
						display: flex;
						align-items: center;
						background: #f5f5f5;
						padding: 6px 12px;
						border-radius: 20px;
						justify-content: center;
						min-width: 60px;

						.nav-disabled-text {
							font-size: 12px;
							color: #999;
							margin-left: 4px;
						}
					}
				}
			}
		}
	}
}

.empty-state {
	text-align: center;
	padding: 60px 20px;

	.empty-text {
		font-size: 14px;
		color: #999;
	}
}
</style>
