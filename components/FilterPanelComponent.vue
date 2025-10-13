<template>
	<uni-popup ref="filterPopup" type="bottom" background-color="#fff" :mask-click="true" @maskClick="closePanel">
		<view class="filter-panel">
			<!-- 头部 -->
			<view class="filter-header">
				<text class="header-title">筛选</text>
				<view class="header-actions">
					<text class="reset-btn" @click="resetFilters">重置</text>
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
							<text class="option-count">({{ option.count }})</text>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 底部按钮 -->
			<view class="filter-footer">
				<view class="confirm-btn" @click="confirmFilters">
					<text class="confirm-text">确定</text>
				</view>
			</view>
		</view>
	</uni-popup>
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

// 组件引用
const filterPopup = ref(null);

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
	if (filterPopup.value) {
		filterPopup.value.open();
	}
};

const closePanel = () => {
	if (filterPopup.value) {
		filterPopup.value.close();
	}
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
	border-radius: 20rpx 20rpx 0 0;
	max-height: 75vh;
	display: flex;
	flex-direction: column;
}

.filter-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;

	.header-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 30rpx;

		.reset-btn {
			font-size: 28rpx;
			color: #666;
		}

		.close-btn {
			font-size: 40rpx;
			color: #666;
			line-height: 1;
		}
	}
}

.filter-content {
	flex: 1;
	padding: 0 30rpx;
	overflow-y: auto;
	/* 确保内容区域不会挤压底部按钮 */
	min-height: 0;
}

.filter-section {
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

.price-range {
	display: flex;
	align-items: center;
	gap: 20rpx;

	.price-input {
		flex: 1;
		height: 80rpx;
		padding: 0 20rpx;
		border: 1rpx solid #ddd;
		border-radius: 8rpx;
		font-size: 28rpx;
		background-color: #f9f9f9;
	}

	.price-separator {
		font-size: 28rpx;
		color: #666;
	}
}

.filter-options {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.filter-option {
	display: flex;
	align-items: center;
	padding: 16rpx 24rpx;
	border: 1rpx solid #ddd;
	border-radius: 30rpx;
	background-color: #f9f9f9;
	transition: all 0.3s ease;

	&.active {
		background-color: #b8860b;
		border-color: #b8860b;

		.option-text,
		.option-count {
			color: #fff;
		}
	}

	.option-text {
		font-size: 26rpx;
		color: #333;
		margin-right: 8rpx;
	}

	.option-count {
		font-size: 22rpx;
		color: #999;
	}
}

.filter-footer {
	padding: 30rpx;
	/* 调整底部间距，避免被TabBar遮挡但不要太高 */
	padding-bottom: calc(30rpx + env(safe-area-inset-bottom) + 80rpx);
	border-top: 1rpx solid #eee;
	/* 确保底部按钮固定显示，不被内容挤压 */
	flex-shrink: 0;
	background-color: #fff;

	.confirm-btn {
		width: 100%;
		height: 88rpx;
		background-color: #b8860b;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.confirm-text {
			font-size: 32rpx;
			color: #fff;
			font-weight: bold;
		}
	}
}
</style>
