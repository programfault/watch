<template>
	<view class="container">
		<!-- 搜索组件 -->
		<SearchComponent
			@search="onSearch"
			@select-result="onSelectResult"
			@select-history="onSelectHistory"
			@select-hot="onSelectHot"
		/>

		<!-- 轮播图 -->
		<view class="carousel-section" v-if="appStore.hasCarousel">
			<swiper
				class="carousel-swiper"
				indicator-dots
				autoplay
				interval="3000"
				duration="500"
				circular
			>
				<swiper-item
					v-for="(item, index) in appStore.activeCarousel"
					:key="index"
					@click="onCarouselClick(item)"
				>
					<image
						:src="item.image"
						mode="aspectFill"
						class="carousel-image"
						:alt="item.title"
					/>
					<view class="carousel-content" v-if="item.title">
						<text class="carousel-title">{{ item.title }}</text>
						<text class="carousel-desc" v-if="item.description">{{ item.description }}</text>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<!-- 加载状态 -->
		<view class="loading-section" v-if="appStore.carouselLoading">
			<uni-load-more status="loading" />
		</view>

		<!-- 空状态 -->
		<view class="empty-section" v-if="!appStore.hasCarousel && !appStore.carouselLoading">
			<text class="empty-text">暂无轮播内容</text>
		</view>
	</view>
</template>

<script>
import SearchComponent from '@/components/SearchComponent.vue'
import { useSearchStore, useAppStore } from '@/stores'

export default {
	components: {
		SearchComponent
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

		// 轮播图点击事件
		onCarouselClick(carouselItem) {
			console.log('点击轮播图:', carouselItem)

			// 暂时只显示提示，后续可根据实际需求添加跳转逻辑
			uni.showToast({
				title: `点击了: ${carouselItem.title}`,
				icon: 'none'
			})

			// 如果后续 API 返回跳转信息，可以在这里添加跳转逻辑
			// 例如: if (carouselItem.link_url) { uni.navigateTo({ url: carouselItem.link_url }) }
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 20px;

	.carousel-section {
		margin-bottom: 20px;

		.carousel-swiper {
			height: 200px;
			border-radius: 12px;
			overflow: hidden;

			.carousel-image {
				width: 100%;
				height: 100%;
			}

			.carousel-content {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				background: linear-gradient(transparent, rgba(0,0,0,0.6));
				padding: 20px 15px 15px;
				color: white;

				.carousel-title {
					font-size: 16px;
					font-weight: bold;
					margin-bottom: 5px;
					display: block;
				}

				.carousel-desc {
					font-size: 12px;
					opacity: 0.9;
					display: block;
				}
			}
		}
	}

	.loading-section {
		text-align: center;
		padding: 40px 0;
	}

	.empty-section {
		text-align: center;
		padding: 40px 0;

		.empty-text {
			color: #999;
			font-size: 14px;
		}
	}
}
</style>
