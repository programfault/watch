<template>
	<view class="login-section">
		<view class="login-tip">
			<text>{{ tipText }}</text>
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
</template>

<script>
import { useUserStore } from '@/stores/user'

export default {
	name: 'LoginComponent',
	props: {
		tipText: {
			type: String,
			default: '请登录后查看个人信息'
		}
	},
	data() {
		return {
			isAgreed: false
		}
	},
	computed: {
		userStore() {
			return useUserStore()
		},
		loginLoading() {
			return this.userStore.loginLoading
		}
	},
	methods: {
		toggleAgreement() {
			this.isAgreed = !this.isAgreed;
		},

		handleWechatLogin() {
			if (!this.isAgreed) {
				uni.showToast({
					title: '请先同意用户协议和隐私政策',
					icon: 'none'
				});
				return;
			}

			uni.authorize({
				scope: 'scope.userInfo',
				success: () => {
					console.log('用户信息授权成功');
					this.doWechatLogin();
				},
				fail: () => {
                    return
				}
			});
		},

		async doWechatLogin() {
			try {
				const loginRes = await new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: resolve,
						fail: reject
					});
				});

				console.log('微信登录成功:', loginRes);

				await this.userStore.loginUser({
					code: loginRes.code
				});

				console.log('登录完成');

				// 登录成功，状态已通过Pinia管理，不需要回调
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

				this.$emit('login-error', error);
			}
		},

		// 添加导航调试监控
		addNavigationDebug() {
			console.log('� 开始监控所有页面导航调用');

			const originalNavigateTo = uni.navigateTo;
			const originalSwitchTab = uni.switchTab;
			const originalReLaunch = uni.reLaunch;
			const originalRedirectTo = uni.redirectTo;

			// 包装导航方法，添加调试信息
			uni.navigateTo = (options) => {
				console.log('🔍 navigateTo 被调用:', {
					url: options.url
				});
				console.log('🔍 完整调用栈:');
				console.trace();
				return originalNavigateTo.call(this, options);
			};

			uni.switchTab = (options) => {
				console.log('� switchTab 被调用:', {
					url: options.url,
					stack: new Error().stack
				});
				return originalSwitchTab.call(this, options);
			};

			uni.reLaunch = (options) => {
				console.log('� reLaunch 被调用:', {
					url: options.url,
					stack: new Error().stack
				});
				return originalReLaunch.call(this, options);
			};

			uni.redirectTo = (options) => {
				console.log('� redirectTo 被调用:', {
					url: options.url,
					stack: new Error().stack
				});
				return originalRedirectTo.call(this, options);
			};
		},

		showUserAgreement() {
			uni.showModal({
				title: '用户协议',
				content: '这里是用户协议内容，实际使用时应该跳转到完整的协议页面或显示详细内容。',
				confirmText: '我知道了',
				showCancel: false
			});
		},

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

<style lang="scss" scoped>
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
</style>
