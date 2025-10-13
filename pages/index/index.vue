<template>
	<!-- 搜索组件吸顶 -->
	<SearchComponent from="index" />

	<!-- 主容器 -->
	<view class="container">
		<!-- 轮播图组件 -->
		<CarouselComponent v-if="!searchStore.showSearchPanel" />
		<!-- 品牌组件 -->
		<BrandsComponent v-if="!searchStore.showSearchPanel" />
	</view>

    <!-- 悬浮按钮 - 简化测试版本 -->
    <view class="simple-floating-button" @click="handleFloatingButtonClick">
      <uv-icon
        name="server-man"
        size="28"
        color="#fff"
      />
    </view>

    <CustomTabBar />
	<!-- 全局Loading组件 -->
	<GlobalLoading />
</template>

<script setup>
import BrandsComponent from '@/components/BrandsComponent.vue'
import CarouselComponent from '@/components/CarouselComponent.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import GlobalLoading from '@/components/GlobalLoading.vue'
import SearchComponent from '@/components/SearchComponent.vue'
import { useAppStore, useConfigStore, useSearchStore, useTabBarStore, useUserStore } from '@/stores'
import { quickContactCustomerService } from '@/utils/customerServiceUtils.js'
import { hideTabSwitchLoading } from '@/utils/loadingUtils.js'
import { onHide, onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 定义组件名称
defineOptions({
	name: 'IndexPage'
})

// 获取 stores
const searchStore = useSearchStore()
const appStore = useAppStore()
const configStore = useConfigStore()
const userStore = useUserStore()
const tabBarStore = useTabBarStore()

// 下拉刷新状态
const isRefreshing = ref(false)

// 初始化数据的方法
const initData = async () => {
	try {
		// 优先加载配置信息
		if (!configStore.isConfigLoaded) {
			await configStore.fetchConfig()
		}

		if (userStore.isLoggedIn && userStore.userInfo && userStore.userInfo.status === 1) {
            tabBarStore.setUserType('admin')
		} else if (userStore.isLoggedIn && userStore.userInfo && userStore.userInfo.status === 0) {
			tabBarStore.setUserType('normal')
        } else {
            tabBarStore.setUserType('anonymous')
        }
		await appStore.initApp()
	} catch (error) {
		uni.showToast({
			title: '数据加载失败',
			icon: 'none'
		})
	}
}

// 下拉刷新处理函数
const handleRefresh = async () => {
	if (isRefreshing.value) return

	isRefreshing.value = true
	try {
		await initData()

		uni.showToast({
			title: '刷新成功',
			icon: 'success',
			duration: 1000
		})
	} catch (error) {
		console.error('刷新失败:', error)
		uni.showToast({
			title: '刷新失败，请重试',
			icon: 'none'
		})
	} finally {
		isRefreshing.value = false
		uni.stopPullDownRefresh()
	}
}

// 悬浮按钮点击处理
const handleFloatingButtonClick = () => {
	console.log('客服悬浮按钮被点击')
	// 调用公共客服工具函数
	quickContactCustomerService()
}

// 角色切换方法
const switchRole = (role) => {
	tabBarStore.setUserType(role)
	uni.showToast({
		title: `已切换到${tabBarStore.userTypeText}`,
		icon: 'success'
	})
}

// 页面生命周期 - onLoad
onLoad(async () => {
	await initData()
})

// 下拉刷新生命周期
onPullDownRefresh(() => {
	handleRefresh()
})

onShow(() => {
    searchStore.setKeyword('')
	// 设置当前页面的tabBar状态
	tabBarStore.setActiveTab('index')
	// 隐藏tab切换loading
	hideTabSwitchLoading()
})

onHide(() => {
})


</script>

<style lang="scss">

.container {
	height: 100vh;
	padding: 20px;
	padding-top: calc(20px + env(safe-area-inset-top));
	padding-bottom: calc(20px + 50px + env(safe-area-inset-bottom)); /* 为tabbar预留空间 */
	background-color: #f8f8f8;
	box-sizing: border-box;
	overflow-y: auto;
}

// 客服悬浮按钮样式
.simple-floating-button {
	position: fixed;
	bottom: 200rpx;
	right: 30rpx;
	width: 80rpx;
	height: 80rpx;
	background-color: #e85a4f;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	box-shadow: 0 6rpx 20rpx rgba(232, 90, 79, 0.3);
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 15rpx rgba(232, 90, 79, 0.4);
	}
}
</style>
