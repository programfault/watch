<template>
	<view class="container">
		<!-- 加载状态 -->
		<view v-if="userInfoLoading" class="loading">
			<uni-icons type="spinner-cycle" size="30" color="#999"></uni-icons>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 未登录状态 - 显示提示信息 -->
		<view v-else-if="!userStore.isLoggedIn" class="not-login">
			<uni-icons type="info" size="40" color="#999"></uni-icons>
			<text class="not-login-text">正在跳转到登录页面...</text>
		</view>

		<!-- 已登录状态 - 个人信息内容（支持下拉刷新） -->
		<scroll-view
			v-else
			class="profile-scroll"
			scroll-y="true"
			enable-back-to-top="true"
			refresher-enabled="true"
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh"
		>
			<view class="profile-content">
			<view class="user-info">
				<view class="user-content">
					<view class="user-name">
						<text class="name-text shimmer">天辰表友</text>
						<view class="vip-badge">VIP</view>
					</view>

					<view class="user-stats">
						<view class="stat-item">
							<text class="stat-value">会员卡号</text>
							<text class="stat-label">{{ cardNumber }}</text>
						</view>
						<view class="stat-divider"></view>
						<view class="stat-item">
							<text class="stat-value gold">积分余额</text>
							<text class="stat-label">{{ userPoints }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 优惠券列表 -->
			<CouponList :coupons="coupons" />

			<!-- 特权列表 -->
			<PrivilegeList :privileges="privileges" />

			<!-- 功能菜单 -->
			<view class="menu-section">
				<!-- 管理员专用菜单 -->
				<view
					v-if="hasCustomerPermission"
					class="menu-item"
					@click="navigateToCustomer"
				>
					<view class="menu-item-content">
						<uni-icons type="person-filled" size="20" color="#007aff"></uni-icons>
						<text class="menu-text">客户管理</text>
					</view>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>

				<view class="menu-item">
					<view class="menu-item-content">
						<uni-icons type="list" size="20" color="#666"></uni-icons>
						<text class="menu-text">浏览历史</text>
					</view>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>

				<view class="menu-item">
					<view class="menu-item-content">
						<uni-icons type="gear-filled" size="20" color="#666"></uni-icons>
						<text class="menu-text">设置</text>
					</view>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>
			</view>

			<button class="logout-btn" @click="handleLogout">退出登录</button>
			</view>
		</scroll-view>

		<!-- 底部标签栏组件 -->
		<CustomTabBar />
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import CouponList from '@/components/CouponList.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import PrivilegeList from '@/components/PrivilegeList.vue'
import { useTabBarStore, useUserStore } from '@/stores'

// 定义组件名称
defineOptions({
	name: 'ProfilePage'
})

// 获取 stores
const userStore = useUserStore()
const tabBarStore = useTabBarStore()

// 响应式数据
const userInfoLoading = ref(false)
const isRefreshing = ref(false)

// 计算属性
const hasCustomerPermission = computed(() => {
	return userStore.hasCustomerPermission
})

const userInfo = computed(() => {
	return userStore.userInfo || {}
})

// 从API获取卡号
const cardNumber = computed(() => {
	return userInfo.value.card_number || 'VIP888168'
})

// 从API获取积分
const userPoints = computed(() => {
	const points = userInfo.value.points || 12580
	return points.toLocaleString()
})

// 优惠券列表
const coupons = computed(() => {
	return userInfo.value.coupons || []
})

// 特权列表
const privileges = computed(() => {
	return userInfo.value.privileges || []
})

// 检查登录状态并跳转
const checkLoginAndRedirect = () => {
	if (!userStore.isLoggedIn) {
		console.log('用户未登录，跳转到登录页面')
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		}, 1000)
		return false
	}
	return true
}

// 页面生命周期 - onLoad
onLoad(async () => {
	console.log('Profile页面 onLoad')
	userInfoLoading.value = true

	try {
		// 初始化用户状态
		await userStore.initUserState()

		// 检查登录状态
		if (!checkLoginAndRedirect()) {
			userInfoLoading.value = false
			return
		}
	} catch (error) {
		console.error('Profile页面 - 初始化失败:', error)
	} finally {
		userInfoLoading.value = false
	}
})

// 页面生命周期 - onShow
onShow(() => {
	console.log('Profile页面 onShow')

	// 检查登录状态
	if (!checkLoginAndRedirect()) {
		return
	}

	// 设置当前页面的tabBar状态
	tabBarStore.setActiveTab('profile')
	// 页面显示，状态由Pinia自动管理
})

// 下拉刷新
const onRefresh = async () => {
	console.log('Profile页面 - 开始下拉刷新')
	isRefreshing.value = true

	try {
		// 刷新用户信息，包括coupons和privileges
		await userStore.fetchUserInfo()

		uni.showToast({
			title: '刷新成功',
			icon: 'success'
		})
	} catch (error) {
		console.error('Profile页面 - 刷新失败:', error)
		uni.showToast({
			title: '刷新失败',
			icon: 'error'
		})
	} finally {
		isRefreshing.value = false
	}
}

// 导航到客户管理页面
const navigateToCustomer = () => {
	console.log('导航到客户管理页面')
	uni.navigateTo({
		url: '/pages/customer/customer'
	})
}

// 退出登录
const handleLogout = () => {
	console.log('handleLogout 方法被调用')
	uni.showModal({
		title: '确认退出',
		content: '确定要退出登录吗？',
		success: (res) => {
			console.log('Modal 回调，用户选择:', res.confirm)
			if (res.confirm) {
				console.log('开始执行退出登录')
				// 调用 store 中的退出登录方法
				userStore.logout()
                tabBarStore.setUserType('normal')
                tabBarStore.setActiveTab('home')
				uni.showToast({
					title: '已退出登录',
					icon: 'success'
				})
			}
		}
	})
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.profile-scroll {
	height: 100vh;
}

.loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 50vh;

	.loading-text {
		margin-top: 10px;
		font-size: 14px;
		color: #999;
	}
}

.not-login {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 50vh;

	.not-login-text {
		margin-top: 16px;
		font-size: 16px;
		color: #666;
	}
}



.profile-content {
	padding: 20px;

	.user-info {
		background: white;
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 20px;
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
		border: 1px solid #f0f0f0;
		display: flex;
		align-items: center;
		gap: 20px;

		.avatar-container {
			position: relative;
			flex-shrink: 0;

			.avatar {
				width: 64px;
				height: 64px;
				border-radius: 16px;
				background-color: #f8f9fa;
			}

			.status-dot {
				position: absolute;
				bottom: 2px;
				right: 2px;
				width: 16px;
				height: 16px;
				background: linear-gradient(135deg, #4ade80, #22c55e);
				border: 3px solid white;
				border-radius: 50%;
				box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
			}
		}

		.user-content {
			flex: 1;
			min-width: 0;

			.user-name {
				display: flex;
				align-items: center;
				gap: 12px;
				margin-bottom: 16px;

				.name-text {
					font-size: 20px;
					font-weight: 600;
					color: #3a3a3a; // 银黑色基础色

					&.shimmer {
						// 使用::after伪元素创建流光效果，固定显示“天辰表友”
						position: relative;

						&::after {
							content: '天辰表友';
							position: absolute;
							top: 0;
							left: 0;
							background: linear-gradient(
								135deg, // 左上到右下的角度
								transparent 0%,
								transparent 40%,
								#c0c0c0 50%, // 银色流光
								#e5e5e5 52%, // 亮银色流光峰值
								#c0c0c0 54%, // 银色流光
								transparent 60%,
								transparent 100%
							);
							background-size: 300% 300%;
							background-clip: text;
							-webkit-background-clip: text;
							-webkit-text-fill-color: transparent;
							animation: shimmer 4s ease-in-out infinite;
						}
					}
				}

				.vip-badge {
					background: linear-gradient(135deg, #fbbf24, #f59e0b);
					color: white;
					font-size: 10px;
					font-weight: 600;
					padding: 4px 8px;
					border-radius: 6px;
					text-transform: uppercase;
					letter-spacing: 0.5px;
				}
			}

			.user-stats {
				display: flex;
				align-items: center;
				gap: 20px;

				.stat-item {
					flex: 1;
					text-align: left;

					.stat-value {
						display: block;
						font-size: 16px;
						font-weight: 600;
						color: #1a1a1a;
						margin-bottom: 2px;

						&.gold {
							color: #f59e0b;
						}
					}

					.stat-label {
						font-size: 12px;
						color: #64748b;
						font-weight: 500;
					}
				}

				.stat-divider {
					width: 1px;
					height: 32px;
					background-color: #e2e8f0;
					flex-shrink: 0;
				}
			}
		}
	}



	.menu-section {
		background: white;
		border-radius: 12px;
		margin-bottom: 20px;

		.menu-item {
			padding: 16px 20px;
			border-bottom: 1px solid #f0f0f0;
			font-size: 16px;
			color: #333;
			display: flex;
			align-items: center;
			justify-content: space-between;

			&:last-child {
				border-bottom: none;
			}

			&:active {
				background-color: #f5f5f5;
			}

			.menu-item-content {
				display: flex;
				align-items: center;
				flex: 1;

				.menu-text {
					margin-left: 12px;
					font-size: 16px;
					color: #333;
				}
			}
		}
	}

	.logout-btn {
		background-color: #ff4757;
		color: white;
		border-radius: 8px;
		padding: 12px;
		border: none;
		font-size: 16px;
		width: 100%;

		&::after {
			border: none;
		}
	}
}

// 纯斜向流光动画 - 从左上到右下的单向流动
@keyframes shimmer {
	0% {
		background-position: -150% -150%;
	}
	100% {
		background-position: 150% 150%;
	}
}
</style>
