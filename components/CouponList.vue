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
				<uni-icons type="gift" size="32" color="#ccc"></uni-icons>
				<text class="empty-text">暂无优惠券</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'CouponList',
	props: {
		coupons: {
			type: Array,
			default: () => []
		}
	},
	computed: {
		couponCount() {
			return this.coupons.length;
		}
	},
	methods: {
		// 格式化日期范围
		formatDateRange(startDate, endDate) {
			const formatDate = (dateStr) => {
				const date = new Date(dateStr);
				return `${date.getMonth() + 1}.${date.getDate()}`;
			};

			if (!startDate || !endDate) return '永久有效';
			return `${formatDate(startDate)} - ${formatDate(endDate)}`;
		}
	}
}
</script>

<style lang="scss" scoped>
// 优惠券列表样式
.benefits-section {
	margin-bottom: 20px;

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
		padding: 0 4px;

		.section-title {
			font-size: 16px;
			font-weight: 600;
			color: #1a1a1a;
		}

		.section-count {
			font-size: 12px;
			color: #64748b;
			background: #f1f5f9;
			padding: 2px 8px;
			border-radius: 10px;
		}
	}

	.benefits-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 0;

		.benefit-card {
			width: calc(100vw - 40px); /* 减去左右padding各20px */
			margin: 0 auto;
			background: white;
			border-radius: 16px;
			padding: 20px;
			border: 1px solid #f0f0f0;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
			position: relative;
			overflow: hidden;

			&.expired {
				opacity: 0.6;
				background: #f8f9fa;
			}

			&.coupon-card {
				border-left: 4px solid #10b981;
			}

			.card-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 8px;

				.card-title {
					font-size: 14px;
					font-weight: 600;
					color: #1a1a1a;
					flex: 1;
					margin-right: 8px;
				}

				.discount-badge {
					background: linear-gradient(135deg, #10b981, #059669);
					color: white;
					font-size: 12px;
					font-weight: 600;
					padding: 4px 8px;
					border-radius: 6px;
				}
			}

			.card-desc {
				font-size: 12px;
				color: #64748b;
				line-height: 1.4;
				margin-bottom: 12px;
			}

			.card-footer {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.valid-date {
					font-size: 11px;
					color: #94a3b8;
				}

				.status-text {
					font-size: 11px;
					font-weight: 500;

					&.valid {
						color: #10b981;
					}

					&.invalid {
						color: #ef4444;
					}
				}
			}
		}

		.empty-state {
			width: calc(100vw - 40px); /* 减去左右padding各20px */
			margin: 0 auto;
			background: white;
			border-radius: 16px;
			padding: 40px 20px;
			border: 1px solid #f0f0f0;
			text-align: center;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8px;

			.empty-text {
				font-size: 12px;
				color: #94a3b8;
			}
		}
	}
}
</style>
