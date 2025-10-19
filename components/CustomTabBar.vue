<template>
	<view class="tabbar-container">
		<!-- Tab切换Loading组件 -->
		<TabSwitchLoading
			:loading="tabSwitchLoading"
			:loading-text="tabSwitchText"
			font-size="32rpx"
			icon-size="60rpx"
			bg-color="rgba(255, 255, 255, 0.95)"
			text-color="#333"
			loading-color="#007aff"
		/>

		<!-- 使用 uview-plus TabBar 组件 -->
		<u-tabbar
			:value="tabBarStore.activeTab"
			:placeholder="true"
			:border="true"
			@change="handleTabChange"
			:fixed="true"
			:safeAreaInsetBottom="true"
			activeColor="#D81E06"
			inactiveColor="#7d7e80"
			backgroundColor="#ffffff"
		>
			<!-- 首页 - 所有用户都可见 -->
			<u-tabbar-item
				name="home"
				text="首页"
				icon="home"
				v-if="['anonymous','normal', 'admin', 'special'].includes(tabBarStore.userType || 'normal')"
			/>

			<!-- 招聘 - 只有匿名用户可见 -->
			<u-tabbar-item
				name="recruitment"
				text="招聘"
				icon="info-circle"
				v-if="['anonymous'].includes(tabBarStore.userType || 'normal')"
			/>

			<!-- 保养 - 匿名、普通用户、管理员可见 -->
			<u-tabbar-item
				name="maintenance"
				text="保养"
				icon="setting"
				v-if="['anonymous','normal', 'admin'].includes(tabBarStore.userType || 'normal')"
			/>

			<!-- 客户 - 只有管理员可见 -->
			<u-tabbar-item
				name="customer"
				text="客户"
				icon="integral"
				v-if="['admin'].includes(tabBarStore.userType || 'normal')"
			/>

			<!-- 劳力士 - 匿名、普通用户、特殊用户可见 -->
			<u-tabbar-item
				name="rolex"
				text="劳力士"
				icon="star"
				v-if="['anonymous','normal', 'special'].includes(tabBarStore.userType || 'normal')"
			/>

			<!-- 我的 - 所有用户都可见 -->
			<u-tabbar-item
				name="profile"
				text="我的"
				icon="account"
				v-if="['anonymous','normal', 'admin', 'special'].includes(tabBarStore.userType || 'normal')"
			/>
		</u-tabbar>
	</view>
</template>

<script setup>
import TabSwitchLoading from '@/components/TabSwitchLoading.vue'
import { useTabBarStore, useUserStore } from '@/stores'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

// 定义组件名称（可选）
defineOptions({
	name: 'CustomTabBar'
})

// 获取 stores
const tabBarStore = useTabBarStore()
const userStore = useUserStore()

// Tab切换Loading状态
const tabSwitchLoading = ref(false)
const tabSwitchText = ref('页面加载中...')

// 计算当前激活标签的索引
// const activeTabIndex = computed(() => {
// 	const index = tabBarStore.tabList.findIndex(tab => tab.name === tabBarStore.activeTab)
// 	console.log('🏷️ 当前激活标签索引:', index, '对应标签:', tabBarStore.activeTab)
// 	return index >= 0 ? index : 0
// })

// mapIcon 函数已移除 - 直接在模板中使用 uview-plus 图标名称

// 处理标签切换事件 - 简化版，直接使用路径映射
const handleTabChange = (name) => {
	console.log('🏷️ 标签切换到:', name)

	// 直接定义路径映射，不依赖 store
	const pathMap = {
		'home': '/pages/index/index',
		'recruitment': '/pages/recruitment/recruitment',
		'maintenance': '/pages/maintenance/maintenance',
		'customer': '/pages/customer/customer',
		'rolex': '/pages/rolex/rolex',
		'profile': '/pages/profile/profile'
	}

	const path = pathMap[name]
	if (path) {
		// 如果切换到的不是当前激活的tab，才显示loading
		if (tabBarStore.activeTab !== name) {
			tabBarStore.switchTabWithLoading(name)
		}
	} else {
		console.warn('🏷️ 未找到标签对应的路径:', name)
	}
}

// 初始化函数
const initTabBar = async () => {
	try {
		// 确保tabBarStore已正确初始化
		if (!tabBarStore || !tabBarStore.tabList) {
			console.warn('🏷️ TabBar store 未正确初始化，尝试重新初始化...')
			// 可以尝试手动初始化 tabBarStore
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

// 组件挂载时的初始化
onMounted(async () => {
	await initTabBar()

	// 监听Tab切换Loading事件
	uni.$on('showTabSwitchLoading', (data) => {
		console.log('🔄 [CustomTabBar] 显示Tab切换Loading:', data)
		tabSwitchLoading.value = true
		tabSwitchText.value = data?.text || '页面加载中...'
	})

	uni.$on('hideTabSwitchLoading', () => {
		console.log('✅ [CustomTabBar] 隐藏Tab切换Loading')
		tabSwitchLoading.value = false
	})
})

// 组件销毁时清理事件监听
onUnmounted(() => {
	uni.$off('showTabSwitchLoading')
	uni.$off('hideTabSwitchLoading')
})
</script>
