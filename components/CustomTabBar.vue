<template>
	<van-tabbar v-model="activeTabIndex" @change="onChange" fixed>
		<van-tabbar-item
			v-for="tab in tabBarStore.tabList"
			:key="tab.name"
			:icon="tab.icon"
			:name="tab.name"
		>
			{{ tab.text }}
		</van-tabbar-item>
	</van-tabbar>
</template>

<script>
import { computed } from 'vue'
import { useTabBarStore } from '@/stores'

export default {
	name: 'CustomTabBar',
	setup() {
		const tabBarStore = useTabBarStore()

		// 计算当前激活标签的索引
		const activeTabIndex = computed({
			get() {
				return tabBarStore.tabList.findIndex(tab => tab.name === tabBarStore.activeTab)
			},
			set(index) {
				// 当v-model更新时，同步更新store中的activeTab
				if (index >= 0 && index < tabBarStore.tabList.length) {
					const tabName = tabBarStore.tabList[index].name
					tabBarStore.setActiveTab(tabName)
				}
			}
		})

		return {
			tabBarStore,
			activeTabIndex
		}
	},

	methods: {
		onChange(event) {
			const tabName = event.detail
			console.log('🏷️ CustomTabBar onChange:', tabName)

			// 使用store的switchTab方法进行跳转
			this.tabBarStore.switchTab(tabName)
		}
	}
}
</script>

<style lang="scss" scoped>
// 可以在这里添加自定义样式
// 由于使用了van-tabbar，大部分样式由vant控制
</style>
