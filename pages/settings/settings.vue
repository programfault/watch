<template>
	<view class="container">
		<!-- 设置内容 -->
		<view class="settings-content">
		<!-- 设置列表 -->
		<view class="settings-group">
			<up-cell-group :border="false">
				<up-cell
					title="隐私政策"
					isLink
					arrow-direction="right"
				>
					<template #icon>
						<up-icon name="lock" size="20" color="#666" style="margin-right: 8px;"></up-icon>
					</template>
				</up-cell>				<up-cell
					title="关于我们"
					isLink
					arrow-direction="right"
				>
					<template #icon>
						<up-icon name="info-circle" size="20" color="#666" style="margin-right: 8px;"></up-icon>
					</template>
				</up-cell>

				<up-cell
					title="版本更新"
					value="v1.0.0"
				>
					<template #icon>
						<up-icon name="tags" size="20" color="#666" style="margin-right: 8px;"></up-icon>
					</template>
				</up-cell>

				<!-- 退出登录 -->
				<up-cell
					v-if="userStore.isLoggedIn"
					title="退出登录"
					isLink
					arrow-direction="right"
					@click="handleLogout"
				>
					<template #icon>
						<up-icon name="lock-open" size="20" color="#d32f2f" style="margin-right: 8px;"></up-icon>
					</template>
					<template #title>
						<text style="color: #d32f2f; font-weight: 500;">退出登录</text>
					</template>
				</up-cell>
			</up-cell-group>
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

.settings-content {
	padding: 30rpx;
}

.settings-group {
	background: white;
	overflow: hidden;
	border: 1px solid #f0f0f0;
}
</style>
