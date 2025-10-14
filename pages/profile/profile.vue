<template>
	<view class="container">
		<!-- 个人信息内容 -->
		<view class="profile-content">
			<view class="user-info">
				<view class="user-content">
                    <view class="user-name">
                        <text class="name-text shimmer" v-if="userStore.isLoggedIn">天辰表友</text>
                        <text class="name-text" v-else>匿名用户</text>
                        <!-- 如果用户已登录 -->
                        <template v-if="userStore.isLoggedIn">
                            <!-- 有手机号显示VIP，没有手机号显示未绑定 -->
                            <uv-badge type="warning " value="VIP" v-if="userInfo.phone"></uv-badge>
                            <view class="badge-clickable" v-else @click="showBindPhonePopup">
                                <uv-badge type="error" value="未绑定"></uv-badge>
                            </view>
                            <!-- 调试信息 -->
                            <!-- <text style="font-size: 12px; color: #999;">DEBUG: phone={{ userInfo.phone || '无' }}</text> -->
                        </template>
                    </view>
                    <view class="user-stats">
                        <view class="stat-item">
                            <text class="stat-value">会员卡号</text>
                            <text class="stat-label" v-if="userStore.isLoggedIn && cardNumber">{{ cardNumber }}</text>
                            <text class="stat-label placeholder" v-else>--</text>
                        </view>
                        <view class="stat-divider"></view>
                        <view class="stat-item">
                            <text class="stat-value gold">积分余额</text>
                            <text class="stat-label" v-if="userStore.isLoggedIn && userInfo.points !== undefined">{{ userPoints }}</text>
                            <text class="stat-label placeholder" v-else>--</text>
                        </view>
                    </view>
				</view>
			</view>

			<!-- 功能菜单 -->
			<view class="menu-section">
				<view class="menu-item" @click="goToBenefits">
					<view class="menu-item-content">
						<uv-icon name="gift" size="20" color="#ff6b35"></uv-icon>
						<text class="menu-text">福利中心</text>
					</view>
					<uv-icon name="arrow-right" size="16" color="#ccc"></uv-icon>
				</view>

				<view class="menu-item" @click="goToFavorites">
					<view class="menu-item-content">
						<uv-icon name="heart" size="20" color="#666"></uv-icon>
						<text class="menu-text">我的收藏</text>
					</view>
					<uv-icon name="arrow-right" size="16" color="#ccc"></uv-icon>
				</view>

				<view class="menu-item" @click="goToSettings">
					<view class="menu-item-content">
						<uv-icon name="setting" size="20" color="#666"></uv-icon>
						<text class="menu-text">设置</text>
					</view>
					<uv-icon name="arrow-right" size="16" color="#ccc"></uv-icon>
				</view>
			</view>

			<!-- 登录按钮区域 -->
			<view class="login-section" v-if="!userStore.isLoggedIn">
				<button
					class="wechat-login-btn"
					@click="performLogin"
					:disabled="userInfoLoading"
				>
					<uv-loading-icon
						v-if="userInfoLoading"
						color="#fff"
						size="18"
						style="margin-right: 12px;"
					></uv-loading-icon>
					<uv-icon
						v-else
						name="account"
						size="18"
						color="#fff"
						style="margin-right: 12px;"
					></uv-icon>
					<text>{{ userInfoLoading ? '登录中...' : '立即登录' }}</text>
				</button>
			</view>
		</view>

		<!-- 底部标签栏组件 -->
		<CustomTabBar />
		<!-- 全局Loading组件 -->
		<GlobalLoading />

		<!-- 绑定手机号弹窗 -->
		<uni-popup
			ref="bindPhonePopup"
			type="bottom"
			background-color="#fff"
			:mask-click="true"
			@maskClick="closeBindPhonePopup"
		>
			<view class="bind-phone-modal">
				<view class="modal-header">
					<text class="modal-title">绑定手机号</text>
					<uv-icon name="close" @click="closeBindPhonePopup" size="20" color="#999"></uv-icon>
				</view>
				<view class="modal-content">
					<text class="modal-desc">绑定手机号后可享受更多服务</text>
					<uv-input
						v-model="phoneNumber"
						placeholder="请输入手机号"
						type="number"
						maxlength="11"
						:border="true"
						:clearable="true"
						:error="phoneError"
						:error-message="phoneErrorMsg"
						@input="validatePhone"
					></uv-input>
				</view>
				<view class="modal-footer">
					<button class="cancel-btn" @click="closeBindPhonePopup">取消</button>
					<button
						class="confirm-btn"
						@click="bindPhone"
						:disabled="!isPhoneValid || bindingPhone"
					>
						{{ bindingPhone ? '绑定中...' : '确认绑定' }}
					</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import CustomTabBar from '@/components/CustomTabBar.vue'
import GlobalLoading from '@/components/GlobalLoading.vue'
import { useTabBarStore, useUserStore } from '@/stores'
import {
    getFormattedBrowsingHistory
} from '@/utils/browsingHistory.js'
import { hideTabSwitchLoading } from '@/utils/loadingUtils.js'
import { updateUserPhone } from '@/api/user.js'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, ref, nextTick } from 'vue'

// 定义组件名称
defineOptions({
	name: 'ProfilePage'
})

// 获取 stores
const userStore = useUserStore()
const tabBarStore = useTabBarStore()

// 响应式数据
const userInfoLoading = ref(false)

// 绑定手机号相关数据
const phoneNumber = ref('')
const phoneError = ref(false)
const phoneErrorMsg = ref('')
const bindingPhone = ref(false)

const userInfo = computed(() => {
	return userStore.userInfo || {}
})

// 从API获取卡号
const cardNumber = computed(() => {
	return userInfo.value.card_number || ''
})

// 从API获取积分
const userPoints = computed(() => {
	const points = userInfo.value.points
	// 如果 points 为 undefined 或 null，返回 0；否则返回实际值
	const actualPoints = points !== undefined && points !== null ? points : 0
	return actualPoints.toLocaleString()
})

// 手机号验证
const isPhoneValid = computed(() => {
	const phoneRegex = /^1[3-9]\d{9}$/
	return phoneRegex.test(phoneNumber.value)
})

// 执行登录
const performLogin = async () => {
	try {
		console.log('开始登录流程...')

		// 显示加载状态
		userInfoLoading.value = true

		// 执行 uni.login 获取 code
		const loginResult = await new Promise((resolve, reject) => {
			uni.login({
				provider: 'weixin',
				success: (res) => {
					if (res.code) {
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

		// 构建登录数据（不需要手机号授权，只用code）
		const loginData = {
			code: loginResult
		}

		console.log('发送登录请求到服务器...')

		// 调用用户store的登录方法
		const result = await userStore.loginUser(loginData)

		if (result) {
			console.log('登录成功:', result)
			uni.showToast({
				title: '登录成功',
				icon: 'success',
				duration: 1500
			})
		}

	} catch (error) {
		console.error('登录失败:', error)

		// 显示错误提示
		uni.showToast({
			title: '登录失败，请重试',
			icon: 'none',
			duration: 2000
		})

	} finally {
		userInfoLoading.value = false
	}
}

// 获取弹窗引用
const bindPhonePopup = ref(null)

// 显示绑定手机号弹窗
const showBindPhonePopup = () => {
	console.log('=== showBindPhonePopup 被调用 ===')
	console.log('当前登录状态:', userStore.isLoggedIn)
	console.log('用户信息:', userInfo.value)
	console.log('手机号:', userInfo.value?.phone)
	console.log('userStore.userInfo:', userStore.userInfo)
	console.log('userStore.userInfo.phone:', userStore.userInfo?.phone)

	phoneNumber.value = ''
	phoneError.value = false
	phoneErrorMsg.value = ''

	// 添加延迟以确保DOM已经更新
	nextTick(() => {
		if (bindPhonePopup.value) {
			console.log('弹窗引用存在，准备打开')
			bindPhonePopup.value.open()
			console.log('弹窗已调用open方法')
		} else {
			console.error('弹窗引用不存在，bindPhonePopup.value =', bindPhonePopup.value)
		}
	})
}

// 关闭绑定手机号弹窗
const closeBindPhonePopup = () => {
	console.log('关闭弹窗')
	if (bindPhonePopup.value) {
		bindPhonePopup.value.close()
	}
	phoneNumber.value = ''
	phoneError.value = false
	phoneErrorMsg.value = ''
}

// 验证手机号
const validatePhone = () => {
	const phone = phoneNumber.value.trim()
	if (!phone) {
		phoneError.value = false
		phoneErrorMsg.value = ''
		return
	}

	if (phone.length < 11) {
		phoneError.value = true
		phoneErrorMsg.value = '请输入11位手机号'
		return
	}

	const phoneRegex = /^1[3-9]\d{9}$/
	if (!phoneRegex.test(phone)) {
		phoneError.value = true
		phoneErrorMsg.value = '请输入正确的手机号格式'
		return
	}

	phoneError.value = false
	phoneErrorMsg.value = ''
}

// 绑定手机号
const bindPhone = async () => {
	if (!isPhoneValid.value) {
		uni.showToast({
			title: '请输入正确的手机号',
			icon: 'none'
		})
		return
	}

	try {
		bindingPhone.value = true

		console.log('开始绑定手机号:', phoneNumber.value)

		// 调用更新手机号API
		const result = await updateUserPhone({
			phone: phoneNumber.value
		})

		console.log('手机号绑定成功:', result)

		// 立即更新 store 中的用户信息，确保 UI 响应式更新
		if (result.data && result.data.new_phone) {
			userStore.updateUserInfo({
				phone: result.data.new_phone
			})
		} else {
			// 如果 API 响应格式不包含 new_phone，直接使用输入的手机号
			userStore.updateUserInfo({
				phone: phoneNumber.value
			})
		}

		// 显示成功提示
		uni.showToast({
			title: result.message || '绑定成功',
			icon: 'success',
			duration: 2000
		})

		closeBindPhonePopup()

		// 异步刷新完整的用户信息（从服务器获取最新数据）
		if (userStore.isLoggedIn) {
			userStore.fetchUserInfo().catch(error => {
				console.error('刷新用户信息失败:', error)
				// 即使刷新失败，UI 也已经通过 updateUserInfo 更新了
			})
		}

	} catch (error) {
		console.error('绑定手机号失败:', error)

		// 根据不同的错误码显示不同的提示
		let errorMessage = '绑定失败，请重试'

		if (error.code === 409) {
			errorMessage = '该手机号已被其他用户使用'
		} else if (error.code === 422) {
			errorMessage = '请输入正确的手机号码格式'
		} else if (error.code === 401) {
			errorMessage = '请先登录'
		} else if (error.message) {
			errorMessage = error.message
		}

		uni.showToast({
			title: errorMessage,
			icon: 'none',
			duration: 2500
		})
	} finally {
		bindingPhone.value = false
	}
}

// 检查登录状态
const checkLoginAndRedirect = () => {
	// 这里只是检查，不做跳转，因为我们现在支持未登录状态的下拉刷新
	return true
}

// 页面生命周期 - onLoad
onLoad(async () => {
	console.log('Profile页面 onLoad')
	userInfoLoading.value = true

	try {
		// 测试浏览记录工具函数
		const recentHistory = getFormattedBrowsingHistory(3)
		console.log('最近浏览记录:', recentHistory)
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

	// 设置当前页面的tabBar状态
	tabBarStore.setActiveTab('profile')

	// 如果已登录，自动刷新用户信息
	if (userStore.isLoggedIn) {
		console.log('用户已登录，刷新用户信息')
		userStore.fetchUserInfo()
	}

	// 隐藏tab切换loading
	hideTabSwitchLoading()
})



// 跳转到设置页面
const goToSettings = () => {
	console.log('跳转到设置页面')
	uni.navigateTo({
		url: '/pages/settings/settings'
	})
}

// 跳转到福利中心页面
const goToBenefits = () => {
	console.log('跳转到福利中心页面')

	// 检查用户是否已登录
	if (!userStore.isLoggedIn) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		return
	}

	// 从userInfo中获取用户ID并传递
	const userId = userInfo.value.id
	console.log('传递的用户ID:', userId, '用户信息:', userInfo.value)

	// 确保用户数据完整（包含福利信息）
	if (!userInfo.value.coupons && !userInfo.value.privileges) {
		console.log('用户信息中缺少福利数据，可能需要刷新')
	}

	uni.navigateTo({
		url: `/pages/benefits/benefits?userId=${userId}`
	})
}

// 跳转到收藏页面
const goToFavorites = () => {
	console.log('跳转到收藏页面')
	uni.navigateTo({
		url: '/pages/favorites/favorites'
	})
}
</script>

<style lang="scss" src="./profile.scss"></style>

<style lang="scss" scoped>
.badge-clickable {
	display: inline-block;
	cursor: pointer;

	&:active {
		opacity: 0.7;
	}
}

.bind-phone-modal {
	width: 100vw;
	background: white;
	padding: 20px;
	margin-bottom: 100px; /* 为tabbar留出空间 */
	border-radius: 12px 12px 0 0;
	box-shadow: none;
	border-top: 1px solid #f0f0f0;
	box-sizing: border-box;

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		padding-bottom: 16px;
		border-bottom: 1px solid #f0f0f0;

		.modal-title {
			font-size: 18px;
			font-weight: 600;
			color: #333;
		}
	}

	.modal-content {
		margin-bottom: 32px;

		.modal-desc {
			display: block;
			font-size: 14px;
			color: #666;
			margin-bottom: 20px;
		}
	}

	.modal-footer {
		display: flex;
		gap: 16px;
		padding-top: 16px;
		width: 100%;

		.cancel-btn, .confirm-btn {
			flex: 1;
			padding: 14px 0;
			border-radius: 12px;
			font-size: 16px;
			font-weight: 500;
			border: none;
			min-width: 0;
			box-sizing: border-box;

			&::after {
				border: none;
			}
		}

		.cancel-btn {
			background: #f5f5f5;
			color: #666;

			&:active {
				background: #e5e5e5;
			}
		}

		.confirm-btn {
			background: #07c160;
			color: white;

			&:active:not(:disabled) {
				background: #06ad56;
			}

			&:disabled {
				background: #9dd2b4;
				opacity: 0.6;
			}
		}
	}
}
</style>
