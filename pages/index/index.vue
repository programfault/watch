<template>
	<!-- 搜索框吸顶 -->
	<uv-sticky :offset-top="0">
		<view class="search-box">
			<uv-search
				placeholder="搜索品牌、手表、服务..."
				v-model="searchKeyword"
				:showAction="true"
				actionText="搜索"
				:animation="true"
				shape="square"
				bgColor="#ffffff"
				@focus="onSearchFocus"
				@clear="onSearchClear"
				@search="onSearch"
				@custom="onSearchAction"
				@change="onSearchInput"
			></uv-search>
		</view>
	</uv-sticky>

	<!-- 主容器 -->
	<view class="container">
		<!-- 轮播图组件 -->
		<CarouselComponent/>
		<!-- 品牌组件 -->
		<BrandsComponent />
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
import { useAppStore, useConfigStore, useSearchStore, useTabBarStore, useUserStore } from '@/stores'
import { quickContactCustomerService } from '@/utils/customerServiceUtils.js'
import { hideTabSwitchLoading } from '@/utils/loadingUtils.js'
import { onHide, onLoad, onShow } from '@dcloudio/uni-app'
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

// 搜索相关响应式数据
const searchKeyword = ref('')

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

// 搜索相关方法
const onSearchFocus = () => {
	console.log('搜索框获得焦点')
}

const onSearchClear = () => {
	searchKeyword.value = ''
	searchStore.clearResults()
}

const onSearch = (value) => {
	const keyword = value || searchKeyword.value
	if (!keyword || !keyword.trim()) {
		uni.showToast({
			title: '请输入搜索关键词',
			icon: 'none'
		})
		return
	}

	// 添加到搜索历史
	searchStore.addToHistory(keyword)

	// 跳转到产品列表页面
	uni.navigateTo({
		url: `/pages/product/list?keyword=${encodeURIComponent(keyword)}`
	})
}

const onSearchAction = () => {
	onSearch(searchKeyword.value)
}

const onSearchInput = (value) => {
	searchKeyword.value = value
	searchStore.setKeyword(value)
}

// 页面生命周期 - onLoad
onLoad(async () => {
	await initData()
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

// 搜索框样式
.search-box {
	margin-top: 0;
	margin-bottom: 10px;
	max-width: 700px;
	margin-left: auto;
	margin-right: auto;
	width: 100%;
	box-sizing: border-box;
	padding-left: 16px;
	padding-right: 16px;
	background-color: #f8f8f8;
	padding-top: 10px;
	padding-bottom: 10px;
}

.container {
	min-height: 100vh;
	padding: 20px;
	padding-bottom: calc(20px + 50px + env(safe-area-inset-bottom)); /* 为tabbar预留空间 */
	background-color: #f8f8f8;
	box-sizing: border-box;
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
