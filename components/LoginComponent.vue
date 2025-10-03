<template>
	<view class="login-container">
		<view class="login-header">
			<text class="app-name">手表助手</text>
			<text class="welcome-text">欢迎使用，请先登录</text>
		</view>

		<view class="login-form">
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

			<!-- 授权获取手机号按钮 -->
			<button
				class="phone-btn"
				open-type="getPhoneNumber"
				@getphonenumber="handleGetPhoneNumber"
				type="primary"
				:disabled="!isAgreed"
			>
				授权手机号
			</button>

			<!-- 手机号已绑定提示 -->
			<view v-if="userStore.isLoggedIn && userStore.userInfo?.phone" class="phone-status">
				<text class="phone-text">手机号已绑定：{{ userStore.userInfo.phone }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { useUserStore } from "@/stores/user";

export default {
	name: "LoginComponent",
	data() {
		return {
			isAgreed: false,
			userProfileData: null,
			hasLogin: false,
			code: '',
		};
	},
	computed: {
		userStore() {
			return useUserStore();
		},
		loginLoading() {
			return this.userStore.loginLoading;
		},
	},

	async onLoad() {
		try {
			await this.getLoginCode();
		} catch (error) {
			console.error('页面加载时获取登录code失败:', error);
		}
	},

	async mounted() {
		if (this.userStore.isLoggedIn && !this.code) {
			try {
				await this.getLoginCode();
			} catch (error) {
				console.error('mounted时获取登录code失败:', error);
			}
		}
	},

	methods: {
		toggleAgreement() {
			this.isAgreed = !this.isAgreed;
		},

		getLoginCode() {
			return new Promise((resolve, reject) => {
				uni.login({
					provider: 'weixin',
					success: (res) => {
						if (res.code) {
							this.code = res.code;
							this.hasLogin = true;
							console.log('获取登录code成功:', res.code);
							resolve(res.code);
						} else {
							console.error('获取login code失败：', res.errMsg);
							reject(new Error(res.errMsg || '获取登录code失败'));
						}
					},
					fail: (err) => {
						console.error('uni.login失败：', err);
						reject(err);
					}
				});
			});
		},

		async handleGetPhoneNumber(e) {
			console.log("手机号授权回调:", e);

			// 检查是否同意用户协议
			if (!this.isAgreed) {
				uni.showToast({
					title: '请先同意用户协议和隐私政策',
					icon: 'none',
					duration: 2000
				});
				return;
			}

			// 检查授权结果
			if (e.detail.errMsg && e.detail.errMsg.includes('deny')) {
				uni.showToast({
					title: '您拒绝了手机号授权',
					icon: 'none',
					duration: 2000
				});
				return;
			}

			// 检查是否获取到加密数据
			const { encryptedData, iv } = e.detail;
			if (!encryptedData || !iv) {
				uni.showToast({
					title: '获取手机号信息失败',
					icon: 'none',
					duration: 2000
				});
				return;
			}

			// 检查登录code是否存在
			if (!this.code) {
				uni.showToast({
					title: '登录状态异常，正在重新获取...',
					icon: 'none'
				});
				try {
					await this.getLoginCode();
				} catch (error) {
					uni.showToast({
						title: '获取登录信息失败，请重试',
						icon: 'none',
						duration: 2000
					});
					return;
				}
			}

			try {
				// 显示加载提示
				uni.showLoading({
					title: '登录中...',
					mask: true
				});

				console.log("准备发送登录数据给后端");

				// 构建登录数据
				const loginData = {
					code: this.code,
					encryptedData: encryptedData,
					iv: iv,
					userProfile: this.userProfileData
				};

				// 调用登录接口
				const result = await this.userStore.loginUser(loginData);

				if (result) {
					console.log("登录成功:", result);

					// 显示成功提示
					uni.showToast({
						title: '登录成功',
						icon: 'success',
						duration: 1500
					});

					// 延迟跳转到首页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						});
					}, 1500);
				}

			} catch (error) {
				console.error("登录失败:", error);

				// 显示错误提示
				const errorMessage = error.message || '登录失败，请重试';
				uni.showToast({
					title: errorMessage,
					icon: 'none',
					duration: 2000
				});

				// 如果是code过期或无效，重新获取
				if (errorMessage.includes('code') || errorMessage.includes('过期')) {
					this.code = '';
					this.hasLogin = false;
					this.getLoginCode();
				}

			} finally {
				// 隐藏加载提示
				uni.hideLoading();
			}
		},

		showUserAgreement() {
			uni.showModal({
				title: "用户协议",
				content: "这里是用户协议内容，实际使用时应该跳转到完整的协议页面或显示详细内容。",
				confirmText: "我知道了",
				showCancel: false,
			});
		},

		showPrivacyPolicy() {
			uni.showModal({
				title: "隐私政策",
				content: "这里是隐私政策内容，实际使用时应该跳转到完整的隐私政策页面或显示详细内容。",
				confirmText: "我知道了",
				showCancel: false,
			});
		},
	},
};
</script>

<style lang="scss" scoped>
/* 移除所有样式，专注功能实现 */
</style>
