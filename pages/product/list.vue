<template>
	<view class="container">
		<SearchComponent @search="onSearch" />

		<view v-if="currentBrand" class="brand-info">
			<text class="brand-name">{{ currentBrand.name_cn }}</text>
			<text class="total-count">共 {{ pagination.total || 0 }} 款手表</text>
		</view>

		<scroll-view scroll-y class="watches-scroll" @scrolltolower="loadMore" lower-threshold="100">
			<view v-if="hasWatches" class="watches-list">
				<view v-for="watch in watches" :key="watch.id" class="watch-item" @click="goToDetail(watch.id)">
					<image :src="getWatchImage(watch)" class="watch-image" mode="aspectFit" lazy-load></image>
					<view class="watch-info">
						<text class="watch-name">{{ watch.name_cn || watch.name }}</text>
						<text class="watch-price">¥{{ watch.price }}</text>
						<view class="watch-meta">
							<text class="brand-text">{{ watch.brand?.name_cn }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="load-status">
				<view v-if="loading" class="loading">
					<text>加载中...</text>
				</view>
				<view v-else-if="!hasWatches && !loading" class="empty">
					<text>暂无手表数据</text>
				</view>
				<view v-else-if="!pagination.has_next" class="no-more">
					<text>已显示全部 {{ watches.length }} 款手表</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { storeToRefs } from 'pinia'
import SearchComponent from '@/components/SearchComponent.vue'
import { useProductStore } from '@/stores/product.js'

export default {
	name: 'ProductList',
	components: {
		SearchComponent
	},

	setup() {
		const productStore = useProductStore()
		const { watchesList: watches, watchesLoading: loading, watchesPagination: pagination, currentBrand } = storeToRefs(productStore)

		return {
			productStore,
			watches,
			loading,
			pagination,
			currentBrand
		}
	},

	computed: {
		hasWatches() {
			return this.watches && this.watches.length > 0
		}
	},

	methods: {
		async loadAllWatches() {
			await this.productStore.fetchWatches({ page: 1, per_page: 20 })
		},

		async loadBrandWatches(brandId) {
			await this.productStore.fetchWatches({
				page: 1,
				per_page: 20,
				brand_id: brandId
			})
		},

		async loadMore() {
			if (this.loading || !this.pagination.has_next) {
				return
			}

			const nextPage = this.pagination.current_page + 1
			await this.productStore.fetchWatches({
				page: nextPage,
				per_page: 20
			}, true)
		},

		onSearch(searchData) {
			this.productStore.searchWatches(searchData)
		},

		getWatchImage(watch) {
			if (watch.images && watch.images.length > 0) {
				return watch.images[0].image_url || watch.images[0].url
			}
			return '/static/logo.png'
		},

		goToDetail(watchId) {
			uni.navigateTo({
				url: `/pages/product/detail?id=${watchId}`
			})
		}
	},

	onLoad(options) {
		if (options.brandId) {
			this.loadBrandWatches(options.brandId)
		} else {
			this.loadAllWatches()
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
min-height: 100vh;
background-color: #f5f5f5;
}

.brand-info {
padding: 20rpx 30rpx;
background-color: #fff;
border-bottom: 1rpx solid #eee;

.brand-name {
font-size: 32rpx;
font-weight: bold;
color: #333;
margin-right: 20rpx;
}

.total-count {
font-size: 28rpx;
color: #666;
}
}

.watches-scroll {
height: calc(100vh - 200rpx);
}

.watches-list {
padding: 20rpx;
}

.watch-item {
display: flex;
background-color: #fff;
border-radius: 12rpx;
margin-bottom: 20rpx;
padding: 20rpx;
box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);

.watch-image {
width: 160rpx;
height: 160rpx;
border-radius: 8rpx;
margin-right: 20rpx;
background-color: #f9f9f9;
}

.watch-info {
flex: 1;
display: flex;
flex-direction: column;
justify-content: space-between;

.watch-name {
font-size: 30rpx;
font-weight: bold;
color: #333;
margin-bottom: 10rpx;
}

.watch-price {
font-size: 28rpx;
color: #e74c3c;
font-weight: bold;
margin-bottom: 10rpx;
}

.watch-meta {
.brand-text {
font-size: 24rpx;
color: #666;
background-color: #f0f0f0;
padding: 4rpx 12rpx;
border-radius: 20rpx;
}
}
}
}

.load-status {
padding: 40rpx;
text-align: center;

.loading, .empty, .no-more {
font-size: 28rpx;
color: #999;
}
}
</style>
