<template>
	<view class="container">
		<view class="page-header">
			<text class="page-title">维修保养服务</text>
			<text class="page-subtitle">专业的手表维修和保养服务</text>
		</view>

		<!-- 店铺列表 -->
		<view class="stores-section">
			<view class="section-title">服务门店</view>

			<!-- 加载状态 -->
			<view class="loading" v-if="appStore.storesLoading">
				<uni-load-more status="loading" />
			</view>

			<!-- 店铺列表 -->
			<view class="stores-list" v-else-if="appStore.hasStores">
				<view
					class="store-item"
					v-for="store in appStore.allStores"
					:key="store.id"
				>
					<view class="store-header">
						<text class="store-name" @click="showStoreDetail(store)">{{ store.name }}</text>
						<view class="phone-section" @click.stop="callStore(store)">
							<uni-icons type="phone" size="14" color="#007aff" />
							<text class="store-phone">{{ store.phone }}</text>
						</view>
					</view>
					<text class="store-address" @click="showStoreDetail(store)">{{ store.address }}</text>
					<text class="store-description" @click="showStoreDetail(store)">{{ store.description }}</text>
					<view class="store-footer">
						<text class="store-hours">营业时间: {{ store.opening_hours }}</text>
						<view class="nav-button" @click.stop="navigateToStore(store)">
							<uni-icons type="location" size="16" color="#fff" />
							<text class="nav-text">导航</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-else>
				<text class="empty-text">暂无服务门店信息</text>
			</view>
		</view>
	</view>
</template>

<script>
import { useAppStore } from '@/stores'

export default {
	setup() {
		const appStore = useAppStore()
		return {
			appStore
		}
	},
	data() {
		return {

		}
	},
	async onLoad() {
		// 确保店铺数据已加载
		if (!this.appStore.hasStores && !this.appStore.storesLoading) {
			await this.appStore.fetchStores()
		}
	},
	methods: {
		// 显示店铺详情
		showStoreDetail(store) {
			uni.showModal({
				title: store.name,
				content: `地址: ${store.address}\n电话: ${store.phone}\n营业时间: ${store.opening_hours}\n\n${store.description}`,
				showCancel: false
			})
		},

		// 拨打电话
		callStore(store) {
			uni.makePhoneCall({
				phoneNumber: store.phone,
				fail: (err) => {
					console.error('拨打电话失败:', err)
					uni.showToast({
						title: '拨打电话失败',
						icon: 'none'
					})
				}
			})
		},

		// 地图导航
		navigateToStore(store) {
			if (store.latitude && store.longitude) {
				uni.openLocation({
					latitude: parseFloat(store.latitude),
					longitude: parseFloat(store.longitude),
					name: store.name,
					address: store.address,
					fail: (err) => {
						console.error('打开地图失败:', err)
						uni.showToast({
							title: '打开地图失败',
							icon: 'none'
						})
					}
				})
			} else {
				uni.showToast({
					title: '该店铺暂无位置信息',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 20px;
	background-color: #f8f8f8;
	min-height: 100vh;
}

.page-header {
	text-align: center;
	margin-bottom: 30px;

	.page-title {
		display: block;
		font-size: 24px;
		font-weight: bold;
		color: #333;
		margin-bottom: 8px;
	}

	.page-subtitle {
		font-size: 14px;
		color: #666;
	}
}

.stores-section {
	.section-title {
		font-size: 18px;
		font-weight: bold;
		color: #333;
		margin-bottom: 15px;
	}
}

.loading {
	text-align: center;
	padding: 40px 0;
}

.stores-list {
	.store-item {
		background: #fff;
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		position: relative;

		.store-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 8px;

			.store-name {
				font-size: 16px;
				font-weight: bold;
				color: #333;
				flex: 1;
				margin-right: 10px;
				cursor: pointer;
			}

			.phone-section {
				display: flex;
				align-items: center;
				background: #f0f8ff;
				padding: 4px 8px;
				border-radius: 6px;
				cursor: pointer;
				transition: background-color 0.2s ease;

				&:active {
					background: #e6f3ff;
				}

				.store-phone {
					font-size: 12px;
					color: #007aff;
					margin-left: 4px;
				}
			}
		}

		.store-address {
			font-size: 14px;
			color: #666;
			margin-bottom: 6px;
			line-height: 1.4;
			cursor: pointer;
		}

		.store-description {
			font-size: 12px;
			color: #999;
			margin-bottom: 12px;
			line-height: 1.3;
			cursor: pointer;
		}

		.store-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.store-hours {
				font-size: 12px;
				color: #666;
				flex: 1;
			}

			.nav-button {
				display: flex;
				align-items: center;
				background: linear-gradient(135deg, #007aff, #5ac8fa);
				padding: 6px 12px;
				border-radius: 20px;
				cursor: pointer;
				transition: transform 0.2s ease, box-shadow 0.2s ease;

				&:active {
					transform: scale(0.95);
					box-shadow: 0 2px 4px rgba(0, 122, 255, 0.3);
				}

				.nav-text {
					font-size: 12px;
					color: #fff;
					margin-left: 4px;
					font-weight: 500;
				}
			}
		}
	}
}

.empty-state {
	text-align: center;
	padding: 60px 20px;

	.empty-text {
		font-size: 14px;
		color: #999;
	}
}
</style>
