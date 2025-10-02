<template>
	<uni-popup ref="consumerPopup" type="bottom" background-color="#fff" :mask-click="true" @maskClick="closePanel">
		<view class="consumer-panel">
			<!-- 头部 -->
			<view class="consumer-header">
				<text class="header-title">{{ actionType === 'gift' ? '赠送优惠券' : '核销优惠券' }}</text>
				<view class="header-actions">
					<text class="close-btn" @click="closePanel">×</text>
				</view>
			</view>

			<!-- 内容区域 -->
			<scroll-view scroll-y class="consumer-content">
				<!-- 消费者信息 -->
				<view class="consumer-info-section" v-if="consumerData">
					<text class="section-title">消费者信息</text>
					<view class="consumer-info-card">
						<view class="info-row">
							<text class="info-label">手机号:</text>
							<text class="info-value">{{ consumerData.phone }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">积分:</text>
							<text class="info-value">{{ consumerData.points }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">优惠券:</text>
							<text class="info-value">{{ consumerData.coupon_count }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">特权:</text>
							<text class="info-value">{{ consumerData.privilege_count }}</text>
						</view>
					</view>
				</view>

				<!-- 操作区域 -->
				<view class="action-section">
					<text class="section-title">{{ actionType === 'gift' ? '选择赠送内容' : '选择核销内容' }}</text>

					<!-- 这里可以根据需要添加具体的操作内容 -->
					<view class="placeholder-content">
						<text class="placeholder-text">
							{{ actionType === 'gift' ? '请选择要赠送的优惠券或特权' : '请选择要核销的优惠券' }}
						</text>
					</view>
				</view>
			</scroll-view>

			<!-- 底部按钮 -->
			<view class="consumer-footer">
				<view class="confirm-btn" @click="confirmAction">
					<text class="confirm-text">{{ actionType === 'gift' ? '确定赠送' : '确定核销' }}</text>
				</view>
			</view>
		</view>
	</uni-popup>
</template>

<script>
export default {
	name: 'ConsumerPanel',

	props: {
		visible: {
			type: Boolean,
			default: false
		},
		actionType: {
			type: String,
			default: 'gift', // 'gift' | 'verify'
		},
		consumerData: {
			type: Object,
			default: null
		}
	},

	watch: {
		visible: {
			handler(newVal) {
				if (newVal) {
					this.openPanel()
				} else {
					this.closePanel()
				}
			},
			immediate: true
		}
	},

	methods: {
		openPanel() {
			if (this.$refs.consumerPopup) {
				this.$refs.consumerPopup.open()
			}
		},

		closePanel() {
			if (this.$refs.consumerPopup) {
				this.$refs.consumerPopup.close()
			}
			this.$emit('close')
		},

		confirmAction() {
			// 构建操作数据
			const actionData = {
				actionType: this.actionType,
				consumer: this.consumerData,
				// 这里可以添加具体的操作数据
			}

			this.$emit('confirm', actionData)
		}
	}
}
</script>

<style lang="scss" scoped>
.consumer-panel {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
}

.consumer-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;

	.header-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.header-actions {
		display: flex;
		align-items: center;

		.close-btn {
			font-size: 40rpx;
			color: #666;
			line-height: 1;
		}
	}
}

.consumer-content {
	flex: 1;
	padding: 0 30rpx;
	max-height: 60vh;
}

.consumer-info-section,
.action-section {
	margin-bottom: 40rpx;

	.section-title {
		display: block;
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		padding-top: 30rpx;
	}
}

.consumer-info-card {
	background-color: #f9f9f9;
	border-radius: 16rpx;
	padding: 24rpx;
	border: 1rpx solid #eee;

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.info-label {
			font-size: 28rpx;
			color: #666;
		}

		.info-value {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
		}
	}
}

.placeholder-content {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 200rpx;
	background-color: #f9f9f9;
	border-radius: 16rpx;
	border: 1rpx solid #eee;

	.placeholder-text {
		font-size: 28rpx;
		color: #999;
		text-align: center;
	}
}

.consumer-footer {
	padding: 30rpx;
	border-top: 1rpx solid #eee;

	.confirm-btn {
		width: 100%;
		height: 88rpx;
		background-color: #b8860b;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.confirm-text {
			font-size: 32rpx;
			color: #fff;
			font-weight: bold;
		}
	}
}
</style>
