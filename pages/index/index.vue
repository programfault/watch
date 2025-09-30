<template>
	<view class="container">
		<!-- 搜索组件 -->
		<SearchComponent
			@search="onSearch"
			@select-result="onSelectResult"
			@select-history="onSelectHistory"
			@select-hot="onSelectHot"
		/>

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
		// 搜索事件
		onSearch(keyword) {
			console.log('搜索:', keyword)
			// 可以在这里处理搜索结果，比如跳转到搜索结果页面
		},

		// 选择搜索结果
		onSelectResult(result) {
			console.log('选择结果:', result)
			// 根据结果类型跳转到对应页面
			switch(result.type) {
				case 'maintenance':
					uni.navigateTo({
						url: '/pages/maintenance/maintenance'
					})
					break
				case 'rolex':
					uni.navigateTo({
						url: '/pages/rolex/rolex'
					})
					break
				case 'customer':
					uni.navigateTo({
						url: '/pages/customer/customer'
					})
					break
			}
		},

		// 选择历史记录
		onSelectHistory(keyword) {
			console.log('选择历史:', keyword)
		},

		// 选择热门搜索
		onSelectHot(keyword) {
			console.log('选择热门:', keyword)
		},


	}
}
</script>

<style lang="scss">
.container {
	padding: 20px;
}
</style>
