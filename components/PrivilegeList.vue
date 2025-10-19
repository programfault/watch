<template>
	<view class="benefits-section">
		<view class="section-header">
			<text class="section-title">我的特权</text>
			<text class="section-count">{{ privilegeCount }}项</text>
		</view>
		<view class="benefits-list">
			<view
				v-for="privilege in privileges"
				:key="privilege.id"
				class="benefit-card privilege-card"
				:class="{ 'expired': !privilege.is_valid }"
			>
				<view class="card-header">
					<text class="card-title">{{ privilege.name }}</text>
					<view class="privilege-badge">VIP</view>
				</view>
				<text class="card-desc">{{ privilege.description }}</text>
				<view class="card-footer">
					<text class="valid-date">{{ formatDateRange(privilege.start_date, privilege.end_date) }}</text>
					<text class="status-text" :class="{ 'valid': privilege.is_valid, 'invalid': !privilege.is_valid }">
						{{ privilege.is_valid ? '有效' : '已失效' }}
					</text>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="!privileges.length" class="empty-state">
				<up-icon name="integral" size="32" color="#ccc"></up-icon>
				<text class="empty-text">暂无特权</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue';

// 定义组件名称
defineOptions({
	name: 'PrivilegeList'
});

// 定义props
const props = defineProps({
	privileges: {
		type: Array,
		default: () => []
	}
});

// 计算属性
const privilegeCount = computed(() => {
	return props.privileges.length;
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
// 特权列表样式
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
			color: #8b5cf6;
			background: linear-gradient(135deg, #faf5ff, #f3e8ff);
			padding: 6rpx 16rpx;
			border-radius: 24rpx;
			font-weight: 600;
			border: 1rpx solid #ddd6fe;
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

			&.privilege-card {
				border-left: 6rpx solid #8b5cf6;
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

				.privilege-badge {
					background: linear-gradient(135deg, #8b5cf6, #7c3aed);
					color: white;
					font-size: 24rpx;
					font-weight: 700;
					padding: 8rpx 16rpx;
					border-radius: 12rpx;
					text-transform: uppercase;
					letter-spacing: 0.5rpx;
					box-shadow: 0 2rpx 8rpx rgba(139, 92, 246, 0.3);
				}
			}

			.card-desc {
				font-size: 26rpx;
				color: #64748b;
				line-height: 1.5;
				margin-bottom: 20rpx;
				background: #faf5ff;
				padding: 16rpx;
				border-radius: 12rpx;
				border-left: 4rpx solid #8b5cf6;
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
						color: #8b5cf6;
						background: #faf5ff;
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
