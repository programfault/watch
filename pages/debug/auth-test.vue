<template>
	<view class="auth-test-container">
		<up-navbar title="登录状态测试" :fixed="true" :safe-area-inset-top="true"
			:placeholder="true" bg-color="#ffffff" title-color="#333333" height="44">
		</up-navbar>

		<view class="content">
			<up-card title="用户登录状态测试" :padding="20">
				<view class="status-info">
					<view class="status-item">
						<text class="label">登录状态：</text>
						<text :class="['value', userStore.isLoggedIn ? 'success' : 'error']">
							{{ userStore.isLoggedIn ? '已登录' : '未登录' }}
						</text>
					</view>

					<view class="status-item">
						<text class="label">用户信息：</text>
						<text class="value">{{ userStore.userInfo?.nickname || '无' }}</text>
					</view>

					<view class="status-item">
						<text class="label">Token状态：</text>
						<text :class="['value', userStore.tokens?.access_token ? 'success' : 'error']">
							{{ userStore.tokens?.access_token ? '存在' : '不存在' }}
						</text>
					</view>

					<view class="status-item">
						<text class="label">用户权限：</text>
						<text class="value">{{ userStore.permissions.join(', ') || '无' }}</text>
					</view>

					<view class="status-item">
						<text class="label">TabBar类型：</text>
						<text class="value">{{ tabBarStore.userType }}</text>
					</view>
				</view>

				<view class="actions">
					<up-button @click="testCheckLoginStatus" :loading="checking" type="primary"
						text="测试登录状态检查" size="normal"></up-button>

					<up-button @click="testTokenRefresh" :loading="refreshing" type="success"
						text="测试Token刷新" size="normal"></up-button>

					<up-button @click="testFetchUserInfo" :loading="fetching" type="warning"
						text="测试获取用户信息" size="normal"></up-button>

					<up-button @click="clearAllData" type="error"
						text="清除所有数据" size="normal"></up-button>
				</view>
			</up-card>

			<up-card title="测试日志" :padding="20" style="margin-top: 20px;">
				<scroll-view scroll-y style="height: 300px;">
					<view class="log-container">
						<view v-for="(log, index) in logs" :key="index"
							:class="['log-item', log.type]">
							<text class="log-time">{{ log.time }}</text>
							<text class="log-content">{{ log.content }}</text>
						</view>
					</view>
				</scroll-view>
				<view class="log-actions">
					<up-button @click="clearLogs" size="small" type="info" text="清除日志"></up-button>
				</view>
			</up-card>
		</view>
	</view>
</template>

<script setup>
import { useUserStore, useTabBarStore } from '@/stores'
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'

// 获取 stores
const userStore = useUserStore()
const tabBarStore = useTabBarStore()

// 响应式数据
const checking = ref(false)
const refreshing = ref(false)
const fetching = ref(false)
const logs = ref([])

// 添加日志
const addLog = (content, type = 'info') => {
	const now = new Date()
	const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

	logs.value.unshift({
		time,
		content,
		type
	})

	// 限制日志数量
	if (logs.value.length > 100) {
		logs.value = logs.value.slice(0, 100)
	}
}

// 测试登录状态检查
const testCheckLoginStatus = async () => {
	checking.value = true
	addLog('开始测试登录状态检查...', 'info')

	try {
		await userStore.checkLoginStatus()
		addLog('登录状态检查完成', 'success')
		addLog(`结果: ${userStore.isLoggedIn ? '已登录' : '未登录'}`, userStore.isLoggedIn ? 'success' : 'warning')
	} catch (error) {
		addLog(`登录状态检查失败: ${error.message}`, 'error')
	} finally {
		checking.value = false
	}
}

// 测试Token刷新
const testTokenRefresh = async () => {
	if (!userStore.tokens?.refresh_token) {
		addLog('没有refresh_token，无法测试刷新', 'warning')
		return
	}

	refreshing.value = true
	addLog('开始测试Token刷新...', 'info')

	try {
		const result = await userStore.refreshUserToken()
		if (result) {
			addLog('Token刷新成功', 'success')
		} else {
			addLog('Token刷新失败', 'error')
		}
	} catch (error) {
		addLog(`Token刷新异常: ${error.message}`, 'error')
	} finally {
		refreshing.value = false
	}
}

// 测试获取用户信息
const testFetchUserInfo = async () => {
	if (!userStore.tokens?.access_token) {
		addLog('没有access_token，无法测试获取用户信息', 'warning')
		return
	}

	fetching.value = true
	addLog('开始测试获取用户信息...', 'info')

	try {
		await userStore.fetchUserInfo()
		addLog('用户信息获取成功', 'success')
		addLog(`用户昵称: ${userStore.userInfo?.nickname || '无'}`, 'info')
	} catch (error) {
		addLog(`用户信息获取失败: ${error.message}`, 'error')
	} finally {
		fetching.value = false
	}
}

// 清除所有数据
const clearAllData = () => {
	uni.showModal({
		title: '确认清除',
		content: '确定要清除所有用户数据吗？',
		success: (res) => {
			if (res.confirm) {
				userStore.logout(false)
				addLog('所有用户数据已清除', 'warning')
			}
		}
	})
}

// 清除日志
const clearLogs = () => {
	logs.value = []
}

onLoad(() => {
	addLog('测试页面加载完成', 'info')
	addLog(`当前登录状态: ${userStore.isLoggedIn ? '已登录' : '未登录'}`, 'info')
})

onShow(() => {
	addLog('测试页面显示', 'info')
})
</script>

<style lang="scss" scoped>
.auth-test-container {
	min-height: 100vh;
	background-color: #f8f9fa;
}

.content {
	padding: 80px 16px 20px 16px;
}

.status-info {
	margin-bottom: 20px;
}

.status-item {
	display: flex;
	align-items: center;
	padding: 8px 0;
	border-bottom: 1px solid #eee;

	.label {
		width: 80px;
		font-size: 14px;
		color: #666;
	}

	.value {
		flex: 1;
		font-size: 14px;
		color: #333;

		&.success {
			color: #07c160;
		}

		&.error {
			color: #fa5151;
		}
	}
}

.actions {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.log-container {
	.log-item {
		padding: 8px;
		margin-bottom: 8px;
		border-radius: 4px;
		font-size: 12px;

		&.info {
			background-color: #e7f3ff;
			color: #007aff;
		}

		&.success {
			background-color: #e1f3d8;
			color: #07c160;
		}

		&.warning {
			background-color: #fff2e6;
			color: #fa8c16;
		}

		&.error {
			background-color: #ffebee;
			color: #fa5151;
		}

		.log-time {
			font-weight: bold;
			margin-right: 8px;
		}

		.log-content {
			word-break: break-all;
		}
	}
}

.log-actions {
	padding-top: 10px;
	border-top: 1px solid #eee;
}
</style>
