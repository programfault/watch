<template>
	<view class="custom-tabbar">
		<view class="tabbar-content">
			<view
				v-for="tab in tabBarStore.tabList"
				:key="tab.name"
				class="tabbar-item"
				:class="{ 'active': tabBarStore.activeTab === tab.name }"
				@tap="handleTabChange(tab.name)"
			>
				<uv-icon
					:name="mapIcon(tab.icon)"
					:color="tabBarStore.activeTab === tab.name ? '#D81E06' : '#7d7e80'"
					size="22"
				/>
				<text
					class="tabbar-text"
					:style="{ color: tabBarStore.activeTab === tab.name ? '#D81E06' : '#7d7e80' }"
				>
					{{ tab.text }}
				</text>
			</view>
		</view>
		<!-- 安全区域填充 -->
		<view class="safe-area-bottom" :style="{ height: safeBottom + 'px' }"></view>
	</view>
</template>

<script setup>
import { useTabBarStore } from '@/stores'
import { nextTick, onMounted, ref } from 'vue'

// 定义组件名称（可选）
defineOptions({
	name: 'CustomTabBar'
})

// 获取 tabBar store
const tabBarStore = useTabBarStore()

// 安全区域高度
const safeBottom = ref(0)

// 计算当前激活标签的索引
// const activeTabIndex = computed(() => {
// 	const index = tabBarStore.tabList.findIndex(tab => tab.name === tabBarStore.activeTab)
// 	console.log('🏷️ 当前激活标签索引:', index, '对应标签:', tabBarStore.activeTab)
// 	return index >= 0 ? index : 0
// })

// 图标映射函数 - 适配uv-ui的图标名称
const mapIcon = (storeIcon) => {
	const iconMap = {
		'home-o': 'home',
		'service-o': 'setting',
		'contacts-o': 'integral',
		'diamond-o': 'star',
		'account': 'account',
		'user-o': 'account',
	}
	return iconMap[storeIcon] || storeIcon.replace('-o', '')
}

// 处理标签切换事件
const handleTabChange = (name) => {
	console.log('🏷️ 标签切换到:', name)
	const selectedTab = tabBarStore.tabList.find(tab => tab.name === name)
	if (selectedTab && selectedTab.path) {
		// 如果切换到的不是当前激活的tab，才显示loading
		if (tabBarStore.activeTab !== name) {
			tabBarStore.switchTabWithLoading(selectedTab.name)
		}
	} else {
		console.warn('🏷️ 标签没有路径:', selectedTab?.name)
	}
}

// 初始化函数
const initTabBar = async () => {
	try {
		// 确保tabBarStore已正确初始化
		if (!tabBarStore || !tabBarStore.tabList) {
			console.warn('🏷️ TabBar store 未正确初始化')
			return
		}

		// 如果没有设置activeTab，默认设置为首页
		if (!tabBarStore.activeTab) {
			tabBarStore.setActiveTab('home')
		}

		// 等待下一个tick后再处理页面路径
		await nextTick()

		// 根据当前页面路径自动设置激活标签
		const pages = getCurrentPages()
		if (pages && pages.length > 0) {
			const currentPage = pages[pages.length - 1]
			if (currentPage && currentPage.route) {
				const currentRoute = '/' + currentPage.route
				console.log('🏷️ 当前页面路径:', currentRoute)
				tabBarStore.setActiveTabByPath(currentRoute)
			} else {
				console.warn('🏷️ 当前页面信息不完整:', currentPage)
			}
		} else {
			console.warn('🏷️ 无法获取页面栈信息')
		}
	} catch (error) {
		console.error('🏷️ TabBar 初始化失败:', error)
	}
}

// 获取安全区域高度
const getSafeAreaHeight = () => {
	try {
		// 使用新的API获取设备信息和窗口信息
		const deviceInfo = uni.getDeviceInfo ? uni.getDeviceInfo() : {}
		const windowInfo = uni.getWindowInfo ? uni.getWindowInfo() : {}

		// 微信小程序中，安全区域底部高度
		if (deviceInfo.platform === 'ios' && windowInfo.safeAreaInsets) {
			safeBottom.value = windowInfo.safeAreaInsets.bottom || 0
		} else if (windowInfo.safeArea) {
			// 兼容旧版本，使用safeArea计算
			const screenHeight = windowInfo.screenHeight || windowInfo.windowHeight || 0
			const safeAreaBottom = windowInfo.safeArea ? windowInfo.safeArea.bottom : screenHeight
			safeBottom.value = Math.max(0, screenHeight - safeAreaBottom)
		} else {
			safeBottom.value = 0
		}
	} catch (error) {
		console.warn('获取安全区域高度失败，使用默认值:', error)
		safeBottom.value = 0
	}
}

// 组件挂载时的初始化
onMounted(() => {
	getSafeAreaHeight()
	initTabBar()
})
</script>

<style lang="scss" scoped>
.custom-tabbar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 1000;
	background-color: #fff;
	border-top: 1rpx solid #e4e7ed;

	.tabbar-content {
		display: flex;
		flex-direction: row;
		height: 100rpx;

		.tabbar-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 10rpx 0;
			transition: all 0.3s ease;

			&:active {
				background-color: #f7f8fa;
			}

			.tabbar-text {
				font-size: 20rpx;
				margin-top: 6rpx;
				line-height: 1;
			}
		}
	}

	.safe-area-bottom {
		background-color: #fff;
	}
}

/* 为页面内容添加底部padding，避免被tabbar遮挡 */
:global(.container) {
	padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}
</style>
