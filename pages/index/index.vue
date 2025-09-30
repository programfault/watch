<template>
	<view class="container">
		<!-- 搜索组件 -->
		<SearchComponent @search="onSearch" />

		<!-- 轮播图组件 -->
		<CarouselComponent />

		<!-- 品牌组件 -->
		<BrandsComponent />
	</view>
</template>

<script>
import SearchComponent from '@/components/SearchComponent.vue'
import BrandsComponent from '@/components/BrandsComponent.vue'
import CarouselComponent from '@/components/CarouselComponent.vue'
import { useSearchStore, useAppStore } from '@/stores'

export default {
	components: {
		SearchComponent,
		BrandsComponent,
		CarouselComponent
	},
	setup() {
		const searchStore = useSearchStore()
		const appStore = useAppStore()
		return {
			searchStore,
			appStore
		}
	},
	data() {
		return {

		}
	},
	async onLoad() {
		// 初始化应用数据
		try {
			await this.appStore.initApp()
		} catch (error) {
			console.error('初始化失败:', error)
		}
	},
	methods: {
		// 搜索事件 - 可选的业务处理
		onSearch(keyword) {
			console.log('首页搜索:', keyword)
			// 可以在这里处理首页特定的搜索逻辑
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 20px;
}
</style>
