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
						<view class="phone-section" @click.stop="callStore(store)">
							<uni-icons type="phone" size="14" color="#007aff" />
							<text class="store-phone">{{ store.phone }}</text>
						</view>
					</view>
					<view class="store-info">
						<text class="store-address" @click="showStoreDetail(store)">{{ store.address }}</text>
						<!-- 只有有位置权限且有距离信息时才显示 -->
						<text class="store-distance" v-if="locationAuthorized && formatDistance(store)">距您 {{ formatDistance(store) }}</text>
					</view>
					<text class="store-description" @click="showStoreDetail(store)">{{ store.description }}</text>
					<view class="store-footer">
						<text class="store-hours">营业时间: {{ store.opening_hours }}</text>
						<!-- 只有有位置权限时才显示导航按钮 -->
						<view v-if="locationAuthorized" class="nav-button" @click.stop="navigateToStore(store)">
							<uni-icons type="location" size="16" color="#fff" />
							<text class="nav-text">导航</text>
						</view>
						<!-- 没有位置权限时显示提示 -->
						<view v-else class="nav-disabled">
							<uni-icons type="location" size="14" color="#ccc" />
							<text class="nav-disabled-text">导航不可用</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-else>
				<text class="empty-text">暂无服务门店信息</text>
			</view>
		</view>
	</view>
</template>

<script>
import { useAppStore } from '@/stores'

export default {
	setup() {
		const appStore = useAppStore()
		return {
			appStore
		}
	},
	data() {
		return {
			// 地理位置权限状态
			locationAuthorized: false,
			locationChecked: false,
			// 用户当前位置
			userLocation: null
		}
	},
	computed: {
		// 根据用户位置排序的门店列表
		sortedStores() {
			if (!this.appStore.allStores || !this.userLocation) {
				return this.appStore.allStores || []
			}

			// 计算距离并排序
			return [...this.appStore.allStores].sort((a, b) => {
				const distanceA = this.calculateDistance(a)
				const distanceB = this.calculateDistance(b)
				return distanceA - distanceB
			})
		}
	},
	async onLoad() {
		// 确保店铺数据已加载
		if (!this.appStore.hasStores && !this.appStore.storesLoading) {
			await this.appStore.fetchStores()
		}

		// 进入页面时主动请求位置权限
		await this.requestLocationOnEnter()
	},
	methods: {
		// 显示店铺详情
		showStoreDetail(store) {
			uni.showModal({
				title: store.name,
				content: `地址: ${store.address}\n电话: ${store.phone}\n营业时间: ${store.opening_hours}\n\n${store.description}`,
				showCancel: false
			})
		},

		// 拨打电话
		callStore(store) {
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
		},

		// 地图导航（只有有权限时才会调用）
		navigateToStore(store) {
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
		},

		// 跳转到保养手册
		goToManual() {
			uni.navigateTo({
				url: '/pages/maintenance/manual'
			})
		},

		// 页面进入时请求位置权限
		async requestLocationOnEnter() {
			try {
				// 先检查当前权限状态
				const setting = await uni.getSetting()

				// 如果已经有权限，直接获取位置
				if (setting.authSetting['scope.userLocation'] === true) {
					this.locationAuthorized = true
					this.locationChecked = true
					await this.getUserLocation()
					return
				}

				// 如果之前拒绝过，不再主动弹窗
				if (setting.authSetting['scope.userLocation'] === false) {
					this.locationAuthorized = false
					this.locationChecked = true
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
						this.locationAuthorized = true
						this.locationChecked = true
						await this.getUserLocation()
						uni.showToast({ title: '位置权限开启成功', icon: 'success' })
					} catch (authError) {
						// 授权失败
						this.locationAuthorized = false
						this.locationChecked = true
						console.log('用户拒绝了位置权限:', authError)
					}
				} else {
					// 用户拒绝
					this.locationAuthorized = false
					this.locationChecked = true
				}

			} catch (error) {
				console.error('检查位置权限失败:', error)
				this.locationAuthorized = false
				this.locationChecked = true
			}
		},

		// 确保有地理位置权限（优化版）
		async ensureLocationPermission() {
			// 如果已经有权限，直接返回
			if (this.locationAuthorized) {
				return true
			}

			try {
				// 直接尝试授权，UniApp会自动处理用户交互
				await uni.authorize({
					scope: 'scope.userLocation'
				})

				// 授权成功
				this.locationAuthorized = true
				this.getUserLocation()
				uni.showToast({ title: '授权成功', icon: 'success' })
				return true

			} catch (authError) {
				// 授权失败，引导用户到设置页面
				console.log('授权失败:', authError)
				const result = await uni.showModal({
					title: '需要位置权限',
					content: '请在设置中开启位置权限，以便为您提供最近门店的导航服务。',
					confirmText: '去设置',
					cancelText: '取消'
				})

				if (result.confirm) {
					return this.openLocationSetting()
				}
				return false
			}
		},

		// 打开位置设置页面
		async openLocationSetting() {
			try {
				const settingRes = await uni.openSetting()

				// 检查用户是否开启了位置权限
				if (settingRes.authSetting['scope.userLocation']) {
					this.locationAuthorized = true
					this.getUserLocation()
					uni.showToast({ title: '授权成功', icon: 'success' })
					return true
				} else {
					uni.showToast({ title: '未开启位置权限', icon: 'none' })
					return false
				}
			} catch (error) {
				console.error('打开设置页面失败:', error)
				return false
			}
		},

		// 获取用户当前位置（优化版）
		async getUserLocation() {
			try {
				const res = await uni.getLocation({
					type: 'gcj02',
					highAccuracyExpireTime: 4000, // 高精度定位超时时间
					isHighAccuracy: true // 开启高精度定位
				})

				this.userLocation = {
					latitude: res.latitude,
					longitude: res.longitude
				}

				console.log('获取用户位置成功:', this.userLocation)
				return this.userLocation

			} catch (error) {
				console.error('获取位置失败:', error)
				uni.showToast({
					title: '获取位置失败',
					icon: 'none'
				})
				return null
			}
		},

		// 计算门店距离（使用球面距离公式）
		calculateDistance(store) {
			if (!this.userLocation || !store.latitude || !store.longitude) {
				return Infinity
			}

			const rad1 = (this.userLocation.latitude * Math.PI) / 180
			const rad2 = (parseFloat(store.latitude) * Math.PI) / 180
			const deltaLat = rad2 - rad1
			const deltaLng = ((parseFloat(store.longitude) - this.userLocation.longitude) * Math.PI) / 180

			const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
				Math.cos(rad1) * Math.cos(rad2) *
				Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

			// 地球半径（千米）
			const R = 6371
			return R * c
		},

		// 格式化距离显示
		formatDistance(store) {
			const distance = this.calculateDistance(store)
			if (distance === Infinity) return ''

			if (distance < 1) {
				return `${Math.round(distance * 1000)}m`
			} else {
				return `${distance.toFixed(1)}km`
			}
		}
	}
}
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
			cursor: pointer;
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
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 8px;

			.store-name {
				font-size: 16px;
				font-weight: bold;
				color: #333;
				flex: 1;
				margin-right: 10px;
				cursor: pointer;
			}

			.phone-section {
				display: flex;
				align-items: center;
				background: #f0f8ff;
				padding: 4px 8px;
				border-radius: 6px;
				cursor: pointer;
				transition: background-color 0.2s ease;

				&:active {
					background: #e6f3ff;
				}

				.store-phone {
					font-size: 12px;
					color: #007aff;
					margin-left: 4px;
				}
			}
		}

		.store-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 6px;

			.store-address {
				font-size: 14px;
				color: #666;
				line-height: 1.4;
				cursor: pointer;
				flex: 1;
			}

			.store-distance {
				font-size: 11px;
				color: #007aff;
				background: #f0f8ff;
				padding: 2px 6px;
				border-radius: 10px;
				margin-left: 8px;
				white-space: nowrap;
			}
		}

		.store-description {
			font-size: 12px;
			color: #999;
			margin-bottom: 12px;
			line-height: 1.3;
			cursor: pointer;
		}

		.store-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.store-hours {
				font-size: 12px;
				color: #666;
				flex: 1;
			}

			.nav-button {
				display: flex;
				align-items: center;
				background: linear-gradient(135deg, #007aff, #5ac8fa);
				padding: 6px 12px;
				border-radius: 20px;
				cursor: pointer;
				transition: transform 0.2s ease, box-shadow 0.2s ease;

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

				.nav-disabled-text {
					font-size: 12px;
					color: #999;
					margin-left: 4px;
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
