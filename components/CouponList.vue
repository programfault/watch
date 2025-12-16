<template>
	<view class="benefits-section">
		<view class="section-header">
			<text class="section-title">我的优惠券</text>
			<text class="section-count">{{ couponCount }}张</text>
		</view>
		<view class="benefits-list">
			<view
				v-for="coupon in coupons"
				:key="coupon.id"
				class="benefit-card coupon-card"
				:class="{ 'expired': !coupon.is_valid }"
			>
				<view class="card-header">
					<text class="card-title">{{ coupon.name }}</text>
					<view class="discount-badge" v-if="coupon.discount_percent">
						{{ coupon.discount_percent }}折
					</view>
				</view>
				<text class="card-desc">{{ coupon.description }}</text>

				<view class="card-footer">
					<text class="valid-date">{{ formatDateRange(coupon.start_date, coupon.end_date) }}</text>
					<text class="status-text" :class="{ 'valid': coupon.is_valid, 'invalid': !coupon.is_valid }">
						{{ coupon.is_valid ? '可使用' : '已过期' }}
					</text>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="!coupons.length" class="empty-state">
				<up-icon name="gift" size="32" color="#ccc"></up-icon>
				<text class="empty-text">暂无优惠券</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores';

// 定义组件名称
defineOptions({
	name: 'CouponList'
});

// 获取用户 store
const userStore = useUserStore();

// 定义props
const props = defineProps({
	coupons: {
		type: Array,
		default: () => []
	}
});



// 计算属性
const couponCount = computed(() => {
	return props.coupons.length;
});

// 格式化日期范围
const formatDateRange = (startDate, endDate) => {
	const formatDate = (dateStr) => {
		const date = new Date(dateStr);
		return `${date.getMonth() + 1}.${date.getDate()}`;
	};

	if (!startDate || !endDate) return '永久有效';
	return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};
</script>

<style lang="scss" scoped>
// 优惠券列表样式
.benefits-section {
	margin-bottom: 48rpx;

	&:last-child {
		margin-bottom: 0;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
		padding: 0 8rpx;

		.section-title {
			font-size: 36rpx;
			font-weight: 700;
			color: #1a1a1a;
			letter-spacing: 0.5rpx;
		}

		.section-count {
			font-size: 26rpx;
			color: #10b981;
			background: linear-gradient(135deg, #f0fdf4, #dcfce7);
			padding: 6rpx 16rpx;
			border-radius: 24rpx;
			font-weight: 600;
			border: 1rpx solid #bbf7d0;
		}
	}

	.benefits-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		padding: 0;

		.benefit-card {
			width: 100%;
			background: white;
			border-radius: 20rpx;
			padding: 32rpx;
			border: 1rpx solid #f0f0f0;
			box-shadow: 0 6rpx 30rpx rgba(0, 0, 0, 0.08);
			position: relative;
			overflow: hidden;
			box-sizing: border-box;
			transition: all 0.3s ease;

			&:hover {
				transform: translateY(-2rpx);
				box-shadow: 0 8rpx 35rpx rgba(0, 0, 0, 0.12);
			}

			&.expired {
				opacity: 0.6;
				background: #fafafa;
				transform: none !important;
			}

			&.coupon-card {
				border-left: 4px solid #10b981;
			}

			.card-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 16rpx;

				.card-title {
					font-size: 32rpx;
					font-weight: 700;
					color: #1a1a1a;
					flex: 1;
					margin-right: 16rpx;
					line-height: 1.3;
				}

				.discount-badge {
					background: linear-gradient(135deg, #10b981, #059669);
					color: white;
					font-size: 26rpx;
					font-weight: 700;
					padding: 8rpx 16rpx;
					border-radius: 12rpx;
					letter-spacing: 0.5rpx;
					box-shadow: 0 2rpx 8rpx rgba(16, 185, 129, 0.3);
				}
			}

			.card-desc {
				font-size: 26rpx;
				color: #64748b;
				line-height: 1.5;
				margin-bottom: 20rpx;
				background: #f8fafc;
				padding: 16rpx;
				border-radius: 12rpx;
				border-left: 4rpx solid #10b981;
			}

			.card-id {
				font-size: 24rpx;
				color: #64748b;
				margin-bottom: 16rpx;
				padding: 8rpx 16rpx;
				background: #fef3c7;
				border-radius: 8rpx;
				border-left: 3rpx solid #f59e0b;
				display: flex;
				align-items: center;
				gap: 8rpx;

				.id-label {
					font-weight: 600;
					color: #92400e;
				}

				.id-value {
					font-family: 'Courier New', monospace;
					color: #b45309;
					font-weight: 500;
				}
			}

			.card-footer {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding-top: 16rpx;
				border-top: 1rpx solid #f1f5f9;

				.valid-date {
					font-size: 24rpx;
					color: #94a3b8;
					font-weight: 500;
				}

				.status-text {
					font-size: 24rpx;
					font-weight: 600;
					padding: 4rpx 12rpx;
					border-radius: 8rpx;

					&.valid {
						color: #10b981;
						background: #f0fdf4;
					}

					&.invalid {
						color: #ef4444;
						background: #fef2f2;
					}
				}
			}
		}

		.empty-state {
			width: 100%;
			background: white;
			border-radius: 20rpx;
			padding: 60rpx 32rpx;
			border: 1rpx solid #f0f0f0;
			text-align: center;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 16rpx;
			box-sizing: border-box;
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

			.empty-text {
				font-size: 28rpx;
				color: #94a3b8;
				font-weight: 500;
			}
		}
	}
}
</style>
