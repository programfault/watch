<template>
	<view class="container">
		<!-- 加载状态 -->
		<view v-if="userInfoLoading" class="loading">
			<uv-icon name="loading" size="30" color="#999"></uv-icon>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 个人信息内容（支持下拉刷新） -->
		<scroll-view
			class="profile-scroll"
			scroll-y="true"
			enable-back-to-top="true"
			refresher-enabled="true"
			:refresher-threshold="80"
			refresher-default-style="none"
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh"
			@refresherpulling="onRefresherPulling"
			@refresherrestore="onRefreshRestore"
		>
			<!-- 自定义下拉刷新内容 -->
			<view slot="refresher" class="custom-refresher">
				<view v-if="!isRefreshing" class="pull-tips">
					<uv-icon
						name="arrow-down"
						size="20"
						color="#999"
						:class="{ 'icon-rotate': pullDistance >= 80 }"
					/>
					<text v-if="userStore.isLoggedIn && pullDistance < 80" class="tip-text">下拉刷新信息</text>
					<text v-else-if="userStore.isLoggedIn && pullDistance >= 80" class="tip-text tip-release">松手立即刷新</text>
					<text v-else-if="!userStore.isLoggedIn && pullDistance < 80" class="tip-text">下拉去登录</text>
					<text v-else class="tip-text tip-release">松手去登录</text>
				</view>
				<view v-else class="refreshing-tips">
					<uv-icon name="loading" size="20" color="#007aff" />
					<text v-if="userStore.isLoggedIn" class="tip-text refreshing">正在刷新...</text>
				<text v-else class="tip-text refreshing">正在跳转...</text>
				</view>
			</view>
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

			<!-- 优惠券列表 -->
			<CouponList :coupons="coupons" />

			<!-- 特权列表 -->
			<PrivilegeList :privileges="privileges" />

			<!-- 功能菜单 -->
			<view class="menu-section">
				<view class="menu-item">
					<view class="menu-item-content">
						<uv-icon name="list" size="20" color="#666"></uv-icon>
						<text class="menu-text">浏览历史</text>
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
import CouponList from '@/components/CouponList.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import PrivilegeList from '@/components/PrivilegeList.vue'
import { useTabBarStore, useUserStore } from '@/stores'
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
const isRefreshing = ref(false)
const pullDistance = ref(0)

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
		if (!userStore.isLoggedIn) {
			// 未登录状态，跳转到登录页面
			console.log('未登录，跳转到登录页面')
			// 等待一下让用户看到动画
			await new Promise(resolve => setTimeout(resolve, 800))
			uni.navigateTo({
				url: '/pages/login/login'
			})
			return
		}
        console.log('已登录状态，刷新用户信息')
		// 已登录状态，刷新用户信息
		await userStore.fetchUserInfo()
        if(userStore.userInfo.status === 1){
            tabBarStore.setUserType('admin')
        } else {
            tabBarStore.setUserType('normal')
        }
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
		pullDistance.value = 0
	}
}

// 下拉距离监听
const onRefresherPulling = (e) => {
	pullDistance.value = e.detail.deltaY || 0
}

// 刷新状态恢复
const onRefreshRestore = () => {
	isRefreshing.value = false
	pullDistance.value = 0
}

// 跳转到设置页面
const goToSettings = () => {
	console.log('跳转到设置页面')
	uni.navigateTo({
		url: '/pages/settings/settings'
	})
}
</script>

<style lang="scss" src="./profile.scss"></style>
