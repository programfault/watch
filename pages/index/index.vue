<template>
	<view class="container">
		<!-- 搜索组件 -->
		<HomeSearchComponent @search="onSearch" ref="homeSearch" from="home" />

		<!-- 轮播图组件 -->
		<CarouselComponent v-if="!searchStore.showSearchPanel" />

		<!-- 品牌组件 -->
		<BrandsComponent v-if="!searchStore.showSearchPanel" />

		<!-- 客服按钮 -->
        <!-- <view class="container">
            <button @click="openCustomerService">联系客服</button>
        </view> -->
	</view>
</template>

<script>
import BrandsComponent from '@/components/BrandsComponent.vue'
import CarouselComponent from '@/components/CarouselComponent.vue'
import HomeSearchComponent from '@/components/HomeSearchComponent.vue'
import SearchComponent from '@/components/SearchComponent.vue'
import { useAppStore, useSearchStore } from '@/stores'

export default {
	components: {
		HomeSearchComponent,
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
		console.log('Index页面 onLoad')
		// 初始化应用数据
		try {
			await this.appStore.initApp()
		} catch (error) {
			console.error('初始化失败:', error)
		}
	},

	onShow() {
		console.log('Index页面 onShow')
		// 从其他页面返回首页时，完全重置搜索框
		if (this.$refs.homeSearch) {
			this.$refs.homeSearch.resetSearch()
		}
	},

	onHide() {
		console.log('Index页面 onHide')
	},
	methods: {
		// 搜索事件 - 可选的业务处理
		onSearch(keyword) {
			console.log('首页搜索:', keyword)
		},
        onContact(e) {
            console.log('客服会话触发', e.detail);
            // e.detail 中包含客服会话相关信息
        },
        openCustomerService() {
            const customerServiceId = "ww17da4a406b6bf90b"
            uni.openCustomerServiceChat({
				extInfo: {
					url: `https://work.weixin.qq.com/kfid/kfc222a4433ef7716d7`
				},
				corpId: customerServiceId,
				success: (res) => {
					console.log('客服聊天打开成功:', res)
				},
				fail: (err) => {
					console.error('客服聊天打开失败:', err)
					// 失败时提供备用方案
					uni.showModal({
						title: '客服提示',
						content: '无法打开客服聊天，请联系客服微信：' + customerServiceId,
						showCancel: false
					})
				}
			})
        }
	}
}
</script>

<style lang="scss">
.container {
	padding: 20px;
	min-height: 100vh;
	background-color: #f8f8f8;
}

// 客服按钮样式
.customer-service-btn {
	position: fixed;
	right: 30rpx;
	bottom: 100rpx;
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #07c160 0%, #00a859 100%);
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 20rpx rgba(7, 193, 96, 0.3);
	z-index: 999;
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.4);
	}

	.service-text {
		font-size: 20rpx;
		color: #fff;
		margin-top: 4rpx;
		font-weight: 500;
	}
}
</style>
