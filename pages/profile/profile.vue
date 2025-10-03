<template>
	<view class="container">
		<!-- 未登录状态 -->
		<view v-if="!isLoggedIn" class="login-section">
			<view class="login-tip">
				<text>请登录后查看个人信息</text>
			</view>

			<!-- 用户协议和隐私政策 -->
			<view class="agreement-section">
				<view class="agreement-checkbox" @click="toggleAgreement">
					<view class="checkbox" :class="{ checked: isAgreed }">
						<text v-if="isAgreed" class="checkmark">✓</text>
					</view>
					<view class="agreement-text">
						<text>我已阅读并同意</text>
						<text class="link-text" @click.stop="showUserAgreement">《用户协议》</text>
						<text>和</text>
						<text class="link-text" @click.stop="showPrivacyPolicy">《隐私政策》</text>
					</view>
				</view>
			</view>

			<button
				class="login-btn"
				:class="{ disabled: !isAgreed }"
				@click="handleWechatLogin"
				:loading="loginLoading"
				:disabled="!isAgreed"
			>
				微信授权登录
			</button>
		</view>

		<!-- 已登录状态 - 占位内容 -->
		<view v-else class="profile-content">
			<view class="user-info">
				<image class="avatar" :src="userInfo.avatarUrl || '/static/logo.png'" mode="aspectFill"></image>
				<text class="nickname">{{ userInfo.nickName || '微信用户' }}</text>
			</view>

			<!-- 功能菜单占位 -->
			<view class="menu-section">
				<view class="menu-item">浏览历史</view>
				<view class="menu-item">设置</view>
			</view>			<button class="logout-btn" @click="handleLogout">退出登录</button>
		</view>
	</view>
</template>

<script>
import { useUserStore } from '@/stores/user'

export default {
	data() {
		return {
			isAgreed: false
		}
	},
	computed: {
		userStore() {
			return useUserStore()
		},
		isLoggedIn() {
			return this.userStore.isLoggedIn
		},
		loginLoading() {
			return this.userStore.loginLoading
		},
		userInfo() {
			return this.userStore.userInfo || {}
		}
	},
	onLoad() {
		this.userStore.checkLoginStatus();
	},
	onShow() {
		// 每次显示页面时检查登录状态
		this.userStore.checkLoginStatus();
	},
	methods: {

		// 切换协议同意状态
		toggleAgreement() {
			this.isAgreed = !this.isAgreed;
		},

		// 微信登录
		handleWechatLogin() {
			if (!this.isAgreed) {
				uni.showToast({
					title: '请先同意用户协议和隐私政策',
					icon: 'none'
				});
				return;
			}

			// 1. 先检查用户信息授权状态
			uni.authorize({
				scope: 'scope.userInfo',
				success: () => {
					console.log('用户信息授权成功');
					// 授权成功，进行微信登录
					this.doWechatLogin();
				},
				fail: () => {
					console.log('用户信息授权被拒绝，直接获取用户信息');
					// 用户拒绝授权或首次授权，直接调用getUserProfile
					this.doWechatLogin();
				}
			});
		},

		// 执行微信登录
		async doWechatLogin() {
			try {
				// 调用微信登录获取 code
				const loginRes = await new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: resolve,
						fail: reject
					});
				});

				console.log('微信登录成功:', loginRes);

				// 直接调用 /login API
				await this.userStore.loginUser({
					code: loginRes.code
				});

				uni.showToast({
					title: '登录成功',
					icon: 'success'
				});

			} catch (error) {
				console.error('登录失败:', error);
				uni.showToast({
					title: error.message || '登录失败，请重试',
					icon: 'none'
				});
			}
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

		// 显示用户协议
		showUserAgreement() {
			uni.showModal({
				title: '用户协议',
				content: '这里是用户协议内容，实际使用时应该跳转到完整的协议页面或显示详细内容。',
				confirmText: '我知道了',
				showCancel: false
			});
		},

		// 显示隐私政策
		showPrivacyPolicy() {
			uni.showModal({
				title: '隐私政策',
				content: '这里是隐私政策内容，实际使用时应该跳转到完整的隐私政策页面或显示详细内容。',
				confirmText: '我知道了',
				showCancel: false
			});
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 20px;
	min-height: 100vh;
	background-color: #f5f5f5;
}

.login-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 60vh;

	.login-tip {
		margin-bottom: 20px;
		text {
			color: #666;
			font-size: 16px;
		}
	}

	.agreement-section {
		margin-bottom: 30px;

		.agreement-checkbox {
			display: flex;
			align-items: center;
			justify-content: center;

			.checkbox {
				width: 16px;
				height: 16px;
				border: 1px solid #ddd;
				border-radius: 3px;
				margin-right: 8px;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: #fff;

				&.checked {
					background-color: #007AFF;
					border-color: #007AFF;
				}

				.checkmark {
					color: #fff;
					font-size: 12px;
					font-weight: bold;
				}
			}

			.agreement-text {
				font-size: 12px;
				color: #999;
				line-height: 1.5;

				.link-text {
					color: #007AFF;
					text-decoration: underline;
				}
			}
		}
	}

	.login-btn {
		background-color: #07c160;
		color: white;
		border-radius: 8px;
		padding: 12px 60px;
		border: none;
		font-size: 16px;

		&::after {
			border: none;
		}

		&.disabled {
			background-color: #ccc;
			color: #999;
		}
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

			&:last-child {
				border-bottom: none;
			}

			&:active {
				background-color: #f5f5f5;
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
