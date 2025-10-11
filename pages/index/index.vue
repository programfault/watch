<template>
	   <!-- 搜索组件吸顶，放在scroll-view外部 -->
	   <SearchComponent from="index" />

	   <scroll-view
		   class="container-scroll"
		   scroll-y
		   refresher-enabled
		   :refresher-threshold="80"
		   refresher-default-style="none"
		   :refresher-triggered="isRefreshing"
		   @refresherrefresh="onRefresh"
		   @refresherrestore="onRefreshRestore"
		   @refresherpulling="onRefresherPulling"
		   @refresherabort="onRefresherAbort"
	   >
		   <!-- 自定义下拉刷新内容 -->
		   <view slot="refresher" class="custom-refresher">
			   <view v-if="!isRefreshing" class="pull-tips">
				   <uv-icon
					   name="arrow-down"
					   size="20"
					   color="#999"
					   :class="{ 'icon-rotate': isPulling }"
				   />
				   <text v-if="!isPulling" class="tip-text">下拉刷新数据</text>
				   <text v-else class="tip-text tip-release">松手立即刷新</text>
			   </view>
			   <view v-else class="refreshing-tips">
				   <uv-icon name="loading" size="20" color="#007aff" />
				   <text class="tip-text refreshing">正在刷新...</text>
			   </view>
		   </view>
		   <view class="container main-content-with-search">
			   <!-- 轮播图组件 -->
			   <CarouselComponent v-if="!searchStore.showSearchPanel" />

			   <!-- 品牌组件 -->
			   <BrandsComponent v-if="!searchStore.showSearchPanel" />

			   <!-- 底部标签栏组件 -->

			   <!-- 客服按钮 -->
			   <!-- <view class="container">
				   <button @click="openCustomerService">联系客服</button>
			   </view> -->
		   </view>
	   </scroll-view>

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

// 下拉刷新相关
const isRefreshing = ref(false)
const pullDistance = ref(0)
const isPulling = ref(false)

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

// 下拉刷新处理
const onRefresh = async () => {
	isRefreshing.value = true
	try {
		await initData()

		uni.showToast({
			title: '刷新成功',
			icon: 'success'
		})
	} catch (error) {
		uni.showToast({
			title: '刷新失败',
			icon: 'none'
		})
	} finally {
		setTimeout(() => {
			isRefreshing.value = false
		}, 500)
	}
}

// 刷新状态恢复
const onRefreshRestore = () => {
	console.log('🔄 刷新状态恢复')
	isRefreshing.value = false
	pullDistance.value = 0
	isPulling.value = false
}

// 刷新中止事件
const onRefresherAbort = () => {
	console.log('❌ 刷新中止')
	isRefreshing.value = false
	pullDistance.value = 0
	isPulling.value = false
}

// 下拉距离监听
const onRefresherPulling = (e) => {
	console.log('🖼️ 下拉事件:', e)
	console.log('🖼️ e.detail:', e.detail)

	// 设置正在下拉状态
	isPulling.value = true

	// 尝试多种可能的参数格式
	const distance = e.detail?.deltaY || e.detail?.dy || e.detail?.distance || e.deltaY || 0
	console.log('🖼️ 解析到的距离:', distance)

	pullDistance.value = distance

	// 如果获取不到距离，使用简单的状态切换
	if (distance === 0) {
		// 延迟一点切换状态，模拟达到阈值
		setTimeout(() => {
			isPulling.value = true
		}, 300)
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

// 页面下拉刷新
onPullDownRefresh(async () => {
	try {
		await initData()
		uni.showToast({
			title: '刷新成功',
			icon: 'success'
		})
	} catch (error) {
		uni.showToast({
			title: '刷新失败',
			icon: 'none'
		})
	} finally {
		uni.stopPullDownRefresh()
	}
})

onShow(() => {
    searchStore.setKeyword('');
	// 隐藏tab切换loading
	hideTabSwitchLoading()
})

onHide(() => {
})


</script>

<style lang="scss">

.container-scroll {
	height: calc(100vh - env(safe-area-inset-top));
	width: 100%;
	box-sizing: border-box;
	margin-top: env(safe-area-inset-top);
}

// 让内容区顶部为搜索框预留空间，避免被遮挡
.main-content-with-search {
	padding: 20px;
	padding-top: 0;
	padding-bottom: calc(20px + env(safe-area-inset-bottom) + 50px); /* 为tabbar预留空间 */
	min-height: calc(100vh - 50px - env(safe-area-inset-bottom)); /* 减去tabbar和安全区域高度 */
	background-color: #f8f8f8;
	position: relative;
	box-sizing: border-box;
}

// 自定义下拉刷新样式
.custom-refresher {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 80px;
	width: 100%;
	position: relative;

	.pull-tips, .refreshing-tips {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;

		.tip-text {
			font-size: 14px;
			color: #999;
			transition: color 0.3s ease;

			&.tip-release {
				color: #007aff;
				font-weight: 600;
			}

			&.refreshing {
				color: #007aff;
				font-weight: 500;
			}
		}

		.icon-rotate {
			transform: rotate(180deg);
			transition: transform 0.3s ease;
		}
	}
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
