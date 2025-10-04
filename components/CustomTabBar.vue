<template>
	<uv-tabbar
		:value="activeTabIndex"
		@change="onChange"
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

<script>
import { computed } from 'vue'
import { useTabBarStore } from '@/stores'

export default {
	name: 'CustomTabBar',
	setup() {
		const tabBarStore = useTabBarStore()

		// 计算当前激活标签的索引（uv-tabbar使用索引而不是名称）
		const activeTabIndex = computed(() => {
			const index = tabBarStore.tabList.findIndex(tab => tab.name === tabBarStore.activeTab)
			console.log('🏷️ 当前激活标签索引:', index, '对应标签:', tabBarStore.activeTab)
			return index >= 0 ? index : 0
		})

		return {
			tabBarStore,
			activeTabIndex
		}
	},

	data() {
		return {
			// 自定义颜色配置
			activeColor: '#ee0a24',
			inactiveColor: '#7d7e80'
		}
	},

	methods: {
		// uv-tabbar的change事件传递索引
		onChange(index) {
			console.log('🏷️ CustomTabBar onChange 索引:', index, typeof index)

			// 根据索引获取对应的标签信息
			if (index >= 0 && index < this.tabBarStore.tabList.length) {
				const tab = this.tabBarStore.tabList[index]
				console.log('🏷️ 切换到标签:', tab.name, tab.text)

				// 使用store的switchTab方法进行跳转
				this.tabBarStore.switchTab(tab.name)
			} else {
				console.warn('🏷️ 无效的标签索引:', index)
			}
		},

		// 将store中的图标映射为uv-icon支持的图标
		mapIcon(storeIcon) {
			const iconMap = {
				'home-o': 'home',
				'service-o': 'setting',
				'diamond-o': 'star',
				'user-o': 'account'
			}
			return iconMap[storeIcon] || storeIcon
		}
	},

	// 添加观察者监听store变化
	watch: {
		'tabBarStore.activeTab': {
			handler(newVal, oldVal) {
				console.log('🏷️ activeTab 变化:', oldVal, '->', newVal)
				// 强制更新组件状态
				this.$forceUpdate()
			},
			immediate: true
		}
	},

	// 组件挂载时设置默认激活状态
	mounted() {
		console.log('🏷️ CustomTabBar mounted')
		console.log('🏷️ 当前tabBarStore.activeTab:', this.tabBarStore.activeTab)
		console.log('🏷️ tabList:', this.tabBarStore.tabList.map(t => `${t.name}(${t.text})`))
		console.log('🏷️ 当前激活索引:', this.activeTabIndex)

		// 如果没有设置activeTab，默认设置为首页
		if (!this.tabBarStore.activeTab) {
			this.tabBarStore.setActiveTab('home')
		}

		// 根据当前页面路径自动设置激活标签
		const pages = getCurrentPages()
		if (pages && pages.length > 0) {
			const currentPage = pages[pages.length - 1]
			const currentRoute = '/' + currentPage.route
			console.log('🏷️ 当前页面路径:', currentRoute)
			this.tabBarStore.setActiveTabByPath(currentRoute)
		}
	}
}
</script>

<style lang="scss" scoped>
// uv-tabbar的自定义样式
</style>
