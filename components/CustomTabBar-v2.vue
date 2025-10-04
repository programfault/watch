<template>
	<view class="custom-tabbar">
		<van-tabbar :value="activeTabName" @input="onInput" @change="onChange" fixed active-color="#ee0a24">
			<van-tabbar-item
				v-for="tab in tabBarStore.tabList"
				:key="tab.name"
				:icon="tab.icon"
				:name="tab.name"
			>
				{{ tab.text }}
			</van-tabbar-item>
		</van-tabbar>
	</view>
</template>

<script>
import { computed } from 'vue'
import { useTabBarStore } from '@/stores'

export default {
	name: 'CustomTabBar',
	setup() {
		const tabBarStore = useTabBarStore()

		// 直接绑定当前激活标签的名称
		const activeTabName = computed(() => {
			console.log('🏷️ 当前激活标签:', tabBarStore.activeTab)
			return tabBarStore.activeTab
		})

		return {
			tabBarStore,
			activeTabName
		}
	},

	methods: {
		// 处理input事件（v-model的实际事件）
		onInput(tabName) {
			console.log('🏷️ CustomTabBar onInput:', tabName)
			if (tabName && this.tabBarStore.tabList.find(tab => tab.name === tabName)) {
				this.tabBarStore.setActiveTab(tabName)
			}
		},

		// 处理change事件（点击切换事件）
		onChange(event) {
			console.log('🏷️ CustomTabBar onChange:', event)

			let tabName = event
			// 兼容小程序的event.detail格式
			if (typeof event === 'object' && event.detail !== undefined) {
				tabName = event.detail
			}

			console.log('🏷️ 解析后的tabName:', tabName)

			if (tabName && this.tabBarStore.tabList.find(tab => tab.name === tabName)) {
				// 使用store的switchTab方法进行跳转
				this.tabBarStore.switchTab(tabName)
			}
		}
	},

	// 页面显示时更新TabBar状态
	mounted() {
		console.log('🏷️ CustomTabBar mounted, 当前页面路径:', getCurrentPages())
		// 根据当前页面设置active状态
		const pages = getCurrentPages()
		if (pages && pages.length > 0) {
			const currentPage = pages[pages.length - 1]
			const currentRoute = currentPage.route
			console.log('🏷️ 当前路由:', currentRoute)

			// 根据路由设置activeTab
			if (currentRoute) {
				this.tabBarStore.setActiveTabByPath('/' + currentRoute)
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.custom-tabbar {
	// 确保TabBar显示在正确位置
	position: relative;
}

// 调试样式，帮助查看选中状态
::v-deep .van-tabbar-item--active {
	color: #ee0a24 !important;
}

::v-deep .van-tabbar-item__icon--active {
	color: #ee0a24 !important;
}
</style>
