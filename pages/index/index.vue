<template>
	<view class="container">
		<!-- 搜索组件 -->
		<SearchComponent
			@search="onSearch"
			@select-result="onSelectResult"
			@select-history="onSelectHistory"
			@select-hot="onSelectHot"
		/>
	</view>
</template>

<script>
import SearchComponent from '@/components/SearchComponent.vue'
import { useSearchStore } from '@/stores'

export default {
	components: {
		SearchComponent
	},
	setup() {
		const searchStore = useSearchStore()
		return {
			searchStore
		}
	},
	data() {
		return {

		}
	},
	onLoad() {

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
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 20px;

	.header {
		margin-bottom: 20px;

		.title {
			font-size: 24px;
			font-weight: bold;
			color: #333;
		}
	}
}
</style>
