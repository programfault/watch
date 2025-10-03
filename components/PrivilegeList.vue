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
				<uni-icons type="vip" size="32" color="#ccc"></uni-icons>
				<text class="empty-text">暂无特权</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'PrivilegeList',
	props: {
		privileges: {
			type: Array,
			default: () => []
		}
	},
	computed: {
		privilegeCount() {
			return this.privileges.length;
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
// 特权列表样式
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

			&.privilege-card {
				border-left: 4px solid #8b5cf6;
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

				.privilege-badge {
					background: linear-gradient(135deg, #8b5cf6, #7c3aed);
					color: white;
					font-size: 10px;
					font-weight: 600;
					padding: 4px 8px;
					border-radius: 6px;
					text-transform: uppercase;
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
