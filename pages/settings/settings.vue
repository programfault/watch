<template>
	<view class="container">
		<!-- 设置内容 -->
		<view class="settings-content">
			<!-- 其他设置 -->
			<view class="settings-section">
				<view class="settings-group">
					<view class="setting-item">
						<view class="item-content">
							<uv-icon name="lock" size="20" color="#666"></uv-icon>
							<text class="item-text">隐私政策</text>
						</view>
						<uv-icon name="arrow-right" size="16" color="#ccc"></uv-icon>
					</view>

					<view class="setting-item">
						<view class="item-content">
							<uv-icon name="info-circle" size="20" color="#666"></uv-icon>
							<text class="item-text">关于我们</text>
						</view>
						<uv-icon name="arrow-right" size="16" color="#ccc"></uv-icon>
					</view>

					<view class="setting-item">
						<view class="item-content">
							<uv-icon name="reload" size="20" color="#666"></uv-icon>
							<text class="item-text">版本更新</text>
						</view>
						<view class="version-info">
							<text class="version-text">v1.0.0</text>
							<uv-icon name="arrow-right" size="16" color="#ccc"></uv-icon>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 退出登录 - 固定在底部 -->
		<view class="logout-section" v-if="userStore.isLoggedIn">
			<view class="logout-button" @click="handleLogout">
				<text class="logout-text">退出登录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { useUserStore } from '@/stores'
import { onLoad, onShow } from '@dcloudio/uni-app'

// 定义组件名称
defineOptions({
	name: 'SettingsPage'
})

// 获取 stores
const userStore = useUserStore()

// 响应式数据（暂时保留备用）
// const notificationEnabled = ref(true)
// const darkMode = ref(false)
// const autoRefresh = ref(true)

// 页面生命周期 - onLoad
onLoad(() => {
	console.log('Settings页面 onLoad')
	// 初始化设置数据
	initSettings()
})

// 页面生命周期 - onShow
onShow(() => {
	console.log('Settings页面 onShow')
})

// 初始化设置
const initSettings = () => {
	// 初始化页面设置
	console.log('设置页面初始化完成')
}

// 其他功能方法可以在这里添加

// 退出登录
const handleLogout = () => {
	console.log('handleLogout 方法被调用')
	uni.showModal({
		title: '确认退出',
		content: '确定要退出登录吗？',
		success: (res) => {
			console.log('Modal 回调，用户选择:', res.confirm)
			if (res.confirm) {
				console.log('开始执行退出登录')
				// 调用 store 中的退出登录方法
				userStore.logout()

				uni.showToast({
					title: '已退出登录',
					icon: 'success'
				})

				// 退出成功后返回上一页或跳转到登录页
				setTimeout(() => {
					uni.navigateBack()
				}, 1500)
			}
		}
	})
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.page-header {
	background: #fff;
	padding: 20px;
	border-bottom: 1px solid #f0f0f0;

	.page-title {
		font-size: 24px;
		font-weight: 600;
		color: #333;
	}
}

.settings-content {
	padding: 20px;
}

.settings-section {
	margin-bottom: 30px;

	.section-title {
		display: block;
		font-size: 16px;
		font-weight: 600;
		color: #333;
		margin-bottom: 12px;
		padding-left: 4px;
	}
}

.settings-group {
	background: white;
	border-radius: 4px;
	overflow: hidden;
	border: 1px solid #e5e5e5;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	border-bottom: 1px solid #f5f5f5;

	&:last-child {
		border-bottom: none;
	}

	&:active {
		background-color: #f8f8f8;
	}

	.item-content {
		display: flex;
		align-items: center;
		flex: 1;

		.item-text {
			margin-left: 12px;
			font-size: 16px;
			color: #333;
		}
	}

	.version-info {
		display: flex;
		align-items: center;
		gap: 8px;

		.version-text {
			font-size: 14px;
			color: #666;
		}
	}
}

// 退出登录固定在底部
.logout-section {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 20px;
	background-color: #f5f5f5;
	border-top: 1px solid #e5e5e5;

	.logout-button {
		background: white;
		border-radius: 4px;
		border: 1px solid #e5e5e5;
		padding: 16px;
		display: flex;
		align-items: center;
		justify-content: center;

		&:active {
			background-color: #f8f8f8;
		}

		.logout-text {
			font-size: 16px;
			color: #d32f2f;
			font-weight: 500;
		}
	}
}

// 为底部退出按钮留出空间
.container {
	padding-bottom: 100px;
}

// 样式结束
</style>
