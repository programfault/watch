<template>
	<view class="container">
		<!-- 加载状态 -->
		<view class="loading" v-if="appStore.pagesLoading">
			<uni-load-more status="loading" />
		</view>

		<!-- 手册内容 -->
		<view class="manual-content" v-else-if="manualData">
			<rich-text :nodes="manualData.content" class="rich-content"></rich-text>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else>
			<view class="empty-icon">
				<up-icon name="file-text" size="60" color="#e0e0e0" />
			</view>
			<text class="empty-title">手册暂未上传</text>
			<text class="empty-desc">保养手册内容正在准备中，
敬请期待专业的手表保养指南</text>
			<view class="empty-tip">
				<up-icon name="info-circle" size="14" color="#999" />
				<text class="tip-text">您可以先浏览服务门店信息</text>
			</view>
		</view>
	</view>
</template>

<script>
import { useAppStore } from '@/stores';
import { PAGE_IDS } from '@/utils/constants';

export default {
	setup() {
		const appStore = useAppStore()
		return {
			appStore
		}
	},
	computed: {
        manualData() {
			const pageData = this.appStore.getPageById(PAGE_IDS.MAINTENANCE_MANUAL)
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
	// padding: 20px;
	background-color: #f8f8f8;
	min-height: 100vh;
}

.loading {
	text-align: center;
	padding: 60px 0;
}

.manual-content {
	background: #fff;
	border-radius: 12px;
	padding: 20px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.1);

	.rich-content {
		line-height: 1.6;
		font-size: 14px;
		color: #333;
	}
}

.empty-state {
	text-align: center;
	padding: 80px 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	.empty-icon {
		margin-bottom: 20px;
		opacity: 0.8;
	}

	.empty-title {
		font-size: 18px;
		font-weight: 600;
		color: #666;
		margin-bottom: 12px;
	}

	.empty-desc {
		font-size: 14px;
		color: #999;
		line-height: 1.6;
		margin-bottom: 24px;
		max-width: 280px;
		text-align: center;
	}

	.empty-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8f9fa;
		padding: 8px 16px;
		border-radius: 20px;
		border: 1px solid #e9ecef;

		.tip-text {
			font-size: 12px;
			color: #666;
			margin-left: 6px;
		}
	}
}
</style>
