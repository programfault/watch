<template>
  <view class="toolbar">
    <view class="toolbar-left">
      <view class="price-sort" @click="handlePriceSort">
        <text class="sort-text">价格</text>
        <text v-if="sortOrder === 'asc'" class="icon-up"></text>
        <text v-else-if="sortOrder === 'desc'" class="icon-down"></text>
        <text v-else class="icon-sort"></text>
      </view>
    </view>
    <view class="toolbar-right">
      <view
        class="filter-btn"
        @click="handleFilter"
      >
        <view class="filter-content">
          <view v-if="filterCount > 0" class="filter-badge">{{ filterCount }}</view>
          <text class="filter-text">筛选</text>
          <text class="icon-filter"></text>
        </view>
      </view>
      <view class="filter-btn" @click="toggleDisplayMode">
        <text
          :class="displayMode === 'single' ? 'icon-list' : 'icon-grid'"
        ></text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useToolbarStore } from "@/stores";
import { computed, nextTick } from "vue";

// 定义组件名称和emits
defineOptions({
  name: "ToolbarComponent"
});

// 定义emits
const emit = defineEmits(["priceSort", "filter", "displayModeChange"]);

// Store实例
const toolbarStore = useToolbarStore();

// 计算属性
const sortOrder = computed(() => {
  return toolbarStore.sortOrder;
});

const isFilterActive = computed(() => {
  return toolbarStore.isFilterActive;
});

const displayMode = computed(() => {
  return toolbarStore.displayMode;
});

const filterCount = computed(() => {
  return toolbarStore.filterCount;
});

// 方法
const handlePriceSort = () => {
  toolbarStore.togglePriceSort();
  // 使用nextTick确保store更新完成后再发出事件
  nextTick(() => {
    console.log('ToolbarComponent 发出排序事件:', sortOrder.value);
    emit("priceSort", sortOrder.value);
  });
};

const handleFilter = () => {
  toolbarStore.toggleFilter();
  // 发出事件让父组件处理筛选
  emit("filter", isFilterActive.value);
};

const setDisplayMode = (mode) => {
  toolbarStore.setDisplayMode(mode);
  // 发出事件让父组件处理显示模式变更
  emit("displayModeChange", mode);
};

// 切换显示模式
const toggleDisplayMode = () => {
  const newMode = displayMode.value === "single" ? "grid" : "single";
  setDisplayMode(newMode);
};
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  padding: 0 20rpx;
  margin: 0 10px; /* 和产品列表保持一致的边距 */
  width: calc(100% - 20px); /* 减去左右边距 */
  box-sizing: border-box;
  .toolbar-left {
    display: flex;
    align-items: center;
    .icon-sort {
        display: inline-block;
        width: 20rpx;
        height: 20rpx;
        background: url("/static/icons/sort.png") no-repeat center;
        background-size: 20rpx 20rpx;
      }
    .price-sort {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12rpx;
      height: 48rpx;
      width: 80rpx;
      cursor: pointer;
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.95);
      }

      .sort-text {
        font-size: 26rpx;
        color: #333;
        margin-right: 6rpx;
      }

      .icon-up {
        display: inline-block;
        width: 20rpx;
        height: 20rpx;
        background: url("/static/icons/sort-up.png") no-repeat center;
        background-size: 20rpx 20rpx;
      }

      .icon-down {
        display: inline-block;
        width: 20rpx;
        height: 20rpx;
        background: url("/static/icons/sort-down.png") no-repeat center;
        background-size: 20rpx 20rpx;
      }
    }
    .display-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12rpx;
      height: 48rpx;
      width: 48rpx;
      cursor: pointer;
      transition: all 0.3s ease;
      .display-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
    }
  }

  .toolbar-right {
    justify-content: space-between;
    display: flex;
    align-items: center;
    gap: 20rpx;

    .filter-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12rpx;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      .filter-content {
        display: flex;
        align-items: center;
      }

      .filter-badge {
        background-color: #ff0000;
        color: #fff;
        font-size: 20rpx;
        padding: 4rpx 8rpx;
        border-radius: 20rpx;
        margin-right: 8rpx;
        min-width: 32rpx;
        height: 32rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      .filter-text {
        font-size: 26rpx;
        color: #333;
        margin-right: 8rpx;
      }
    }
    .icon-list {
        display: inline-block;
        width: 28rpx;
        height: 28rpx;
        background: url("/static/icons/list.png") no-repeat center;
        background-size: 28rpx 28rpx;
      }
      .icon-grid {
        display: inline-block;
        width: 28rpx;
        height: 28rpx;
        background: url("/static/icons/grid.png") no-repeat center;
        background-size: 28rpx 28rpx;
      }
      .icon-filter {
        display: inline-block;
        width: 28rpx;
        height: 28rpx;
        background: url("/static/icons/filter.png") no-repeat center;
        background-size: 28rpx 28rpx;
      }
  }
}
</style>
