<template>
	<view class="debug-container">
		<view class="debug-header">
			<text class="title">登录调试页面</text>
			<text class="subtitle">用于排查真机登录问题</text>
		</view>

		<view class="debug-section">
			<text class="section-title">环境检测</text>
			<view class="debug-item">
				<text class="label">运行环境:</text>
				<text class="value">{{ platform }}</text>
			</view>
			<view class="debug-item">
				<text class="label">微信版本:</text>
				<text class="value">{{ wechatVersion }}</text>
			</view>
			<view class="debug-item">
				<text class="label">基础库版本:</text>
				<text class="value">{{ sdkVersion }}</text>
			</view>
		</view>

		<view class="debug-section">
			<text class="section-title">网络检测</text>
			<button @click="testNetwork" class="debug-btn">测试网络连接</button>
			<view class="debug-item">
				<text class="label">网络状态:</text>
				<text class="value">{{ networkStatus }}</text>
			</view>
		</view>

		<view class="debug-section">
			<text class="section-title">登录测试</text>
			<button @click="testLogin" class="debug-btn" :loading="loginTesting">测试微信登录</button>
			<view class="debug-item">
				<text class="label">登录状态:</text>
				<text class="value">{{ loginResult }}</text>
			</view>
		</view>

		<view class="debug-section">
			<text class="section-title">API测试</text>
			<button @click="testApi" class="debug-btn" :loading="apiTesting">测试API连接</button>
			<view class="debug-item">
				<text class="label">API状态:</text>
				<text class="value">{{ apiResult }}</text>
			</view>
		</view>

		<view class="debug-section">
			<text class="section-title">调试日志</text>
			<scroll-view class="log-container" scroll-y>
				<view v-for="(log, index) in logs" :key="index" class="log-item">
					<text class="log-time">{{ log.time }}</text>
					<text class="log-content" :class="log.level">{{ log.message }}</text>
				</view>
			</scroll-view>
			<button @click="clearLogs" class="debug-btn clear-btn">清除日志</button>
		</view>

		<view class="debug-section">
			<button @click="goToLogin" class="debug-btn primary-btn">返回登录页面</button>
		</view>
	</view>
</template>

<script>
import { post } from '@/utils/request'

export default {
	data() {
		return {
			platform: '',
			wechatVersion: '',
			sdkVersion: '',
			networkStatus: '未检测',
			loginResult: '未测试',
			apiResult: '未测试',
			loginTesting: false,
			apiTesting: false,
			logs: []
		}
	},

	onLoad() {
		this.getSystemInfo()
		this.addLog('页面加载完成', 'info')
	},

	methods: {
		// 获取系统信息
		async getSystemInfo() {
			try {
				const systemInfo = await uni.getSystemInfo()
				this.platform = systemInfo.platform || '未知'
				this.addLog(`系统信息获取成功: ${this.platform}`, 'info')

				// 获取微信相关信息
				if (uni.getAccountInfoSync) {
					const accountInfo = uni.getAccountInfoSync()
					this.addLog(`小程序信息: ${JSON.stringify(accountInfo)}`, 'info')
				}

				// 获取网络信息
				uni.getNetworkType({
					success: (res) => {
						this.networkStatus = res.networkType
						this.addLog(`网络类型: ${res.networkType}`, 'info')
					}
				})

			} catch (error) {
				this.addLog(`获取系统信息失败: ${error.message}`, 'error')
			}
		},

		// 测试网络连接
		async testNetwork() {
			this.addLog('开始测试网络连接...', 'info')

			try {
				// 测试基础网络
				const networkType = await uni.getNetworkType()
				this.networkStatus = networkType.networkType
				this.addLog(`网络类型检测成功: ${networkType.networkType}`, 'success')

				// 测试API服务器连通性
				uni.request({
					url: 'http://116.198.203.44:8000/api/mini/health',
					method: 'GET',
					timeout: 5000,
					success: (res) => {
						this.addLog(`API服务器连通性测试成功: ${res.statusCode}`, 'success')
					},
					fail: (err) => {
						this.addLog(`API服务器连通性测试失败: ${err.errMsg}`, 'error')
					}
				})

			} catch (error) {
				this.addLog(`网络测试失败: ${error.message}`, 'error')
			}
		},

		// 测试微信登录
		async testLogin() {
			this.loginTesting = true
			this.addLog('开始测试微信登录...', 'info')

			try {
				// 测试uni.login
				const loginRes = await new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: resolve,
						fail: reject
					})
				})

				this.addLog(`uni.login成功: ${JSON.stringify(loginRes)}`, 'success')

				if (loginRes.code) {
					this.loginResult = `获取到code: ${loginRes.code.substring(0, 10)}...`
					this.addLog(`登录code: ${loginRes.code}`, 'info')

					// 测试发送到后端
					try {
						const response = await post('/login', { code: loginRes.code }, {
							showLoading: true,
							showError: false
						})

						this.addLog(`后端登录接口调用成功: ${JSON.stringify(response)}`, 'success')
						this.loginResult = '登录测试成功'

					} catch (apiError) {
						this.addLog(`后端登录接口调用失败: ${apiError.message}`, 'error')
						this.loginResult = `API调用失败: ${apiError.message}`
					}
				} else {
					this.loginResult = '未获取到code'
					this.addLog('未获取到登录code', 'error')
				}

			} catch (error) {
				this.addLog(`微信登录失败: ${error.message || error.errMsg}`, 'error')
				this.loginResult = `登录失败: ${error.message || error.errMsg}`
			} finally {
				this.loginTesting = false
			}
		},

		// 测试API连接
		async testApi() {
			this.apiTesting = true
			this.addLog('开始测试API连接...', 'info')

			try {
				// 使用uni.request测试
				const result = await new Promise((resolve, reject) => {
					uni.request({
						url: 'http://116.198.203.44:8000/api/mini/health',
						method: 'GET',
						header: {
							'content-type': 'application/json'
						},
						success: resolve,
						fail: reject
					})
				})

				this.addLog(`uni.request测试成功: ${JSON.stringify(result.data)}`, 'success')
				this.apiResult = `连接成功 (${result.statusCode})`

			} catch (error) {
				this.addLog(`uni.request测试失败: ${error.errMsg}`, 'error')
				this.apiResult = `连接失败: ${error.errMsg}`
			} finally {
				this.apiTesting = false
			}
		},

		// 添加日志
		addLog(message, level = 'info') {
			const time = new Date().toLocaleTimeString()
			this.logs.unshift({ time, message, level })

			// 限制日志数量
			if (this.logs.length > 50) {
				this.logs = this.logs.slice(0, 50)
			}

			// 同时输出到控制台
			console.log(`[${level.toUpperCase()}] ${message}`)
		},

		// 清除日志
		clearLogs() {
			this.logs = []
			this.addLog('日志已清除', 'info')
		},

		// 返回登录页面
		goToLogin() {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.debug-container {
	padding: 20px;
	background: #f5f5f5;
	min-height: 100vh;
}

.debug-header {
	text-align: center;
	margin-bottom: 30px;

	.title {
		font-size: 24px;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 5px;
	}

	.subtitle {
		font-size: 14px;
		color: #666;
		display: block;
	}
}

.debug-section {
	background: white;
	border-radius: 12px;
	padding: 20px;
	margin-bottom: 20px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

	.section-title {
		font-size: 18px;
		font-weight: bold;
		color: #333;
		margin-bottom: 15px;
		display: block;
	}
}

.debug-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
	padding: 8px 0;
	border-bottom: 1px solid #f0f0f0;

	.label {
		font-size: 14px;
		color: #666;
		font-weight: 500;
	}

	.value {
		font-size: 14px;
		color: #333;
		max-width: 60%;
		word-break: break-all;
	}
}

.debug-btn {
	width: 100%;
	height: 44px;
	background: #007aff;
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 16px;
	margin-bottom: 15px;

	&.clear-btn {
		background: #ff6b6b;
	}

	&.primary-btn {
		background: #10b981;
	}
}

.log-container {
	max-height: 300px;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	padding: 10px;
	background: #f9f9f9;
	margin-bottom: 10px;
}

.log-item {
	margin-bottom: 8px;
	padding: 5px;
	border-radius: 4px;
	background: white;

	.log-time {
		font-size: 12px;
		color: #999;
		margin-right: 8px;
	}

	.log-content {
		font-size: 13px;

		&.info { color: #333; }
		&.success { color: #10b981; }
		&.error { color: #ff6b6b; }
		&.warn { color: #ff9500; }
	}
}
</style>
