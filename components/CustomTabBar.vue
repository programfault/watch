<template>
	<uv-tabbar
		:value="activeTabIndex"
		:fixed="true"
		activeColor="#ee0a24"
		inactiveColor="#7d7e80"
		@change="handleTabChange"
	>
		<uv-tabbar-item
			v-for="tab in tabBarStore.tabList"
			:key="tab.name"
			:text="tab.text"
			:icon="mapIcon(tab.icon)"
		></uv-tabbar-item>
	</uv-tabbar>
</template>

<script setup>
import { computed, onMounted, nextTick } from 'vue'
import { useTabBarStore } from '@/stores'

// 定义组件名称（可选）
defineOptions({
	name: 'CustomTabBar'
})

// 获取 tabBar store
const tabBarStore = useTabBarStore()

// 计算当前激活标签的索引
const activeTabIndex = computed(() => {
	const index = tabBarStore.tabList.findIndex(tab => tab.name === tabBarStore.activeTab)
	console.log('🏷️ 当前激活标签索引:', index, '对应标签:', tabBarStore.activeTab)
	return index >= 0 ? index : 0
})

// 图标映射函数 - 适配uv-ui的图标名称
const mapIcon = (storeIcon) => {
	const iconMap = {
		'home-o': 'home',
		'service-o': 'setting',
		'contacts-o': 'account',
		'diamond-o': 'star',
		'user-o': 'account'
	}
	return iconMap[storeIcon] || storeIcon.replace('-o', '')
}

// 处理标签切换事件
const handleTabChange = (index) => {
	console.log('🏷️ 标签切换到索引:', index)
	const selectedTab = tabBarStore.tabList[index]
	if (selectedTab && selectedTab.path) {
		tabBarStore.switchTab(selectedTab.name)
	} else {
		console.warn('🏷️ 标签没有路径:', selectedTab?.name)
	}
}

// 初始化函数
const initTabBar = async () => {
	// 如果没有设置activeTab，默认设置为首页
	if (!tabBarStore.activeTab) {
		tabBarStore.setActiveTab('home')
	}

	// 等待下一个tick后再处理页面路径
	await nextTick()

	// 根据当前页面路径自动设置激活标签
	try {
		const pages = getCurrentPages()
		if (pages && pages.length > 0) {
			const currentPage = pages[pages.length - 1]
			const currentRoute = '/' + currentPage.route
			tabBarStore.setActiveTabByPath(currentRoute)
		}
	} catch (error) {
		console.warn('🏷️ 获取当前页面路径失败:', error)
	}
}

// 组件挂载时的初始化
onMounted(() => {
	initTabBar()
})
</script>

<style lang="scss" scoped>
/* 如果需要自定义uv-tabbar的样式，可以在这里添加 */
</style>
