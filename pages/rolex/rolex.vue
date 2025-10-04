<template>
	<view class="container">
		<!-- 劳力士页面内容 -->
		<view class="page-content">
			<text>劳力士专区</text>
		</view>

		<!-- 底部标签栏组件 -->
		<CustomTabBar />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue'
import { useTabBarStore } from '@/stores'

export default {
	components: {
		CustomTabBar
	},
	setup() {
		const tabBarStore = useTabBarStore()
		return {
			tabBarStore
		}
	},
	data() {
		return {

		}
	},
	onLoad() {

	},

	onShow() {
		// 设置当前页面的tabBar状态
		this.tabBarStore.setActiveTab('rolex')
	},

	methods: {

	}
}
</script>

<style lang="scss">
.container {
	padding: 20px;
}
</style>
