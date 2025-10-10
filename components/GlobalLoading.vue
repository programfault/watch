<template>
	<!-- 不需要UI，使用原生loading API -->
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

defineOptions({
	name: 'GlobalLoading'
})

// 监听全局事件，使用原生loading API
onMounted(() => {
	// 监听显示tab切换loading事件
	uni.$on('showTabSwitchLoading', (tabName) => {
		const tabTextMap = {
			'home': '首页',
			'maintenance': '保养',
			'customer': '客户',
			'rolex': '劳力士',
			'profile': '我的'
		}

		const tabText = tabTextMap[tabName] || '页面'
		uni.showLoading({
			title: `${tabText}`,
			mask: false // 不需要遮罩，用户可以继续操作
		})
	})

	// 监听隐藏tab切换loading事件
	uni.$on('hideTabSwitchLoading', () => {
		uni.hideLoading()
	})
})

onUnmounted(() => {
	// 清理事件监听
	uni.$off('showTabSwitchLoading')
	uni.$off('hideTabSwitchLoading')
})
</script>

<style lang="scss" scoped>
/* 不需要样式，使用原生loading */
</style>
