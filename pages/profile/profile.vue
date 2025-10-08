<template>
	<view class="container">
		<!-- 加载状态 -->
		<view v-if="userInfoLoading" class="loading">
			<uv-icon name="loading" size="30" color="#999"></uv-icon>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 个人信息内容 -->
		<scroll-view
			class="profile-scroll"
			scroll-y="true"
			enable-back-to-top="true"
		>
			<!-- 不使用下拉刷新功能，已移至福利中心页面 -->
			<view class="profile-content">
			<view class="user-info">
				<view class="user-content">
					<template v-if="userStore.isLoggedIn">
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
                    </template>
                    <template v-else>
                        <view class="not-login-card">
                        <view class="not-login-icon">
                            <uv-icon name="account" size="48" color="#c0c4cc" />
                        </view>
                        <text class="not-login-tip">您还未登录</text>
                        <button class="login-btn" @click="goToLogin">立即登录</button>
                        </view>
                    </template>
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

			</view>
		</scroll-view>

		<!-- 底部标签栏组件 -->
		<CustomTabBar />
	</view>
</template>

<script setup>
import CustomTabBar from '@/components/CustomTabBar.vue'
import { useTabBarStore, useUserStore } from '@/stores'
import {
    getFormattedBrowsingHistory
} from '@/utils/browsingHistory.js'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

// 定义组件名称
defineOptions({
	name: 'ProfilePage'
})

// 获取 stores
const userStore = useUserStore()
const tabBarStore = useTabBarStore()

// 响应式数据
const userInfoLoading = ref(false)

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

// 检查登录状态并跳转
const goToLogin = () => {
    uni.navigateTo({
        url: '/pages/login/login'
    })
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

	// 检查登录状态
	if (!checkLoginAndRedirect()) {
		return
	}
	// 设置当前页面的tabBar状态
	tabBarStore.setActiveTab('profile')
	// 页面显示，状态由Pinia自动管理
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
	// 从userInfo中获取用户ID并传递
	const userId = userInfo.value.id
	console.log('传递的用户ID:', userId)
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
