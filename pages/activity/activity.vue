<template>
	<view class="activity-container">
		<view class="header">
			<text class="title">活动详情</text>
		</view>

		<view class="content">
			<view class="info-card">
				<text class="label">活动ID:</text>
				<text class="value">{{ activityId }}</text>
			</view>

			<view class="info-card" v-if="activityTitle">
				<text class="label">活动标题:</text>
				<text class="value">{{ activityTitle }}</text>
			</view>

			<view class="info-card" v-if="activityDesc">
				<text class="label">活动描述:</text>
				<text class="value">{{ activityDesc }}</text>
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
			activityId: '',
			activityTitle: '',
			activityDesc: ''
		}
	},
	onLoad(options) {
		// 获取传递的参数
		this.activityId = options.id || '未知'
		this.activityTitle = options.title || ''
		this.activityDesc = options.description || ''

		console.log('活动页面参数:', options)
	},
	methods: {
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
				min-width: 80px;
			}

			.value {
				font-size: 16px;
				color: #333;
				flex: 1;
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
