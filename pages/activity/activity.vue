<template>
	<view class="activity-container">
		<view class="content">
			<!-- HTML内容渲染区域 -->
			<view class="html-content" v-if="htmlContent">
				<rich-text :nodes="htmlContent"></rich-text>
			</view>

			<!-- 加载状态 -->
			<view class="loading-section" v-if="loading">
				<uni-load-more status="loading" />
			</view>

			<!-- 空状态 -->
			<view class="empty-section" v-if="!htmlContent && !loading">
				<text class="empty-text">暂无活动内容</text>
			</view>
		</view>
	</view>
</template>

<script>
import { useAppStore } from '@/stores'

export default {
	data() {
		return {
			activityId: '',
			activityTitle: '',
			activityDesc: '',
			htmlContent: '',
			loading: true
		}
	},
	setup() {
		const appStore = useAppStore()
		return {
			appStore
		}
	},
	onLoad(options) {
		// 获取传递的参数
		this.activityId = options.id || '未知'
		this.activityTitle = options.title || ''
		this.activityDesc = options.description || ''

		console.log('活动页面参数:', options)

		// 从 store 中获取轮播图内容
		this.loadCarouselContent()
	},
	methods: {
		// 从 store 中加载轮播图内容
		loadCarouselContent() {
			this.loading = true

			try {
				// 查找对应ID的轮播图
				const carousel = this.appStore.carouselList.find(item => {
					return String(item.id) === String(this.activityId)
				})

				console.log('查找轮播图:', this.activityId, carousel)

				if (carousel && carousel.content) {
					this.htmlContent = carousel.content
					console.log('获取到HTML内容:', carousel.content)
				} else {
					console.warn('未找到对应的轮播图或内容为空')
					this.htmlContent = ''
				}
			} catch (error) {
				console.error('加载轮播图内容失败:', error)
				this.htmlContent = ''
			} finally {
				this.loading = false
			}
		},

		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style lang="scss">
.activity-container {
	padding: 20px;
	min-height: 100vh;
	background-color: #f5f5f5;

	.header {
		margin-bottom: 30px;
		text-align: center;

		.title {
			font-size: 24px;
			font-weight: bold;
			color: #333;
		}
	}

	.content {
		margin-bottom: 40px;
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
}
</style>
