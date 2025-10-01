<template>
	<view class="toolbar">
		<view class="toolbar-left">
            <view class="display-toggle" @click="toggleDisplayMode">
				<view class="display-btn">
					<text :class="displayMode === 'single' ? 'icon-grid' : 'icon-list'"></text>
				</view>
			</view>
			<view class="price-sort" @click="handlePriceSort">
				<text class="sort-text">价格</text>
				<text v-if="sortOrder === 'asc'" class="icon-up"></text>
				<text v-else-if="sortOrder === 'desc'" class="icon-down"></text>
			</view>
		</view>
		<view class="toolbar-right">
			<view class="filter-btn" :class="{ active: isFilterActive }" @click="handleFilter">
				<text class="filter-text">筛选</text>
				<text class="filter-icon">⚙</text>
			</view>

		</view>
	</view>
</template>

<script>
import { useToolbarStore } from '@/stores';

export default {
  name: 'ToolbarComponent',
  emits: ['priceSort', 'filter', 'displayModeChange'],
  setup() {
    const toolbarStore = useToolbarStore()
    return {
      toolbarStore
    }
  },
  computed: {
    sortOrder() {
      return this.toolbarStore.sortOrder
    },
    isFilterActive() {
      return this.toolbarStore.isFilterActive
    },
    displayMode() {
      return this.toolbarStore.displayMode
    }
  },
  methods: {
    handlePriceSort() {
      this.toolbarStore.togglePriceSort()
      // 发出事件让父组件处理数据重新加载
      this.$emit('priceSort', this.sortOrder)
    },
    handleFilter() {
      this.toolbarStore.toggleFilter()
      // 发出事件让父组件处理筛选
      this.$emit('filter', this.isFilterActive)
    },
    setDisplayMode(mode) {
      this.toolbarStore.setDisplayMode(mode)
      // 发出事件让父组件处理显示模式变更
      this.$emit('displayModeChange', mode)
    },

    // 切换显示模式
    toggleDisplayMode() {
      const newMode = this.displayMode === 'single' ? 'grid' : 'single'
      this.setDisplayMode(newMode)
    }
  }
}
</script>

<style lang="scss" scoped>
.toolbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #fff;
	border-bottom: 1rpx solid #eee;

	.toolbar-left {
		display: flex;
		align-items: center;
        gap: 20rpx;
		.price-sort {
			display: flex;
			align-items: center;
			padding: 12rpx 20rpx;
			border: 1rpx solid #ddd;
			border-radius: 20rpx;
			background-color: #f9f9f9;
			cursor: pointer;
			transition: all 0.3s ease;

			&:hover {
				background-color: #f0f0f0;
				border-color: #007aff;
			}

			&:active {
				transform: scale(0.95);
			}

			.sort-text {
				font-size: 26rpx;
				color: #333;
				margin-right: 8rpx;
			}

			.icon-up {
				display: inline-block;
				width: 24rpx;
				height: 24rpx;
				background: url('/static/icons/sort-up.png') no-repeat center;
				background-size: 24rpx 24rpx;
			}

			.icon-down {
				display: inline-block;
				width: 24rpx;
				height: 24rpx;
				background: url('/static/icons/sort-down.png') no-repeat center;
				background-size: 24rpx 24rpx;
			}
		}
        .display-toggle {
			display: flex;
			overflow: hidden;
			cursor: pointer;
			transition: all 0.3s ease;

			&:hover {
				background-color: #f0f0f0;
				border-color: #007aff;
			}

			&:active {
				transform: scale(0.95);
			}

			.icon-grid {
				display: inline-block;
				width: 24rpx;
				height: 24rpx;
				background: url('/static/icons/grid.png') no-repeat center;
				background-size: 24rpx 24rpx;
			}

			.icon-list {
				display: inline-block;
				width: 24rpx;
				height: 24rpx;
				background: url('/static/icons/list.png') no-repeat center;
				background-size: 24rpx 24rpx;
			}

			.display-btn {
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}

	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 20rpx;

		.filter-btn {
			display: flex;
			align-items: center;
			padding: 12rpx 20rpx;
			border: 1rpx solid #ddd;
			border-radius: 20rpx;
			background-color: #f9f9f9;
			cursor: pointer;
			transition: all 0.3s ease;

			&:hover {
				background-color: #f0f0f0;
				border-color: #007aff;
			}

			&:active {
				transform: scale(0.95);
			}

			&.active {
				background-color: #007aff;
				border-color: #007aff;

				.filter-text,
				.filter-icon {
					color: #fff;
				}
			}

			.filter-text {
				font-size: 26rpx;
				color: #333;
				margin-right: 8rpx;
			}

			.filter-icon {
				font-size: 24rpx;
				color: #666;
			}
		}


	}
}
</style>
