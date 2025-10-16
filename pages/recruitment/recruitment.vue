<template>
	<view class="container">
		<!-- 加载状态 -->
		<view class="loading" v-if="appStore.pagesLoading">
			<uni-load-more status="loading" />
		</view>

		<!-- 招聘内容 -->
		<view class="recruitment-content" v-else-if="recruitmentData">
			<rich-text :nodes="recruitmentData.content" class="rich-content"></rich-text>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else>
			<view class="empty-icon">
				<uv-icon name="account" size="60" color="#e0e0e0" />
			</view>
			<text class="empty-title">招聘信息暂未发布</text>
			<text class="empty-desc">我们正在准备优质的工作机会，
敬请期待加入我们的团队</text>
			<view class="empty-tip">
				<uv-icon name="info-circle" size="14" color="#999" />
				<text class="tip-text">您可以关注我们的最新动态</text>
			</view>
		</view>

		<!-- 底部标签栏组件 -->
		<CustomTabBar />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue';
import { useAppStore } from '@/stores';
import { PAGE_IDS } from '@/utils/constants';

export default {
	components: {
		CustomTabBar
	},
	setup() {
		const appStore = useAppStore()
		return {
			appStore
		}
	},
	computed: {
        recruitmentData() {
			const pageData = this.appStore.getPageById(PAGE_IDS.RECRUITMENT)
			// 检查对象是否存在且content不为空
			if (pageData && pageData.content && pageData.content.trim()) {
				return pageData
			}
			return null
		}
	},
	async onLoad() {
		if (!this.appStore.hasPages && !this.appStore.pagesLoading) {
			await this.appStore.fetchPages()
		}
	}
}
</script>

<style lang="scss">
.container {
	background-color: #f8f9fa;
	min-height: 100vh;
	padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

.loading {
	text-align: center;
	padding: 120rpx 0;
}

.recruitment-content {
	background: #fff;
	border-radius: 24rpx;
	padding: 40rpx;
	margin: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);

	.rich-content {
		line-height: 1.8;
		font-size: 28rpx;
		color: #333;
	}
}

.empty-state {
	text-align: center;
	padding: 160rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	.empty-icon {
		margin-bottom: 40rpx;
		opacity: 0.8;
	}

	.empty-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #666;
		margin-bottom: 24rpx;
	}

	.empty-desc {
		font-size: 28rpx;
		color: #999;
		line-height: 1.6;
		margin-bottom: 48rpx;
		max-width: 560rpx;
		text-align: center;
	}

	.empty-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8f9fa;
		padding: 16rpx 32rpx;
		border-radius: 40rpx;
		border: 1rpx solid #e9ecef;

		.tip-text {
			font-size: 24rpx;
			color: #666;
			margin-left: 12rpx;
		}
	}
}
</style>
