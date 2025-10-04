<template>
	<scroll-view
		class="container-scroll"
		scroll-y
		refresher-enabled
		:refresher-triggered="isRefreshing"
		@refresherrefresh="onRefresh"
		@refresherrestore="onRefreshRestore"
	>
		<view class="container">
			<!-- 搜索组件 -->
			<HomeSearchComponent from="home" />

			<!-- 轮播图组件 -->
			<CarouselComponent v-if="!searchStore.showSearchPanel" />

			<!-- 品牌组件 -->
			<BrandsComponent v-if="!searchStore.showSearchPanel" />

			<!-- 底部标签栏组件 -->

		<!-- 客服按钮 -->
        <!-- <view class="container">
            <button @click="openCustomerService">联系客服</button>
        </view> -->

		<!-- 悬浮扫一扫按钮 - 仅管理员可见 -->
		<view
			v-if="userStore.isLoggedIn && userStore.isAdmin"
			class="floating-scan-btn"
			@click="handleFloatingScan"
		>
				<uni-icons type="scan" size="28" color="#fff"></uni-icons>
			</view>
		</view>
	</scroll-view>
    <CustomTabBar />
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { onLoad, onShow, onHide, onPullDownRefresh } from '@dcloudio/uni-app'
import BrandsComponent from '@/components/BrandsComponent.vue'
import CarouselComponent from '@/components/CarouselComponent.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import HomeSearchComponent from '@/components/HomeSearchComponent.vue'
import { useAppStore, useSearchStore, useTabBarStore, useUserStore } from '@/stores'
import ScanUtils from '@/utils/scanUtils.js'

// 定义组件名称
defineOptions({
	name: 'IndexPage'
})

// 获取 stores
const searchStore = useSearchStore()
const appStore = useAppStore()
const userStore = useUserStore()
const tabBarStore = useTabBarStore()

// 下拉刷新相关
const isRefreshing = ref(false)

// 初始化数据的方法
const initData = async () => {
	try {
		if (userStore.isLoggedIn && userStore.userInfo && userStore.userInfo.status === 1) {
            tabBarStore.setUserType('admin')
		} else {
			tabBarStore.setUserType('normal')
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
	isRefreshing.value = false
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
})

onHide(() => {
})
// 打开客服
const openCustomerService = () => {
	const customerServiceId = "ww17da4a406b6bf90b"
	uni.openCustomerServiceChat({
		extInfo: {
			url: `https://work.weixin.qq.com/kfid/kfc222a4433ef7716d7`
		},
		corpId: customerServiceId,
		success: (res) => {
			console.log('客服聊天打开成功:', res)
		},
		fail: (err) => {
			console.error('客服聊天打开失败:', err)
			// 失败时提供备用方案
			uni.showModal({
				title: '客服提示',
				content: '无法打开客服聊天，请联系客服微信：' + customerServiceId,
				showCancel: false
			})
		}
	})
}
</script>

<style lang="scss">
.container-scroll {
	height: 100vh;
	width: 100%;
}

.container {
	padding: 20px;
	min-height: 100vh;
	background-color: #f8f8f8;
}
</style>
