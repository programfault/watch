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
			<text class="empty-text">暂无保养手册内容</text>
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
	computed: {
		manualData() {
			return this.appStore.getPageById(1)
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

	.empty-text {
		font-size: 14px;
		color: #999;
	}
}
</style>
