<template>
	<view class="login-container">
		<view class="login-header">
			<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			<text class="app-name">手表助手</text>
			<text class="welcome-text">欢迎使用，请先登录</text>
		</view>

		<LoginComponent
			tip-text="请使用微信授权登录"
			@login-success="onLoginSuccess"
			@login-error="onLoginError"
		/>
	</view>
</template>

<script>
import LoginComponent from '@/components/LoginComponent.vue'
import { useUserStore } from '@/stores/user'

export default {
	components: {
		LoginComponent
	},
	data() {
		return {
			redirectUrl: '/pages/profile/profile' // 默认返回地址
		}
	},
	computed: {
		userStore() {
			return useUserStore()
		}
	},
	onLoad(options) {
		console.log('登录页面加载，参数:', options);
		// 如果已经登录，显示提示
		if (this.userStore.isLoggedIn) {
			console.log('用户已登录');
			uni.showToast({
				title: '您已登录',
				icon: 'success'
			});
		}
	},
	methods: {
		onLoginSuccess() {
			console.log('登录成功');
			// 登录成功后不需要跳转，让页面自然消失即可
			uni.showToast({
				title: '登录成功',
				icon: 'success'
			});
		},

		onLoginError(error) {
			console.error('登录失败:', error);
			uni.showToast({
				title: '登录失败，请重试',
				icon: 'error'
			});
		},


	}
}
</script>

<style lang="scss">
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 40px 20px;
}

.login-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 60px;

	.logo {
		width: 120px;
		height: 120px;
		border-radius: 20px;
		margin-bottom: 20px;
		background: rgba(255, 255, 255, 0.1);
		padding: 10px;
	}

	.app-name {
		font-size: 28px;
		font-weight: bold;
		color: white;
		margin-bottom: 10px;
	}

	.welcome-text {
		font-size: 16px;
		color: rgba(255, 255, 255, 0.8);
	}
}
</style>
