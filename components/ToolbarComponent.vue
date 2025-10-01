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
        <text class="filter-text">筛选</text>
        <text class="icon-filter"></text>
      </view>
      <view class="filter-btn" @click="toggleDisplayMode">
        <text
          :class="displayMode === 'single' ? 'icon-grid' : 'icon-list'"
        ></text>
      </view>
    </view>
  </view>
</template>

<script>
import { useToolbarStore } from "@/stores";

export default {
  name: "ToolbarComponent",
  emits: ["priceSort", "filter", "displayModeChange"],
  setup() {
    const toolbarStore = useToolbarStore();
    return {
      toolbarStore,
    };
  },
  computed: {
    sortOrder() {
      return this.toolbarStore.sortOrder;
    },
    isFilterActive() {
      return this.toolbarStore.isFilterActive;
    },
    displayMode() {
      return this.toolbarStore.displayMode;
    },
  },
  methods: {
    handlePriceSort() {
      this.toolbarStore.togglePriceSort();
      // 发出事件让父组件处理数据重新加载
      this.$emit("priceSort", this.sortOrder);
    },
    handleFilter() {
      this.toolbarStore.toggleFilter();
      // 发出事件让父组件处理筛选
      this.$emit("filter", this.isFilterActive);
    },
    setDisplayMode(mode) {
      this.toolbarStore.setDisplayMode(mode);
      // 发出事件让父组件处理显示模式变更
      this.$emit("displayModeChange", mode);
    },

    // 切换显示模式
    toggleDisplayMode() {
      const newMode = this.displayMode === "single" ? "grid" : "single";
      this.setDisplayMode(newMode);
    },
  },
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
