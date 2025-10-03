<template>
	<view class="container">
		<!-- 加载状态 -->
		<view v-if="userInfoLoading" class="loading">
			<uni-icons type="spinner-cycle" size="30" color="#999"></uni-icons>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 未登录状态 - 显示登录组件 -->
		<view v-else-if="!userStore.isLoggedIn" class="login-section">
			<view class="login-header">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
				<text class="app-name">手表助手</text>
				<text class="welcome-text">欢迎使用，请先登录</text>
			</view>
			<LoginComponent
				tip-text="请使用微信授权登录"
			/>
		</view>

		<!-- 已登录状态 - 个人信息内容 -->
		<view v-else class="profile-content">
			<view class="user-info">
				<image class="avatar" :src="userInfo.avatarUrl || '/static/logo.png'" mode="aspectFill"></image>
				<text class="nickname">{{ userInfo.nickName || '微信用户' }}</text>
			</view>

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
			</view>			<button class="logout-btn" @click="handleLogout">退出登录</button>
		</view>
	</view>
</template>

<script>
import { useUserStore } from '@/stores/user'
import LoginComponent from '@/components/LoginComponent.vue'

export default {
	components: {
		LoginComponent
	},
	data() {
		return {
			userInfoLoading: false
		}
	},
	computed: {
		userStore() {
			return useUserStore()
		},
		hasCustomerPermission() {
			return this.userStore.hasCustomerPermission;
		},
		userInfo() {
			return this.userStore.userInfo || {}
		}
	},
	onLoad() {
		console.log('Profile 页面加载');
		// 页面加载完成，等待状态检查
		this.userInfoLoading = false;
	},

	onShow() {
		console.log('Profile 页面显示');
		// 页面显示，状态由Pinia自动管理
	},
	methods: {
		// 导航到客户管理页面
		navigateToCustomer() {
			uni.navigateTo({
				url: '/pages/customer/customer'
			});
		},

		// 退出登录
		handleLogout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 调用 store 中的退出登录方法
						this.userStore.logout();

						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						});
					}
				}
			});
		},


	}
}
</script>

<style lang="scss">
.container {
	padding: 20px;
	min-height: 100vh;
	background-color: #f5f5f5;
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



.profile-content {
	.user-info {
		background: white;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;

		.avatar {
			width: 80px;
			height: 80px;
			border-radius: 50%;
			margin-bottom: 10px;
		}

		.nickname {
			font-size: 18px;
			font-weight: bold;
			color: #333;
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
</style>
