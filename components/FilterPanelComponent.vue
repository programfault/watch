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
		<view class="filter-panel">
			<!-- 头部 -->
			<view class="filter-header">
				<text class="header-title">筛选</text>
				<view class="header-actions">
					<text class="close-btn" @click="closePanel">×</text>
				</view>
			</view>

			<!-- 筛选内容 -->
			<scroll-view scroll-y class="filter-content">
				<!-- 价格区间 -->
				<view class="filter-section">
					<text class="section-title">价格</text>
					<view class="price-range">
						<input
							class="price-input"
							type="number"
							placeholder="自定最低价"
							v-model="selectedFilters.minPrice"
						/>
						<text class="price-separator">-</text>
						<input
							class="price-input"
							type="number"
							placeholder="自定最高价"
							v-model="selectedFilters.maxPrice"
						/>
					</view>
				</view>

				<!-- 动态筛选项 -->
				<view
					v-for="attribute in filterOptions"
					:key="attribute.attribute_id"
					class="filter-section"
				>
					<text class="section-title">{{ attribute.attribute_name }}</text>
					<view class="filter-options">
						<view
							v-for="option in attribute.values"
							:key="option.value"
							class="filter-option"
							:class="{ active: isOptionSelected(attribute.attribute_id, option.value) }"
							@click="toggleOption(attribute.attribute_id, option.value)"
						>
							<text class="option-text">{{ option.value }}</text>
							<!-- <text class="option-count">({{ option.count }})</text> -->
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 底部按钮 -->
			<view class="filter-footer">
				<view class="footer-buttons">
					<view class="reset-btn" @click="resetFilters">
						<text class="reset-text">重置</text>
					</view>
					<view class="confirm-btn" @click="confirmFilters">
						<text class="confirm-text">确定</text>
					</view>
				</view>
			</view>
		</view>
	</u-popup>
</template>

<script setup>
import { useAppStore } from "@/stores";
import { computed, onMounted, ref, watch } from 'vue';

// 定义组件名称和emits
defineOptions({
	name: 'FilterPanelComponent'
});

// 定义emits
const emit = defineEmits(['filterCountChange', 'close', 'filterChange']);

// Store实例
const appStore = useAppStore();

// 响应式数据
const selectedFilters = ref({
	minPrice: '',
	maxPrice: '',
	attributes: {} // { attribute_id: [selected_values] }
});

// 控制弹窗显示状态
const showPopup = ref(false);

// 计算属性
const filterOptions = computed(() => {
	console.log('FilterPanel filterOptions:', appStore.filterOptions);
	return appStore.filterOptions || [];
});

const isFilterActive = computed(() => {
	// 从工具栏store获取筛选状态
	// 注意：这里需要根据实际的store结构来调整
	// 如果有工具栏store，应该直接导入使用
	return false; // 临时返回false，需要根据实际store结构调整
});

// 计算活跃的筛选条件数量
const activeFilterCount = computed(() => {
	let count = 0;

	// 价格筛选
	if (selectedFilters.value.minPrice || selectedFilters.value.maxPrice) {
		count++;
	}

	// 属性筛选
	Object.keys(selectedFilters.value.attributes).forEach(attributeId => {
		const values = selectedFilters.value.attributes[attributeId];
		if (values && values.length > 0) {
			count++;
		}
	});

	return count;
});

// 监听器
watch(isFilterActive, (newVal) => {
	if (newVal) {
		openPanel();
	}
}, { immediate: true });

// 监听筛选条件变化，实时更新筛选条件数量
watch(activeFilterCount, (newCount) => {
	// 通知父组件筛选条件数量发生变化
	emit('filterCountChange', newCount);
}, { immediate: true });

// 生命周期
onMounted(() => {
	// 组件挂载时，发送当前的筛选条件数量
	emit('filterCountChange', activeFilterCount.value);
});

// 方法
const openPanel = () => {
	showPopup.value = true;
};

const closePanel = () => {
	showPopup.value = false;
	// 通知父组件关闭筛选状态
	emit('close');
};

const isOptionSelected = (attributeId, value) => {
	const selectedValues = selectedFilters.value.attributes[attributeId];
	return selectedValues?.includes(value) || false;
};

const toggleOption = (attributeId, value) => {
	if (!selectedFilters.value.attributes[attributeId]) {
		selectedFilters.value.attributes[attributeId] = [];
	}

	const selectedValues = selectedFilters.value.attributes[attributeId];
	const index = selectedValues.indexOf(value);

	if (index > -1) {
		selectedValues.splice(index, 1);
	} else {
		selectedValues.push(value);
	}
};

const resetFilters = () => {
	// 清空所有筛选条件
	selectedFilters.value = {
		minPrice: '',
		maxPrice: '',
		attributes: {}
	};

	// 构建空的筛选参数并触发更新，传递筛选条件数量为0
	const emptyFilterParams = {};
	emit('filterChange', emptyFilterParams, 0);

	// 关闭筛选面板
	closePanel();

	// 显示重置成功提示
	uni?.showToast({
		title: '筛选条件已重置',
		icon: 'success'
	});
};

const confirmFilters = () => {
	const filterParams = buildFilterParams();

	console.log('=== 筛选条件构建完成 ===');
	console.log('构建的筛选参数:', filterParams);
	if (filterParams.attribute_filters) {
		console.log('属性筛选详情:', JSON.stringify(filterParams.attribute_filters, null, 2));
	}

	// 传递筛选参数和筛选条件数量
	emit('filterChange', filterParams, activeFilterCount.value);

	closePanel();

	uni?.showToast({
		title: '筛选条件已应用',
		icon: 'success'
	});
};

const buildFilterParams = () => {
	const params = {};

	// 价格筛选
	if (selectedFilters.value.minPrice) {
		params.min_price = selectedFilters.value.minPrice;
	}
	if (selectedFilters.value.maxPrice) {
		params.max_price = selectedFilters.value.maxPrice;
	}

	// 属性筛选 - 构建为 attribute_filters 数组格式
	const attributeFilters = [];
	Object.keys(selectedFilters.value.attributes).forEach(attributeId => {
		const values = selectedFilters.value.attributes[attributeId];
		if (values && values.length > 0) {
			attributeFilters.push({
				attribute_id: parseInt(attributeId),
				values: values
			});
		}
	});

	if (attributeFilters.length > 0) {
		params.attribute_filters = attributeFilters;
	}

	return params;
};

// 暴露给父组件的方法
defineExpose({
	show: openPanel,
	open: openPanel,
	close: closePanel
});
</script>

<style lang="scss" scoped>
.filter-panel {
	background-color: #fff;
	max-height: 75vh;
	display: flex;
	flex-direction: column;
	width: 100%;
	box-sizing: border-box;
}

.filter-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 25rpx 30rpx;
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
			font-size: 36rpx;
			color: #666;
			line-height: 1;
			padding: 8rpx 12rpx;
		}
	}
}

.filter-content {
	flex: 1;
	padding: 0 25rpx;
	overflow-y: auto;
	overflow-x: hidden; /* 防止水平滚动 */
	/* 确保内容区域不会挤压底部按钮 */
	min-height: 0;
	max-width: 100%;
	box-sizing: border-box;
}

.filter-section {
	margin-bottom: 35rpx;
	width: 100%;
	box-sizing: border-box;

	.section-title {
		display: block;
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 18rpx;
		padding-top: 25rpx;
		width: 100%;
	}
}

.price-range {
	display: flex;
	align-items: center;
	gap: 15rpx;
	width: 100%;

	.price-input {
		flex: 1;
		height: 80rpx;
		padding: 0 15rpx;
		border: 1rpx solid #ddd;
		border-radius: 8rpx;
		font-size: 26rpx;
		background-color: #f9f9f9;
		box-sizing: border-box;
		min-width: 0; /* 防止flex子项溢出 */
	}

	.price-separator {
		font-size: 26rpx;
		color: #666;
		flex-shrink: 0; /* 防止分隔符被压缩 */
	}
}

.filter-options {
	display: flex;
	flex-wrap: wrap;
	gap: 15rpx;
	width: 100%;
}

.filter-option {
	display: flex;
	align-items: center;
	padding: 14rpx 20rpx;
	border: 1rpx solid #ddd;
	border-radius: 30rpx;
	background-color: #f9f9f9;
	transition: all 0.3s ease;
	box-sizing: border-box;
	max-width: 100%;
	flex-shrink: 0; /* 防止选项被过度压缩 */

	&.active {
		background-color: #b8860b;
		border-color: #b8860b;

		.option-text,
		.option-count {
			color: #fff;
		}
	}

	.option-text {
		font-size: 24rpx;
		color: #333;
		margin-right: 8rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 200rpx; /* 限制最大宽度，防止文字过长 */
	}

	.option-count {
		font-size: 20rpx;
		color: #999;
		flex-shrink: 0;
	}
}

.filter-footer {
	padding: 25rpx 30rpx;
	border-top: 1rpx solid #eee;
	/* 确保底部按钮固定显示，不被内容挤压 */
	flex-shrink: 0;
	background-color: #fff;
	box-sizing: border-box;

	.footer-buttons {
		display: flex;
		gap: 20rpx;
		width: 100%;
	}

	.reset-btn {
		flex: 1;
		height: 88rpx;
		background-color: #f5f5f5;
		border: 1rpx solid #ddd;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		transition: all 0.3s ease;

		&:active {
			background-color: #e8e8e8;
			transform: translateY(1rpx);
		}

		.reset-text {
			font-size: 30rpx;
			color: #666;
			font-weight: 500;
		}
	}

	.confirm-btn {
		flex: 2;
		height: 88rpx;
		background-color: #b8860b;
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
