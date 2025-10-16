<template>
	<view
		v-if="loading"
		class="tab-loading-overlay"
		:style="{ backgroundColor: bgColor }"
	>
		<view class="loading-container">
			<!-- Loading图标 -->
			<view class="loading-icon" :style="{ width: iconSize, height: iconSize }">
				<view class="loading-spinner" :style="spinnerStyle"></view>
			</view>
			<!-- Loading文本 -->
			<text
				class="loading-text"
				:style="{ fontSize: fontSize, color: textColor }"
			>
				{{ loadingText }}
			</text>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

// 定义组件名称
defineOptions({
	name: 'TabSwitchLoading'
})

// 定义props
const props = defineProps({
	loading: {
		type: Boolean,
		default: false
	},
	loadingText: {
		type: String,
		default: '加载中...'
	},
	fontSize: {
		type: String,
		default: '32rpx'
	},
	iconSize: {
		type: String,
		default: '60rpx'
	},
	bgColor: {
		type: String,
		default: 'rgba(255, 255, 255, 0.95)'
	},
	textColor: {
		type: String,
		default: '#333'
	},
	loadingColor: {
		type: String,
		default: '#007aff'
	}
})

// 计算spinner样式
const spinnerStyle = computed(() => ({
	borderColor: `transparent transparent transparent ${props.loadingColor}`,
	borderWidth: '3rpx'
}))
</script>

<style lang="scss" scoped>
.tab-loading-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.loading-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20rpx;
}

.loading-spinner {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	border-style: solid;
	animation: spin 1s linear infinite;
}

.loading-text {
	text-align: center;
	line-height: 1.4;
}

/* 旋转动画 */
@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
