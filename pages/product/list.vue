<template>
	<view class="product-list-container">
		<!-- 搜索组件 -->
		<SearchComponent @search="onSearch" />

		<view class="content">

		</view>

		<view class="actions">
			<button class="back-btn" @click="goBack">返回</button>
		</view>
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
			brandId: ''
		}
	},
	onLoad(options) {
		// 获取传递的品牌ID参数
		this.brandId = options.id || '未知'

		console.log('产品列表页面参数:', options)
		console.log('品牌ID:', this.brandId)
	},
	methods: {
		// 搜索事件 - 可选的业务处理
		onSearch(keyword) {
			console.log('产品页面搜索:', keyword)
			// 可以在这里处理特定于产品页面的搜索逻辑
			uni.showToast({
				title: `在品牌${this.brandId}中搜索: ${keyword}`,
				icon: 'none'
			})
		},

		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style lang="scss">
.product-list-container {
	padding: 10px;
	min-height: 100vh;
	.content {
		margin-bottom: 40px;

		.placeholder {
			background: #fff;
			padding: 40px;
			margin-top: 20px;
			border-radius: 8px;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
			text-align: center;

			.placeholder-text {
				font-size: 16px;
				color: #999;
			}
		}
	}

	.actions {
		text-align: center;

		.back-btn {
			background: #007aff;
			color: #fff;
			border: none;
			border-radius: 6px;
			padding: 12px 30px;
			font-size: 16px;
		}
	}
}
</style>
