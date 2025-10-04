<template>
	<uv-tabbar
		:value="activeTabIndex"
		@change="handleChange"
		:activeColor="activeColor"
		:inactiveColor="inactiveColor"
		:fixed="true"
		:safeAreaInsetBottom="true"
		:border="true"
	>
		<uv-tabbar-item
			v-for="(tab, index) in tabBarStore.tabList"
			:key="tab.name"
			:name="index"
			:text="tab.text"
			:icon="mapIcon(tab.icon)"
		></uv-tabbar-item>
	</uv-tabbar>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useTabBarStore } from '@/stores'

// 定义组件名称（可选）
defineOptions({
	name: 'CustomTabBar'
})

// 获取 tabBar store
const tabBarStore = useTabBarStore()

// 响应式数据
const activeColor = ref('#ee0a24')
const inactiveColor = ref('#7d7e80')

// 计算当前激活标签的索引（uv-tabbar使用索引而不是名称）
const activeTabIndex = computed(() => {
	const index = tabBarStore.tabList.findIndex(tab => tab.name === tabBarStore.activeTab)
	console.log('🏷️ 当前激活标签索引:', index, '对应标签:', tabBarStore.activeTab)
	return index >= 0 ? index : 0
})

// 图标映射函数
const mapIcon = (storeIcon) => {
	const iconMap = {
		'home-o': 'home',
		'service-o': 'setting',
		'diamond-o': 'star',
		'user-o': 'account'
	}
	return iconMap[storeIcon] || storeIcon
}

// uv-tabbar的change事件处理
const handleChange = (index) => {
	console.log('🏷️ CustomTabBar onChange 索引:', index, typeof index)

	// 根据索引获取对应的标签信息
	if (index >= 0 && index < tabBarStore.tabList.length) {
		const tab = tabBarStore.tabList[index]
		console.log('🏷️ 切换到标签:', tab.name, tab.text)

		// 使用store的switchTab方法进行跳转
		tabBarStore.switchTab(tab.name)
	} else {
		console.warn('🏷️ 无效的标签索引:', index)
	}
}

// 初始化函数
const initTabBar = async () => {
	console.log('🏷️ CustomTabBar 初始化')
	console.log('🏷️ 当前tabBarStore.activeTab:', tabBarStore.activeTab)
	console.log('🏷️ tabList:', tabBarStore.tabList.map(t => `${t.name}(${t.text})`))
	console.log('🏷️ 当前激活索引:', activeTabIndex.value)

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
			console.log('🏷️ 当前页面路径:', currentRoute)
			tabBarStore.setActiveTabByPath(currentRoute)
		}
	} catch (error) {
		console.warn('🏷️ 获取当前页面路径失败:', error)
	}
}

// 监听 store 中 activeTab 的变化
watch(
	() => tabBarStore.activeTab,
	(newVal, oldVal) => {
		console.log('🏷️ activeTab 变化:', oldVal, '->', newVal)
	},
	{ immediate: true }
)

// 组件挂载时的初始化
onMounted(() => {
	initTabBar()
})
</script>

<style lang="scss" scoped>
// uv-tabbar的自定义样式
</style>
