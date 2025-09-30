<template>
	<view class="product-list-container">
		<view class="header">
			<text class="title">产品列表</text>
		</view>

		<view class="content">
			<view class="info-card">
				<text class="label">品牌ID:</text>
				<text class="value">{{ brandId }}</text>
			</view>

			<view class="placeholder">
				<text class="placeholder-text">产品列表将在这里显示...</text>
			</view>
		</view>

		<view class="actions">
			<button class="back-btn" @click="goBack">返回</button>
		</view>
	</view>
</template>

<script>
export default {
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
		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style lang="scss">
.product-list-container {
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

		.info-card {
			background: #fff;
			padding: 20px;
			margin-bottom: 15px;
			border-radius: 8px;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
			display: flex;
			align-items: center;

			.label {
				font-size: 16px;
				font-weight: bold;
				color: #666;
				margin-right: 10px;
				min-width: 100px;
			}

			.value {
				font-size: 16px;
				color: #333;
				flex: 1;
			}
		}

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
