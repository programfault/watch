<template>
	<view class="login-container">
		<!-- 背景装饰 -->
		<view class="bg-decoration">
			<view class="circle circle-1"></view>
			<view class="circle circle-2"></view>
			<view class="circle circle-3"></view>
		</view>

		<!-- 登录头部 -->
		<view class="login-header">
			<!-- <view class="logo-wrapper">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
				<view class="logo-glow"></view>
			</view> -->
			<text class="app-name">天辰表行</text>
			<text class="welcome-text">专业手表服务平台</text>
			<text class="sub-text">欢迎回来，请登录您的账户</text>
		</view>

		<!-- 登录表单 -->
		<view class="login-form">
			<view class="form-card">
				<!-- 用户协议和隐私政策 -->
				<view class="agreement-section">
					<view class="agreement-checkbox" @click="toggleAgreement">
						<view class="checkbox" :class="{ checked: isAgreed }">
							<uni-icons v-if="isAgreed" type="checkmarkempty" size="14" color="#fff"></uni-icons>
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
					:class="{ disabled: !isAgreed }"
					open-type="getPhoneNumber"
					@getphonenumber="handleGetPhoneNumber"
					:disabled="!isAgreed"
				>
					<uv-icon name="weixin-circle-fill" size="20" color="#fff"></uv-icon>
					<text class="btn-text">微信一键登录</text>
				</button>

				<!-- 手机号已绑定提示 -->
                <view v-if="userStore.isLoggedIn && userStore.userInfo?.phone" class="phone-status">
                    <uv-icon name="checkmark" size="16" color="#52c41a"></uv-icon>
                    <text class="phone-text">手机号已绑定：{{ userStore.userInfo.phone }}</text>
                </view>
                <!-- 安全提示 -->
				<view class="security-tips">
					<uni-icons type="info" size="14" color="#999"></uni-icons>
					<text class="tips-text">我们会保护您的隐私信息安全</text>
				</view>
			</view>
		</view>

		<!-- 调试入口 -->
		<view class="debug-entry" @click="goToDebug">
			<uni-icons type="gear" size="14" color="rgba(255,255,255,0.8)"></uni-icons>
			<text class="debug-text">调试</text>
		</view>
	</view>
</template>

<script setup>
import { useTabBarStore } from '@/stores/tabBar'
import { useUserStore } from '@/stores/user'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

// 定义组件名称
defineOptions({
	name: 'LoginPage'
})

// 获取 stores
const userStore = useUserStore()
const tabbarStore = useTabBarStore()
// 响应式数据
const isAgreed = ref(false)
const userProfileData = ref(null)
const hasLogin = ref(false)
const code = ref('')
const redirectUrl = ref('/pages/profile/profile') // 默认返回地址

// 计算属性
const loginLoading = computed(() => {
	return userStore.loginLoading
})

// 页面生命周期 - onLoad
onLoad(async (options) => {
	console.log('登录页面加载，参数:', options)

	// 如果已经登录，显示提示
	if (userStore.isLoggedIn) {
		console.log('用户已登录')
		uni.showToast({
			title: '您已登录',
			icon: 'success'
		})
	}

	// 获取登录code
	try {
		await getLoginCode()
	} catch (error) {
		console.error('页面加载时获取登录code失败:', error)
	}
})

// 获取登录code
const getLoginCode = () => {
	return new Promise((resolve, reject) => {
		uni.login({
			provider: 'weixin',
			success: (res) => {
				if (res.code) {
					code.value = res.code
					hasLogin.value = true
					console.log('获取登录code成功:', res.code)
					resolve(res.code)
				} else {
					console.error('获取login code失败：', res.errMsg)
					reject(new Error(res.errMsg || '获取登录code失败'))
				}
			},
			fail: (err) => {
				console.error('uni.login失败：', err)
				reject(err)
			}
		})
	})
}

// 切换协议同意状态
const toggleAgreement = () => {
	isAgreed.value = !isAgreed.value
}

// 处理获取手机号
const handleGetPhoneNumber = async (e) => {
	console.log('手机号授权回调:', e)

	// 检查是否同意用户协议
	if (!isAgreed.value) {
		uni.showToast({
			title: '请先同意用户协议和隐私政策',
			icon: 'none',
			duration: 2000
		})
		return
	}

	// 检查授权结果
	if (e.detail.errMsg && e.detail.errMsg.includes('deny')) {
		uni.showToast({
			title: '您拒绝了手机号授权',
			icon: 'none',
			duration: 2000
		})
		return
	}

	// 检查是否获取到加密数据
	const { encryptedData, iv } = e.detail
	if (!encryptedData || !iv) {
		uni.showToast({
			title: '获取手机号信息失败',
			icon: 'none',
			duration: 2000
		})
		return
	}

	// 检查登录code是否存在
	if (!code.value) {
		uni.showToast({
			title: '登录状态异常，正在重新获取...',
			icon: 'none'
		})
		try {
			await getLoginCode()
		} catch (error) {
			uni.showToast({
				title: '获取登录信息失败，请重试',
				icon: 'none',
				duration: 2000
			})
			return
		}
	}

	try {
		// 显示加载提示
		uni.showLoading({
			title: '登录中...',
			mask: true
		})

		console.log('准备发送登录数据给后端')

		// 构建登录数据
		const loginData = {
			code: code.value,
			encryptedData: encryptedData,
			iv: iv,
			userProfile: userProfileData.value
		}

		// 调用登录接口
		const result = await userStore.loginUser(loginData)

		if (result) {
			console.log('登录成功:', result)
            console.log("==========================================");
            tabbarStore.setUserType("admin")
			// 显示成功提示
			uni.showToast({
				title: '登录成功',
				icon: 'success',
				duration: 1500
			})

			// 延迟跳转到个人中心
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/profile/profile'
				})

			}, 1500)
		}
	} catch (error) {
		console.error('登录失败:', error)

		// 显示错误提示
		const errorMessage = error.message || '登录失败，请重试'
		uni.showToast({
			title: errorMessage,
			icon: 'none',
			duration: 2000
		})

		// 如果是code过期或无效，重新获取
		if (errorMessage.includes('code') || errorMessage.includes('过期')) {
			code.value = ''
			hasLogin.value = false
			getLoginCode()
		}
	} finally {
		// 隐藏加载提示
		uni.hideLoading()
	}
}

// 显示用户协议
const showUserAgreement = () => {
	uni.navigateTo({
        url: '/pages/agreement/agreement'
    })
}

// 显示隐私政策
const showPrivacyPolicy = () => {
	uni.navigateTo({
        url: '/pages/privacy/privacy'
    })
}

// 进入调试页面
const goToDebug = () => {
	uni.navigateTo({
		url: '/pages/debug/debug'
	})
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
	position: relative;
	overflow: hidden;
}

// 背景装饰
.bg-decoration {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	pointer-events: none;
	z-index: 0;

	.circle {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);

		&.circle-1 {
			width: 200px;
			height: 200px;
			top: -100px;
			right: -100px;
			animation: float 6s ease-in-out infinite;
		}

		&.circle-2 {
			width: 150px;
			height: 150px;
			bottom: -75px;
			left: -75px;
			animation: float 8s ease-in-out infinite reverse;
		}

		&.circle-3 {
			width: 100px;
			height: 100px;
			top: 50%;
			left: -50px;
			animation: float 7s ease-in-out infinite;
		}
	}
}

.login-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 60px;
	z-index: 1;

	.logo-wrapper {
		position: relative;
		margin-bottom: 24px;

		.logo {
			width: 100px;
			height: 100px;
			border-radius: 24px;
			background: rgba(255, 255, 255, 0.15);
			padding: 16px;
			backdrop-filter: blur(10px);
			border: 1px solid rgba(255, 255, 255, 0.2);
		}

		.logo-glow {
			position: absolute;
			top: -4px;
			left: -4px;
			right: -4px;
			bottom: -4px;
			border-radius: 28px;
			background: linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
			z-index: -1;
			animation: glow 2s ease-in-out infinite alternate;
		}
	}

	.app-name {
		font-size: 32px;
		font-weight: 700;
		color: white;
		margin-bottom: 8px;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	.welcome-text {
		font-size: 16px;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 4px;
		font-weight: 500;
	}

	.sub-text {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.7);
	}
}

.login-form {
	width: 100%;
	max-width: 350px;
	z-index: 1;

	.form-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 20px;
		padding: 32px 24px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}
}

.agreement-section {
	margin-bottom: 24px;

	.agreement-checkbox {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		cursor: pointer;

		.checkbox {
			width: 20px;
			height: 20px;
			border: 2px solid #d1d5db;
			border-radius: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s ease;
			flex-shrink: 0;
			margin-top: 2px;

			&.checked {
				background: linear-gradient(135deg, #667eea, #764ba2);
				border-color: #667eea;
			}
		}

		.agreement-text {
			flex: 1;
			font-size: 14px;
			color: #6b7280;
			line-height: 1.5;

			.link-text {
				color: #667eea;
				font-weight: 500;
			}
		}
	}
}

.phone-btn {
	width: 100%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	border: none;
	border-radius: 12px;
	padding: 16px;
	font-size: 16px;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	margin-bottom: 16px;
	transition: all 0.3s ease;
	box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);

	&:not(.disabled):active {
		transform: translateY(1px);
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
	}

	&.disabled {
		opacity: 0.5;
		background: #9ca3af;
		box-shadow: none;
	}

	&::after {
		border: none;
	}

	.btn-text {
		color: white;
		font-size: 16px;
		font-weight: 600;
	}
}

.phone-status {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px;
	background: rgba(82, 196, 26, 0.1);
	border-radius: 8px;
	margin-bottom: 16px;

	.phone-text {
		font-size: 14px;
		color: #52c41a;
	}
}

.security-tips {
	display: flex;
	align-items: center;
	gap: 6px;
	justify-content: center;

	.tips-text {
		font-size: 12px;
		color: #9ca3af;
	}
}

.debug-entry {
	position: fixed;
	bottom: 40px;
	right: 20px;
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(10px);
	padding: 8px 12px;
	border-radius: 20px;
	display: flex;
	align-items: center;
	gap: 6px;
	z-index: 999;

	.debug-text {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.8);
	}
}

// 动画
@keyframes float {
	0%, 100% {
		transform: translateY(0px);
	}
	50% {
		transform: translateY(-20px);
	}
}

@keyframes glow {
	0% {
		opacity: 0.5;
		transform: scale(1);
	}
	100% {
		opacity: 0.8;
		transform: scale(1.05);
	}
}
</style>
