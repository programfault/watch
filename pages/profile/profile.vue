<template>
	<view class="container">
		<!-- 加载状态 -->
		<view v-if="userInfoLoading" class="loading">
			<uni-icons type="spinner-cycle" size="30" color="#999"></uni-icons>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 未登录状态 - 显示登录组件 -->
		<LoginComponent v-else-if="!userStore.isLoggedIn" />

		<!-- 已登录状态 - 个人信息内容（支持下拉刷新） -->
		<scroll-view
			v-else
			class="profile-scroll"
			scroll-y="true"
			enable-back-to-top="true"
			refresher-enabled="true"
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh"
		>
			<view class="profile-content">
			<view class="user-info">
				<view class="user-content">
					<view class="user-name">
						<text class="name-text shimmer">天辰表友</text>
						<view class="vip-badge">VIP</view>
					</view>

					<view class="user-stats">
						<view class="stat-item">
							<text class="stat-value">{{ cardNumber }}</text>
							<text class="stat-label">会员卡号</text>
						</view>
						<view class="stat-divider"></view>
						<view class="stat-item">
							<text class="stat-value gold">{{ userPoints }}</text>
							<text class="stat-label">积分余额</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 优惠券列表 -->
			<view class="benefits-section">
				<view class="section-header">
					<text class="section-title">我的优惠券</text>
					<text class="section-count">{{ couponCount }}张</text>
				</view>
				<scroll-view class="benefits-scroll" scroll-x="true" show-scrollbar="false">
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
				</scroll-view>
			</view>

			<!-- 特权列表 -->
			<view class="benefits-section">
				<view class="section-header">
					<text class="section-title">我的特权</text>
					<text class="section-count">{{ privilegeCount }}项</text>
				</view>
				<scroll-view class="benefits-scroll" scroll-x="true" show-scrollbar="false">
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
				</scroll-view>
			</view>

			<!-- 功能菜单 -->
			<view class="menu-section">
				<!-- 管理员专用菜单 -->
				<view
					v-if="hasCustomerPermission"
					class="menu-item"
					@click="navigateToCustomer"
				>
					<view class="menu-item-content">
						<uni-icons type="person-filled" size="20" color="#007aff"></uni-icons>
						<text class="menu-text">客户管理</text>
					</view>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>

				<view class="menu-item">
					<view class="menu-item-content">
						<uni-icons type="list" size="20" color="#666"></uni-icons>
						<text class="menu-text">浏览历史</text>
					</view>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>

				<view class="menu-item">
					<view class="menu-item-content">
						<uni-icons type="gear-filled" size="20" color="#666"></uni-icons>
						<text class="menu-text">设置</text>
					</view>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>
			</view>			<button class="logout-btn" @click="handleLogout">退出登录</button>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { useUserStore } from '@/stores/user'
import LoginComponent from '@/components/LoginComponent.vue'

export default {
	components: {
		LoginComponent
	},
	data() {
		return {
			userInfoLoading: false,
			isRefreshing: false
		}
	},
	computed: {
		userStore() {
			return useUserStore()
		},
		hasCustomerPermission() {
			return this.userStore.hasCustomerPermission;
		},
		userInfo() {
			return this.userStore.userInfo || {}
		},
		// 从API获取卡号
		cardNumber() {
			return this.userInfo.card_number || 'VIP888168';
		},
		// 从API获取积分
		userPoints() {
			const points = this.userInfo.points || 12580;
			return points.toLocaleString();
		},
		// 优惠券列表
		coupons() {
			return this.userStore.coupons || [];
		},
		// 特权列表
		privileges() {
			return this.userStore.privileges || [];
		},
		// 优惠券数量
		couponCount() {
			return this.coupons.length;
		},
		// 特权数量
		privilegeCount() {
			return this.privileges.length;
		}
	},
	onLoad() {
		console.log('Profile 页面加载');
		// 页面加载完成，等待状态检查
		this.userInfoLoading = false;
	},

	onShow() {
		console.log('Profile 页面显示');
		// 页面显示，状态由Pinia自动管理
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
		},

		// 下拉刷新
		async onRefresh() {
			console.log('Profile页面 - 开始下拉刷新');
			this.isRefreshing = true;

			try {
				// TODO: 这里添加刷新逻辑
				// 例如：重新获取用户信息、刷新权限状态等
				console.log('Profile页面 - 刷新用户信息');

				// 模拟刷新延迟
				await new Promise(resolve => setTimeout(resolve, 1000));

				console.log('Profile页面 - 刷新完成');

			} catch (error) {
				console.error('Profile页面 - 刷新失败:', error);
				uni.showToast({
					title: '刷新失败',
					icon: 'error'
				});
			} finally {
				this.isRefreshing = false;
			}
		},

		// 导航到客户管理页面
		navigateToCustomer() {
			uni.navigateTo({
				url: '/pages/customer/customer'
			});
		},

		// 退出登录
		handleLogout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 调用 store 中的退出登录方法
						this.userStore.logout();

						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						});
					}
				}
			});
		},


	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.profile-scroll {
	height: 100vh;
}

.loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 50vh;

	.loading-text {
		margin-top: 10px;
		font-size: 14px;
		color: #999;
	}
}



.profile-content {
	padding: 20px;

	.user-info {
		background: white;
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 20px;
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
		border: 1px solid #f0f0f0;
		display: flex;
		align-items: center;
		gap: 20px;

		.avatar-container {
			position: relative;
			flex-shrink: 0;

			.avatar {
				width: 64px;
				height: 64px;
				border-radius: 16px;
				background-color: #f8f9fa;
			}

			.status-dot {
				position: absolute;
				bottom: 2px;
				right: 2px;
				width: 16px;
				height: 16px;
				background: linear-gradient(135deg, #4ade80, #22c55e);
				border: 3px solid white;
				border-radius: 50%;
				box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
			}
		}

		.user-content {
			flex: 1;
			min-width: 0;

			.user-name {
				display: flex;
				align-items: center;
				gap: 12px;
				margin-bottom: 16px;

				.name-text {
					font-size: 20px;
					font-weight: 600;
					color: #1a1a1a;

					&.shimmer {
						// 银黑色字体，银色流光叠加效果
						color: #3a3a3a; // 银黑色基础颜色，始终可见
						position: relative;

						&::after {
							content: '天辰表友';
							position: absolute;
							top: 0;
							left: 0;
							background: linear-gradient(
								135deg, // 左上到右下的角度
								transparent 0%,
								transparent 45%,
								#c0c0c0 50%, // 银色流光
								#e5e5e5 52%, // 亮银色流光峰值
								#c0c0c0 55%, // 银色流光
								transparent 60%,
								transparent 100%
							);
							background-size: 400% 400%;
							background-clip: text;
							-webkit-background-clip: text;
							-webkit-text-fill-color: transparent;
							animation: shimmer 5s linear infinite;
						}
					}
				}

				.vip-badge {
					background: linear-gradient(135deg, #fbbf24, #f59e0b);
					color: white;
					font-size: 10px;
					font-weight: 600;
					padding: 4px 8px;
					border-radius: 6px;
					text-transform: uppercase;
					letter-spacing: 0.5px;
				}
			}

			.user-stats {
				display: flex;
				align-items: center;
				gap: 20px;

				.stat-item {
					flex: 1;
					text-align: left;

					.stat-value {
						display: block;
						font-size: 16px;
						font-weight: 600;
						color: #1a1a1a;
						margin-bottom: 2px;

						&.gold {
							color: #f59e0b;
						}
					}

					.stat-label {
						font-size: 12px;
						color: #64748b;
						font-weight: 500;
					}
				}

				.stat-divider {
					width: 1px;
					height: 32px;
					background-color: #e2e8f0;
					flex-shrink: 0;
				}
			}
		}
	}

	// 优惠券和特权列表样式
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

		.benefits-scroll {
			width: 100%;
			overflow-x: auto;
		}

		.benefits-list {
			display: flex;
			gap: 16px;
			padding: 4px 20px 4px 4px;

			.benefit-card {
				width: calc(100vw - 80px);
				min-width: calc(100vw - 80px);
				flex-shrink: 0;
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

					.discount-badge {
						background: linear-gradient(135deg, #10b981, #059669);
						color: white;
						font-size: 12px;
						font-weight: 600;
						padding: 4px 8px;
						border-radius: 6px;
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
				width: calc(100vw - 80px);
				min-width: calc(100vw - 80px);
				flex-shrink: 0;
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

	.menu-section {
		background: white;
		border-radius: 12px;
		margin-bottom: 20px;

		.menu-item {
			padding: 16px 20px;
			border-bottom: 1px solid #f0f0f0;
			font-size: 16px;
			color: #333;
			display: flex;
			align-items: center;
			justify-content: space-between;

			&:last-child {
				border-bottom: none;
			}

			&:active {
				background-color: #f5f5f5;
			}

			.menu-item-content {
				display: flex;
				align-items: center;
				flex: 1;

				.menu-text {
					margin-left: 12px;
					font-size: 16px;
					color: #333;
				}
			}
		}
	}

	.logout-btn {
		background-color: #ff4757;
		color: white;
		border-radius: 8px;
		padding: 12px;
		border: none;
		font-size: 16px;
		width: 100%;

		&::after {
			border: none;
		}
	}
}

// 纯斜向流光动画 - 从左上到右下的单向流动
@keyframes shimmer {
	0% {
		background-position: -150% -150%;
	}
	100% {
		background-position: 150% 150%;
	}
}
</style>
