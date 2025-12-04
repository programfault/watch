<template>
	<u-popup
		v-model:show="showPopup"
		mode="bottom"
		:closeOnClickOverlay="true"
		:round="20"
		:safeAreaInsetBottom="true"
		bgColor="#fff"
		@close="closePanel"
	>
		<view class="consumer-panel">
			<!-- 头部 -->
			<view class="consumer-header">
				<text class="header-title">{{ panelTitle }}</text>
				<view class="header-actions">
					<text class="close-btn" @click="closePanel">×</text>
				</view>
			</view>

			<!-- 内容区域 -->
			<scroll-view scroll-y class="consumer-content">
				<!-- 操作区域 -->

				<!-- 用户信息更新区域 -->
				<view v-if="actionType === 'update'" class="action-section user-info-section">
					<!-- 姓名 -->
					<view class="form-item">
						<text class="form-label">姓名</text>
						<u-input
							v-model="userForm.name"
							placeholder="请输入姓名"
							:clearable="true"
						/>
					</view>

					<!-- 性别 -->
					<view class="form-item">
						<text class="form-label">性别</text>
						<u-radio-group v-model="userForm.gender" placement="row">
							<u-radio
								v-for="item in genderOptions"
								:key="item.value"
								:name="item.value"
								:label="item.label"
							/>
						</u-radio-group>
					</view>

					<!-- 手机号 -->
					<view class="form-item">
						<text class="form-label">手机号</text>
						<u-input
							v-model="userForm.phone"
							placeholder="请输入手机号"
							:clearable="true"
							type="number"
						/>
					</view>

					<!-- 生日 -->
					<view class="form-item">
						<text class="form-label">生日</text>
						<u-datetime-picker
							v-model="userForm.birthday"
							mode="date"
							:hasInput="true"
							placeholder="请选择生日"
							format="YYYY-M-D"
							:minDate="new Date('1900-01-01').getTime()"
							:maxDate="new Date().getTime()"
							@confirm="onBirthdayConfirm"
						/>
					</view>

					<!-- 备注 -->
					<view class="form-item">
						<text class="form-label">备注</text>
						<u-textarea
							v-model="userForm.remark"
							placeholder="请输入备注信息"
							:clearable="true"
							:autoHeight="true"
							maxlength="200"
						/>
					</view>
				</view>

				<!-- 积分区域 -->
				<view v-if="showPoints && actionType !== 'update'" class="action-section">
					<text class="section-title">{{ pointsTitle }}</text>
					<view class="points-input-wrapper">
						<u-input
							v-model="giftPoints"
							:placeholder="pointsPlaceholder"
							type="number"
							:clearable="true"
							@input="onPointsInput"
						/>
					</view>
				</view>

				<!-- 优惠券区域 -->
				<view v-if="showCoupons && actionType !== 'update'" class="action-section">
					<text class="section-title">{{ couponsTitle }}{{ actionType === 'verify' ? '（单选）' : '（多选）' }}</text>
					<view class="coupons-list">
						<view
							v-for="coupon in filteredCoupons"
							:key="coupon.id"
							class="benefit-card coupon-card"
							:class="{ 'selected': selectedCoupons.includes(coupon.id) }"
							@click="toggleCouponSelection(coupon.id)"
						>
							<view class="card-content">
								<text class="card-title">{{ coupon.name }}</text>
								<text class="card-description">{{ coupon.description }}</text>
								<view v-if="coupon.end_date" class="card-date">
									<text class="date-label">截止日期：</text>
									<text class="date-value">{{ formatDate(coupon.end_date) }}</text>
								</view>
							</view>
							<view class="card-check" v-if="selectedCoupons.includes(coupon.id)">
								<text class="check-icon">✓</text>
							</view>
						</view>
						<view v-if="filteredCoupons.length === 0 && coupons.length > 0 && actionType === 'gift'" class="empty-list warning">
							<text class="empty-text">积分不足，暂无可赠送优惠券</text>
							<text class="empty-sub-text">当前积分：{{ userPoints }}，需要更多积分解锁优惠券</text>
						</view>
						<view v-else-if="filteredCoupons.length === 0" class="empty-list">
							<text class="empty-text">暂无可用优惠券</text>
						</view>
					</view>
				</view>

				<!-- 特权区域 -->
				<view v-if="showPrivileges && actionType !== 'update'" class="action-section">
					<text class="section-title">{{ privilegesTitle }}{{ actionType === 'verify' ? '（单选）' : '（多选）' }}</text>
					<view class="privileges-list">
						<view
							v-for="privilege in privileges"
							:key="privilege.id"
							class="benefit-card privilege-card"
							:class="{ 'selected': selectedPrivileges.includes(privilege.id) }"
							@click="togglePrivilegeSelection(privilege.id)"
						>
							<view class="card-content">
								<text class="card-title">{{ privilege.name }}</text>
								<text class="card-description">{{ privilege.description }}</text>
								<view v-if="privilege.end_date" class="card-date">
									<text class="date-label">截止日期：</text>
									<text class="date-value">{{ formatDate(privilege.end_date) }}</text>
								</view>
							</view>
							<view class="card-check" v-if="selectedPrivileges.includes(privilege.id)">
								<text class="check-icon">✓</text>
							</view>
						</view>
						<view v-if="privileges.length === 0" class="empty-list">
							<text class="empty-text">暂无可用特权</text>
						</view>
					</view>
				</view>

				<!-- 默认提示区域（当所有区域都隐藏时） -->
				<view v-if="actionType !== 'update' && !showPoints && !showCoupons && !showPrivileges" class="action-section">
					<text class="section-title">选择内容</text>
					<view class="placeholder-content">
						<text class="placeholder-text">{{ selectHintText }}</text>
					</view>
				</view>
			</scroll-view>

			<!-- 底部按钮 -->
			<view class="consumer-footer">
				<view class="confirm-btn" @click="confirmAction">
					<text class="confirm-text">{{ confirmText }}</text>
				</view>
			</view>
		</view>
	</u-popup>
</template>

<script setup>
import { processConsumerAction } from '@/api/app'
import { computed, onMounted, ref, watch } from 'vue'

// 定义组件名称
defineOptions({
	name: 'ConsumerPanel'
})

// 定义props
const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	actionType: {
		type: String,
		default: 'gift' // 'gift' | 'verify'
	},
	consumerData: {
		type: Object,
		default: null
	},
	// 优惠券列表数据
	coupons: {
		type: Array,
		default: () => []
	},
	// 特权列表数据
	privileges: {
		type: Array,
		default: () => []
	},
	// 是否显示积分区域
	showPoints: {
		type: Boolean,
		default: true
	},
	// 是否显示优惠券区域
	showCoupons: {
		type: Boolean,
		default: true
	},
	// 是否显示特权区域
	showPrivileges: {
		type: Boolean,
		default: true
	},
	// 用户当前积分
	userPoints: {
		type: Number,
		default: 0
	}
})

// 定义事件
const emit = defineEmits(['close', 'success'])

// 创建响应式数据
const showPopup = ref(false)

// 基础函数定义（先定义后使用）
const openPanel = () => {
	showPopup.value = true
}

const closePanel = () => {
	showPopup.value = false
	resetSelections()
	emit('close')
}

const resetSelections = () => {
	giftPoints.value = ''
	selectedCoupons.value = []
	selectedPrivileges.value = []
	// 重置用户表单
	userForm.value = {
		name: '',
		gender: '',
		phone: '',
		birthday: '',
		remark: ''
	}
}

// 响应式数据
const giftPoints = ref(0)
const selectedCoupons = ref([])
const selectedPrivileges = ref([])

// uview plus 组件相关的响应式数据（已不需要）

// 用户信息表单数据
const userForm = ref({
	name: '',
	gender: '',
	phone: '',
	birthday: '',
	remark: ''
})

// 性别选项
const genderOptions = [
	{ value: '1', label: '男' },
	{ value: '2', label: '女' }
]

// 计算属性
const panelTitle = computed(() => {
	if (props.actionType === 'update') return '更新用户信息'
	return props.actionType === 'gift' ? '赠送' : '核销'
})

const pointsTitle = computed(() => {
	return `${props.actionType === 'gift' ? '赠送' : '扣除'}积分`
})

const couponsTitle = computed(() => {
	return `${props.actionType === 'gift' ? '赠送' : '核销'}优惠券`
})

const privilegesTitle = computed(() => {
	return `${props.actionType === 'gift' ? '赠送' : '核销'}特权`
})

const pointsPlaceholder = computed(() => {
	return `请输入要${props.actionType === 'gift' ? '赠送' : '扣除'}的积分数量`
})

const confirmText = computed(() => {
	if (props.actionType === 'update') return '确定更新'
	return `确定${props.actionType === 'gift' ? '赠送' : '核销'}`
})

const selectHintText = computed(() => {
	return `请选择要${props.actionType === 'gift' ? '赠送' : '核销'}的内容`
})

// 性别文本显示（u-radio-group 自动处理，不再需要）

const filteredCoupons = computed(() => {
	if (props.actionType !== 'gift') {
		// 核销模式显示所有优惠券
		return props.coupons
	}
	// 赠送模式需要过滤积分门槛
	return props.coupons.filter(coupon => {
		// 如果没有积分门槛，则显示
		if (!coupon.points_threshold && coupon.points_threshold !== 0) {
			return true
		}
		// 用户积分大于等于门槛积分
		return props.userPoints >= coupon.points_threshold
	})
})

// 格式化日期
const formatDate = (dateStr) => {
	if (!dateStr) return ''
	try {
		const date = new Date(dateStr)
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	} catch (_error) {
		return dateStr
	}
}

// 生命周期
onMounted(() => {
	console.log(`ConsumerPanel 组件已加载 - 操作类型: ${props.actionType}, 优惠券: ${filteredCoupons.value.length}/${props.coupons.length}个, 特权: ${props.privileges.length}个, 用户积分: ${props.userPoints}`)
})

// 监听器
watch(() => props.visible, (newVal) => {
	showPopup.value = newVal
	if (!newVal) {
		resetSelections()
	}
}, { immediate: true })

watch(() => props.actionType, () => {
	// 当操作类型改变时，重置选择状态
	resetSelections()
	// 如果是更新模式，初始化用户表单数据
	if (props.actionType === 'update' && props.consumerData) {
		initUserForm()
	}
})

watch(() => props.consumerData, () => {
	// 如果是更新模式，初始化用户表单数据
	if (props.actionType === 'update' && props.consumerData) {
		initUserForm()
	}
})

// 初始化用户表单数据
const initUserForm = () => {
	if (props.consumerData) {
		userForm.value = {
			name: props.consumerData.name || '',
			gender: props.consumerData.gender ? String(props.consumerData.gender) : '',
			phone: '',
			birthday: formatBirthdayForDisplay(props.consumerData.birthday) || '',
			remark: props.consumerData.remark || ''
		}
	}
}

// 格式化生日用于显示（将后台的 Y-m-d 格式转换为组件需要的格式）
const formatBirthdayForDisplay = (birthday) => {
	if (!birthday) return ''

	// 如果已经是时间戳格式，直接返回
	if (typeof birthday === 'number') {
		return birthday
	}

	// 如果是字符串格式，尝试转换为时间戳
	try {
		// 处理 Y-m-d 格式，如 "2024-1-5" 或 "2024-01-05"
		const date = new Date(birthday)
		if (isNaN(date.getTime())) {
			return ''
		}
		return date.getTime()
	} catch (error) {
		console.error('日期格式转换失败:', birthday, error)
		return ''
	}
}

// 切换优惠券选择状态
const toggleCouponSelection = (couponId) => {
	if (props.actionType === 'verify') {
		// 核销模式下为单选
		if (selectedCoupons.value.includes(couponId)) {
			selectedCoupons.value = []
		} else {
			selectedCoupons.value = [couponId]
		}
	} else {
		// 赠送模式下为多选
		const index = selectedCoupons.value.indexOf(couponId)
		if (index > -1) {
			selectedCoupons.value.splice(index, 1)
		} else {
			selectedCoupons.value.push(couponId)
		}
	}
}

// 切换特权选择状态
const togglePrivilegeSelection = (privilegeId) => {
	if (props.actionType === 'verify') {
		// 核销模式下为单选
		if (selectedPrivileges.value.includes(privilegeId)) {
			selectedPrivileges.value = []
		} else {
			selectedPrivileges.value = [privilegeId]
		}
	} else {
		// 赠送模式下为多选
		const index = selectedPrivileges.value.indexOf(privilegeId)
		if (index > -1) {
			selectedPrivileges.value.splice(index, 1)
		} else {
			selectedPrivileges.value.push(privilegeId)
		}
	}
}

// 重置选择状态已在上方定义

// 生日选择确认（可选的额外处理）
const onBirthdayConfirm = (e) => {
	console.log('生日选择确认:', e)
	// u-datetime-picker 会自动更新 v-model，这里可以做额外处理
	// 确保日期格式为 Y-m-d 格式发送给后台
	if (e.value) {
		const date = new Date(e.value)
		const year = date.getFullYear()
		const month = date.getMonth() + 1
		const day = date.getDate()
		// 注意：这里不直接修改 userForm.value.birthday，让组件自己处理显示
		// userForm.value.birthday 会保持时间戳格式用于显示
		// 在提交时再转换为 Y-m-d 格式
		console.log('格式化后的日期将在提交时转换为:', `${year}-${month}-${day}`)
	}
}

// 格式化生日用于提交（将时间戳转换为后台需要的 Y-m-d 格式）
const formatBirthdayForSubmit = (birthday) => {
	if (!birthday) return ''

	try {
		const date = new Date(birthday)
		if (isNaN(date.getTime())) {
			return ''
		}
		const year = date.getFullYear()
		const month = date.getMonth() + 1
		const day = date.getDate()
		return `${year}-${month}-${day}`
	} catch (error) {
		console.error('日期格式转换失败:', birthday, error)
		return ''
	}
}

// 积分输入验证
const onPointsInput = (value) => {
	// 只允许输入数字，自动过滤非数字字符
	const numericValue = String(value).replace(/[^0-9]/g, '')

	// 限制最大值
	let finalValue = parseInt(numericValue) || 0
	if (finalValue > 99999) {
		finalValue = 99999
	}

	// 更新值
	giftPoints.value = finalValue
}

const confirmAction = async () => {
	// 验证操作数据
	if (!props.consumerData || !props.consumerData.id) {
		uni.showToast({
			title: '消费者信息缺失',
			icon: 'none'
		})
		return
	}

	let payload = {}

	if (props.actionType === 'update') {
		// 更新用户信息模式
		// 构建用户信息更新payload
		payload = {
			actionType: props.actionType,
			consumerId: props.consumerData.id,
			userInfo: {
				name: userForm.value.name.trim(),
				gender: userForm.value.gender ? parseInt(userForm.value.gender) : 0,
				phone: userForm.value.phone.trim(),
				birthday: formatBirthdayForSubmit(userForm.value.birthday),
				remark: userForm.value.remark.trim()
			}
		}
	} else {
		// 赠送/核销模式
		// 获取操作数据
		const points = giftPoints.value ? parseInt(giftPoints.value) : 0
		const coupons = selectedCoupons.value || []
		const privileges = selectedPrivileges.value || []

		// 验证是否有选择内容
		if (points <= 0 && coupons.length === 0 && privileges.length === 0) {
			uni.showToast({
				title: `请选择要${props.actionType === 'gift' ? '赠送' : '核销'}的内容`,
				icon: 'none'
			})
			return
		}

		// 构建赠送/核销payload
		payload = {
			actionType: props.actionType,
			consumerId: props.consumerData.id,
			points: points,
			coupons: coupons,
			privileges: privileges
		}
	}

	try {
		console.log('发送消费者操作请求:', payload)

		// 调用API
		const response = await processConsumerAction(payload)

		console.log('消费者操作响应:', response)

		// 显示成功提示
		const successTitle = props.actionType === 'update' ? '用户信息更新成功' :
			`${props.actionType === 'gift' ? '赠送' : '核销'}操作成功`
		uni.showToast({
			title: successTitle,
			icon: 'success'
		})

		// 发送成功事件给父组件
		emit('success', {
			actionType: props.actionType,
			consumer: props.consumerData,
			response: response
		})

		// 关闭面板
		closePanel()

	} catch (error) {
		console.error('消费者操作失败:', error)

		// 处理不同类型的错误响应
		let errorMessage = ''

		// 检查是否是服务器返回的结构化错误
		if (error && typeof error === 'object') {
			// 情况1: 直接包含 message 字段的错误对象
			if (error.message) {
				errorMessage = error.message
			}
			// 情况2: 包含 code 和 message 的响应结构
			else if (error.code === 500 && error.message) {
				errorMessage = error.message
			}
			// 情况3: 嵌套在 response 或 data 中的错误信息
			else if (error.response && error.response.message) {
				errorMessage = error.response.message
			}
			else if (error.data && error.data.message) {
				errorMessage = error.data.message
			}
		}

		// 如果没有找到具体错误消息，使用默认消息
		if (!errorMessage) {
			errorMessage = props.actionType === 'update' ? '用户信息更新失败' :
				`${props.actionType === 'gift' ? '赠送' : '核销'}操作失败`
		}

		// 显示错误提示
		uni.showToast({
			title: errorMessage,
			icon: 'none',
			duration: 3000
		})
	}
}

// 暴露方法给父组件使用
defineExpose({
	openPanel,
	closePanel
})
</script>

<style lang="scss" scoped>
.consumer-panel {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 100vw;
	height: 75vh;
	box-sizing: border-box;
}

.consumer-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;
	flex-shrink: 0;

	.header-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.header-actions {
		display: flex;
		align-items: center;

		.close-btn {
			font-size: 40rpx;
			color: #666;
			line-height: 1;
		}
	}
}

.consumer-content {
	flex: 1;
	padding: 0 20rpx;
	overflow-y: auto;
	overflow-x: hidden;
	min-height: 0;
	max-width: 100%;
	width: 100%;
	box-sizing: border-box;
}

.consumer-info-section,
.action-section {
	margin-bottom: 40rpx;

	.section-title {
		display: block;
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		padding-top: 30rpx;
	}
}

// 用户信息表单样式
.user-info-section {
	.form-item {
		margin-bottom: 30rpx;

		.form-label {
			display: block;
			font-size: 28rpx;
			color: #333;
			margin-bottom: 10rpx;
			font-weight: 500;
		}

		// uview-plus 组件样式
		:deep(.u-input) {
			border: 1px solid #e0e0e0;
			border-radius: 8rpx;

			&[readonly] {
				cursor: pointer;
				background-color: #fafafa;

				&:hover {
					border-color: #007aff;
					background-color: #f0f8ff;
				}
			}
		}

		:deep(.u-textarea) {
			border: 1px solid #e0e0e0;
			border-radius: 8rpx;
		}
	}
}

.consumer-info-card {
	background-color: #f9f9f9;
	border-radius: 16rpx;
	padding: 24rpx;
	border: 1rpx solid #eee;

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.info-label {
			font-size: 28rpx;
			color: #666;
		}

		.info-value {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
		}
	}
}

.placeholder-content {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 200rpx;
	background-color: #f9f9f9;
	border-radius: 16rpx;
	border: 1rpx solid #eee;

	.placeholder-text {
		font-size: 28rpx;
		color: #999;
		text-align: center;
	}
}

// 通用的操作区域样式
.action-section {
	margin-bottom: 40rpx;
	width: 100%;
	box-sizing: border-box;

	.section-title {
		display: block;
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		padding-top: 30rpx;
	}
}

// 积分输入框样式
.points-input-wrapper {
	margin-bottom: 20rpx;
	width: 100%;
	box-sizing: border-box;
}

// 福利卡片通用样式
.benefit-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx;
	margin-bottom: 16rpx;
	border-radius: 16rpx;
	border: 2rpx solid;
	background-color: #fff;
	transition: all 0.3s ease;
	position: relative;
	width: 100%;
	box-sizing: border-box;
	overflow: hidden;

	&:last-child {
		margin-bottom: 0;
	}

	.card-content {
		flex: 1;
		min-width: 0; /* 允许弹性元素缩小 */
		padding-right: 15rpx;

		.card-title {
			display: block;
			font-size: 28rpx;
			font-weight: bold;
			margin-bottom: 8rpx;
			color: #333;
			word-break: break-all;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

			.card-description {
				display: block;
				font-size: 24rpx;
				color: #666;
				line-height: 1.4;
				word-break: break-all;
				overflow: hidden;
				text-overflow: ellipsis;
				/* 显示两行 */
				display: -webkit-box;
				-webkit-line-clamp: 2;
				line-clamp: 2;
				-webkit-box-orient: vertical;
			}

			.card-date {
				display: flex;
				align-items: center;
				margin-top: 8rpx;
				gap: 4rpx;

				.date-label {
					font-size: 22rpx;
					color: #999;
				}

				.date-value {
					font-size: 22rpx;
					color: #666;
					font-weight: 500;
				}
			}
		}	.card-check {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0; /* 防止缩小 */

		.check-icon {
			font-size: 20rpx;
			color: #fff;
			font-weight: bold;
		}
	}
}

// 优惠券卡片样式（红色主题）
.coupon-card {
	// 默认红色主题
	border-color: #ffcdd2;
	background-color: #fff5f5;

	.card-title {
		color: #d32f2f !important;
	}

	.card-description {
		color: #757575 !important;
	}

	&:active {
		transform: scale(0.98);
	}

	&.selected {
		border-color: #d32f2f;
		background-color: #ffebee;
		box-shadow: 0 2rpx 8rpx rgba(211, 47, 47, 0.2);

		.card-check {
			background-color: #d32f2f;
		}

		.card-title {
			color: #d32f2f !important;
		}
	}

	&:not(.selected) {
		&:hover {
			border-color: #ef5350;
			background-color: #ffebee;
		}
	}
}

// 特权卡片样式（蓝色主题）
.privilege-card {
	// 默认蓝色主题
	border-color: #bbdefb;
	background-color: #f3f9ff;

	.card-title {
		color: #1976d2 !important;
	}

	.card-description {
		color: #757575 !important;
	}

	&:active {
		transform: scale(0.98);
	}

	&.selected {
		border-color: #1976d2;
		background-color: #e3f2fd;
		box-shadow: 0 2rpx 8rpx rgba(25, 118, 210, 0.2);

		.card-check {
			background-color: #1976d2;
		}

		.card-title {
			color: #1976d2 !important;
		}
	}

	&:not(.selected) {
		&:hover {
			border-color: #42a5f5;
			background-color: #e3f2fd;
		}
	}
}

// 列表容器样式
.coupons-list,
.privileges-list {
	width: 100%;
	box-sizing: border-box;
}

// 列表容器样式
.coupons-list,
.privileges-list {
	width: 100%;
	box-sizing: border-box;
}

// 空列表样式
.empty-list {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 120rpx;
	background-color: #f9f9f9;
	border-radius: 16rpx;
	border: 1rpx solid #eee;
	width: 100%;
	box-sizing: border-box;

		.empty-text {
			font-size: 28rpx;
			color: #999;
		}

		&.warning {
			background-color: #fff8e1;
			border-color: #ffcc02;
			flex-direction: column;
			gap: 10rpx;

			.empty-text {
				color: #ff8f00;
				font-weight: bold;
			}

			.empty-sub-text {
				font-size: 24rpx;
				color: #f57c00;
				text-align: center;
			}
		}
	}.consumer-footer {
	padding: 25rpx 30rpx;
	border-top: 1rpx solid #eee;
	flex-shrink: 0;
	background-color: #fff;
	box-sizing: border-box;

	.confirm-btn {
		width: 100%;
		height: 88rpx;
		background-color: #b8860b;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		transition: all 0.3s ease;

		&:active {
			background-color: #a67a0a;
			transform: translateY(1rpx);
		}

		.confirm-text {
			font-size: 32rpx;
			color: #fff;
			font-weight: bold;
		}
	}
}
</style>
