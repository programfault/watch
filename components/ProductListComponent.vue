<template>
<view class="product-list-container" v-if="shouldShowComponent">
    <!-- 工具栏（包含品牌信息） -->
    <ToolbarComponent
        :currentBrand="currentBrand"
        :total="pagination.total"
        @priceSort="onPriceSort"
        @filter="onFilter"
        @displayModeChange="onDisplayModeChange"
    />

    <!-- 筛选面板 -->
    <FilterPanelComponent
        ref="filterPanel"
        @filterChange="onFilterChange"
        @filterCountChange="onFilterCountChange"
        @close="onFilterClose"
    />

    <!-- 手表列表容器 - 使用scroll-view实现loadmore -->
    <scroll-view
        class="watches-scroll"
        :style="watchesScrollStyle"
        scroll-y="true"
        :lower-threshold="200"
        @scrolltolower="onScrollToLower"
        :enable-back-to-top="true"
        :scroll-with-animation="false"
        :show-scrollbar="false"
    >
        <!-- 单列模式 -->
        <view v-if="hasWatches && displayMode === 'single'" class="watches-list single-mode">
            <view v-for="watch in watches" :key="watch.id" class="watch-item-single" @click="goToDetail(watch.id)">
                <image :src="getWatchImage(watch)" class="watch-image" mode="aspectFit" lazy-load></image>
                <view class="watch-info">
                    <text class="watch-name">{{ watch.name_cn || watch.name }}</text>
                    <text class="watch-price">¥{{ watch.price }}</text>
                    <view class="watch-meta">
                        <text class="brand-text">{{ watch.brand?.name_cn }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 网格模式 -->
        <view v-else-if="hasWatches && displayMode === 'grid'" class="watches-list grid-mode">
            <view v-for="watch in watches" :key="watch.id" class="watch-item-grid" @click="goToDetail(watch.id)">
                <image :src="getWatchImage(watch)" class="watch-image-grid" mode="aspectFit" lazy-load></image>
                <view class="watch-info-grid">
                    <text class="watch-name-grid">{{ watch.name_cn || watch.name }}</text>
                    <text class="watch-price-grid">¥{{ watch.price }}</text>
                    <view class="watch-meta-grid">
                        <text class="brand-text-grid">{{ watch.brand?.name_cn }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 加载状态 -->
        <view class="load-status">
            <view v-if="loading" class="loading">
                <text>加载中...</text>
            </view>
            <view v-else-if="!hasWatches && !loading" class="empty">
                <text>暂无手表数据</text>
            </view>
            <view v-else-if="hasWatches && !pagination.has_next" class="no-more">
                <text>已显示全部 {{ watches.length }} 款手表</text>
            </view>
            <!-- 添加自动加载更多提示 -->
            <view v-else-if="hasWatches && pagination.has_next" class="can-load-more">
                <u-loading-icon mode="spinner" size="24" color="#b8860b"></u-loading-icon>
                <text class="loading-text">加载中...</text>
            </view>
        </view>
    </scroll-view>
</view>
</template>

<script setup>
import FilterPanelComponent from "@/components/FilterPanelComponent.vue"
import ToolbarComponent from "@/components/ToolbarComponent.vue"
import { useAppStore, useLayoutStore } from "@/stores"
import { useProductStore } from "@/stores/product.js"
import { useToolbarStore } from "@/stores/toolbar.js"
import { storeToRefs } from 'pinia'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { calculatePageLayout } from '@/utils/layoutUtils.js'
// 定义组件名称
defineOptions({
    name: 'ProductListComponent'
})

// 定义 props
const props = defineProps({
    keyword: {
        type: String,
        default: ''
    }
})

// 获取stores
const productStore = useProductStore()
const toolbarStore = useToolbarStore()
const appStore = useAppStore()

// 从store获取响应式数据
const {
    watchesList: watches,
    watchesLoading: loading,
    watchesPagination: pagination,
    currentBrand,
    watchesFilters,
} = storeToRefs(productStore)

// 组件引用
const filterPanel = ref(null)

// 计算属性
const hasWatches = computed(() => watches.value && watches.value.length > 0)


// 判断是否应该显示组件（只有在有搜索结果或正在加载时才显示）
const shouldShowComponent = computed(() => {
    return hasWatches.value || loading.value || currentBrand.value || props.keyword
})

// 动态计算产品列表的样式
const watchesScrollStyle = computed(() => {
    // 简化样式计算，专注于让scroll-view可以滚动
    const info = calculatePageLayout()
    const navHeight = info.navbarTotalHeight || 0
    const searchHeight = info.searchHeight || 0
    return {
        marginTop: `${navHeight + searchHeight}px`,
        height: "70vh"
    }
})// 显示模式
const { displayMode } = storeToRefs(toolbarStore)

// 监听页面滚动实现loadMore功能
let isLoadingMore = false

// scroll-view滚动到底部的处理
const onScrollToLower = () => {
    console.log('📜 scroll-view 滚动到底部，触发加载更多')

    if (isLoadingMore || !pagination.value.has_next || loading.value) {
        console.log('⏸️ 无法加载更多:', {
            isLoadingMore,
            hasNext: pagination.value.has_next,
            loading: loading.value
        })
        return
    }

    loadMore()
}

// 暴露给父组件的滚动检查方法
const checkLoadMore = () => {
    if (isLoadingMore || !pagination.value.has_next || loading.value) {
        return false
    }

    console.log('🔄 组件收到滚动检查，准备加载更多')
    loadMore()
    return true
}

// 组件挂载和卸载的简化处理
onMounted(() => {
    console.log('📱 ProductListComponent 挂载完成')
})

onUnmounted(() => {
    console.log('📱 ProductListComponent 卸载')
    isLoadingMore = false
})// 方法定义
const onPriceSort = (direction) => {
    productStore.sortByPrice(direction)
}

const onFilter = () => {
    if (filterPanel.value) {
        filterPanel.value.show()
    }
}

const onDisplayModeChange = (mode) => {
    toolbarStore.setDisplayMode(mode)
}

const onFilterChange = (filters, filterCount) => {
    console.log('ProductListComponent 收到筛选变化:', { filters, filterCount })

    // 如果筛选条件为空（重置操作），调用重置方法
    if (!filters || Object.keys(filters).length === 0 || filterCount === 0) {
        console.log('执行重置筛选操作')
        productStore.resetFilters()
    } else {
        console.log('执行应用筛选操作')
        productStore.applyFilters(filters)
    }
}

const onFilterCountChange = (count) => {
    toolbarStore.setFilterCount(count)
}

const onFilterClose = () => {
    // 筛选面板关闭时的处理
}

const loadMore = async () => {
    if (isLoadingMore || !pagination.value.has_next || loading.value) {
        console.log('⏸️ 无法加载更多:', {
            isLoadingMore,
            hasNext: pagination.value.has_next,
            loading: loading.value
        })
        return
    }

    console.log('🔄 开始加载更多数据')
    isLoadingMore = true

    try {
        await productStore.loadMoreWatches()
        console.log('✅ 加载更多完成')
    } catch (error) {
        console.error('❌ 加载更多失败:', error)
        uni.showToast({
            title: '加载失败，请重试',
            icon: 'none'
        })
    } finally {
        isLoadingMore = false
    }
}

const goToDetail = (watchId) => {
    uni.navigateTo({
        url: `/pages/product/detail?id=${watchId}`
    })
}

const getWatchImage = (watch) => {
    if (watch.images && watch.images.length > 0) {
        return watch.images[0].image_url
    }
    return '/static/default-watch.jpg'
}

// 暴露给父组件的方法
const searchWithKeyword = async (keyword) => {
    console.log('🔍 ProductListComponent.searchWithKeyword:', keyword)
    return await productStore.searchByKeyword(keyword)
}

const searchByBrand = async (brandId, brand) => {
    console.log('🏷️ ProductListComponent.searchByBrand:', { brandId, brand })
    return await productStore.fetchByBrand(brandId, false) // false = 不是加载更多
}

defineExpose({
    searchWithKeyword,
    searchByBrand,
    checkLoadMore
})
</script>

<style lang="scss" scoped>
.product-list-container {
    position: relative;
    width: 100%;
    background-color: transparent;
}

.watches-scroll {
    width: 100%;
    background-color: transparent;
    /* 使用相对定位，让scroll-view正常工作 */
}

.watches-list {
    width: 100%;
    box-sizing: border-box;

    &.single-mode {
        display: flex;
        flex-direction: column;
        gap: 16rpx;
        padding: 20rpx 0; /* 统一的内边距 */
    }

    &.grid-mode {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16rpx;
        padding: 20rpx 0; /* 网格模式稍微小一点的左右边距 */
    }
}

/* 单列模式样式 */
.watch-item-single {
    display: flex;
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 24rpx;
    transition: all 0.3s ease;

    &:active {
        background-color: #f8f9fa;
        transform: translateY(2rpx);
    }

    .watch-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 8rpx;
        margin-right: 24rpx;
        flex-shrink: 0;
    }

    .watch-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .watch-name {
            font-size: 30rpx;
            font-weight: 600;
            color: #333333;
            margin-bottom: 12rpx;
            line-height: 1.4;
        }

        .watch-price {
            font-size: 32rpx;
            font-weight: 700;
            color: #b8860b;
            margin-bottom: 16rpx;
        }

        .watch-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .brand-text {
                font-size: 24rpx;
                color: #888888;
                background-color: #f5f5f5;
                padding: 6rpx 12rpx;
                border-radius: 12rpx;
            }
        }
    }
}

/* 网格模式样式 */
.watch-item-grid {
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:active {
        background-color: #f8f9fa;
        transform: translateY(2rpx);
    }

    .watch-image-grid {
        width: 100%;
        height: 200rpx;
        border-radius: 8rpx;
        margin-bottom: 16rpx;
    }

    .watch-info-grid {
        display: flex;
        flex-direction: column;

        .watch-name-grid {
            font-size: 26rpx;
            font-weight: 600;
            color: #333333;
            margin-bottom: 8rpx;
            line-height: 1.3;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .watch-price-grid {
            font-size: 28rpx;
            font-weight: 700;
            color: #b8860b;
            margin-bottom: 12rpx;
        }

        .watch-meta-grid {
            .brand-text-grid {
                font-size: 22rpx;
                color: #888888;
                background-color: #f5f5f5;
                padding: 4rpx 8rpx;
                border-radius: 8rpx;
                display: inline-block;
            }
        }
    }
}

/* 加载状态样式 */
.load-status {
    padding: 40rpx 20rpx;
    text-align: center;

    .loading, .empty, .no-more, .can-load-more {
        color: #999999;
        font-size: 28rpx;
    }

    .can-load-more {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12rpx;
        color: #b8860b;
        font-weight: 500;

        .loading-text {
            font-size: 26rpx;
            color: #b8860b;
        }
    }
}
</style>
