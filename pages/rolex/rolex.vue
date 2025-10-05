<template>
	<view class="container">
		<!-- 劳力士专区占位页面 -->
		<view class="rolex-placeholder">
			<!-- 背景装饰 -->
			<view class="bg-decoration">
				<view class="crown-icon">👑</view>
				<view class="luxury-circles">
					<view class="circle circle-1"></view>
					<view class="circle circle-2"></view>
					<view class="circle circle-3"></view>
				</view>
			</view>

			<!-- 主要内容 -->
			<view class="content-area">
				<view class="brand-title">ROLEX</view>
				<view class="brand-subtitle">劳力士专区</view>
				<view class="coming-soon">即将为您呈现</view>
				<view class="description">传奇制表工艺与卓越品质</view>

				<!-- 装饰性进度指示 -->
				<view class="progress-dots">
					<view class="dot active"></view>
					<view class="dot"></view>
					<view class="dot"></view>
					<view class="dot"></view>
				</view>
			</view>
		</view>

		<!-- 底部标签栏组件 -->
		<CustomTabBar />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue';
import { useTabBarStore } from '@/stores';

export default {
	components: {
		CustomTabBar
	},
	setup() {
		const tabBarStore = useTabBarStore()
		return {
			tabBarStore
		}
	},
	data() {
		return {

		}
	},
	onLoad() {

	},

	onShow() {
		// 设置当前页面的tabBar状态
		this.tabBarStore.setActiveTab('rolex')
	},

	methods: {

	}
}
</script>

<style lang="scss">
.container {
	height: 100vh;
	background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.rolex-placeholder {
	flex: 1;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;

	// 背景装饰
	.bg-decoration {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		overflow: hidden;

		.crown-icon {
			position: absolute;
			top: 10%;
			right: 10%;
			font-size: 80rpx;
			opacity: 0.1;
			animation: float-crown 6s ease-in-out infinite;
		}

		.luxury-circles {
			.circle {
				position: absolute;
				border-radius: 50%;
				border: 2rpx solid rgba(255, 215, 0, 0.2);
				background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);

				&.circle-1 {
					width: 300rpx;
					height: 300rpx;
					top: -150rpx;
					left: -150rpx;
					animation: rotate-slow 20s linear infinite;
				}

				&.circle-2 {
					width: 200rpx;
					height: 200rpx;
					bottom: -100rpx;
					right: -100rpx;
					animation: rotate-slow 15s linear infinite reverse;
				}

				&.circle-3 {
					width: 150rpx;
					height: 150rpx;
					top: 20%;
					left: 5%;
					animation: pulse-gold 4s ease-in-out infinite;
				}
			}
		}
	}

	// 主要内容区域
	.content-area {
		text-align: center;
		z-index: 2;
		max-width: 500rpx;

		.brand-title {
			font-size: 72rpx;
			font-weight: 900;
			color: #FFD700;
			letter-spacing: 8rpx;
			margin-bottom: 20rpx;
			text-shadow: 0 0 20rpx rgba(255, 215, 0, 0.3);
			animation: glow-gold 3s ease-in-out infinite alternate;
		}

		.brand-subtitle {
			font-size: 32rpx;
			color: #ffffff;
			margin-bottom: 40rpx;
			font-weight: 300;
			letter-spacing: 2rpx;
		}

		.coming-soon {
			font-size: 28rpx;
			color: rgba(255, 255, 255, 0.8);
			margin-bottom: 16rpx;
			font-weight: 500;
		}

		.description {
			font-size: 24rpx;
			color: rgba(255, 255, 255, 0.6);
			margin-bottom: 60rpx;
			line-height: 1.5;
			font-style: italic;
		}

		.progress-dots {
			display: flex;
			justify-content: center;
			gap: 20rpx;

			.dot {
				width: 16rpx;
				height: 16rpx;
				border-radius: 50%;
				background: rgba(255, 255, 255, 0.3);
				transition: all 0.3s ease;

				&.active {
					background: #FFD700;
					box-shadow: 0 0 10rpx rgba(255, 215, 0, 0.5);
					animation: pulse-dot 2s ease-in-out infinite;
				}
			}
		}
	}
}

// 动画效果
@keyframes float-crown {
	0%, 100% {
		transform: translateY(0rpx) rotate(0deg);
	}
	50% {
		transform: translateY(-20rpx) rotate(5deg);
	}
}

@keyframes rotate-slow {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

@keyframes glow-gold {
	0% {
		text-shadow: 0 0 20rpx rgba(255, 215, 0, 0.3);
	}
	100% {
		text-shadow: 0 0 30rpx rgba(255, 215, 0, 0.6), 0 0 40rpx rgba(255, 215, 0, 0.4);
	}
}

@keyframes pulse-gold {
	0%, 100% {
		opacity: 0.2;
		transform: scale(1);
	}
	50% {
		opacity: 0.4;
		transform: scale(1.1);
	}
}

@keyframes pulse-dot {
	0%, 100% {
		transform: scale(1);
		opacity: 1;
	}
	50% {
		transform: scale(1.2);
		opacity: 0.8;
	}
}
</style>
