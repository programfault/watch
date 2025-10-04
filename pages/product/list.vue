<template>
<view class="container">
    <SearchComponent @search="onSearch" from="product" />

    <!-- 工具栏 -->
    <ToolbarComponent @priceSort="onPriceSort" @filter="onFilter" @displayModeChange="onDisplayModeChange" />

    <!-- 筛选面板 -->
    <FilterPanelComponent
        ref="filterPanel"
        @filterChange="onFilterChange"
        @close="onFilterClose"
    />

    <view v-if="currentBrand" class="brand-info">
        <text class="brand-name">{{ currentBrand.name_cn }}</text>
        <text class="total-count">共 {{ pagination.total || 0 }} 款手表</text>
    </view>

    <scroll-view scroll-y class="watches-scroll" @scrolltolower="loadMore" lower-threshold="100">
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

        <view class="load-status">
            <view v-if="loading" class="loading">
                <text>加载中...</text>
            </view>
            <view v-else-if="!hasWatches && !loading" class="empty">
                <text>暂无手表数据</text>
            </view>
            <view v-else-if="!pagination.has_next" class="no-more">
                <text>已显示全部 {{ watches.length }} 款手表</text>
            </view>
        </view>
    </scroll-view>
</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import FilterPanelComponent from "@/components/FilterPanelComponent.vue"
import SearchComponent from "@/components/SearchComponent.vue"
import ToolbarComponent from "@/components/ToolbarComponent.vue"
import { useAppStore } from "@/stores"
import { useProductStore } from "@/stores/product.js"
import { useToolbarStore } from "@/stores/toolbar.js"

// 定义组件名称
defineOptions({
    name: 'ProductList'
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
} = storeToRefs(productStore)

// 组件引用
const filterPanel = ref(null)

// 响应式数据
const displayMode = ref('single') // 'single' 单列 | 'grid' 网格

// 计算属性
const hasWatches = computed(() => {
    return watches.value && watches.value.length > 0
})

// 方法定义
const loadAllWatches = async () => {
    await productStore.fetchWatches({
        page: 1,
        per_page: 20
    })
}

const loadBrandWatches = async (brandId) => {
    await productStore.fetchWatches({
        page: 1,
        per_page: 20,
        brand_id: brandId,
    })
}

const loadMore = async () => {
    if (loading.value || !pagination.value.has_next) {
        return
    }

    const nextPage = pagination.value.current_page + 1
    const sortParams = toolbarStore.getSortParams
    const params = {
        page: nextPage,
        per_page: 20,
        ...sortParams,
    }

    // 如果有品牌筛选，添加品牌ID
    if (currentBrand.value?.id) {
        params.brand_id = currentBrand.value.id
    }

    await productStore.fetchWatches(params, true)
}

const onSearch = (searchData) => {
    productStore.searchWatches(searchData)
}

const getWatchImage = (watch) => {
    if (watch.images && watch.images.length > 0) {
        return watch.images[0].image_url || watch.images[0].url
    }
    return "/static/logo.png"
}

const goToDetail = (watchId) => {
    uni.navigateTo({
        url: `/pages/product/detail?id=${watchId}`,
    })
}

// 工具栏事件处理
const onPriceSort = (sortOrder) => {
    // TODO: 重新获取数据，带上排序参数
    console.log('价格排序:', sortOrder)
    // 重新加载数据
    reloadWithFilters()
}

const onFilter = (isActive) => {
    console.log('筛选状态:', isActive)
    if (isActive) {
        // 打开筛选面板
        filterPanel.value.openPanel()
    }
}

const onFilterChange = (filterParams) => {
    console.log('筛选参数:', filterParams)
    // 使用筛选参数重新加载数据
    reloadWithFilters(filterParams)
}

const onFilterClose = () => {
    // 筛选面板关闭时，通知toolbar更新状态
    if (toolbarStore.isFilterActive) {
        toolbarStore.toggleFilter()
    }
}

const onDisplayModeChange = (mode) => {
    console.log('显示模式:', mode)
    displayMode.value = mode
}

// 重新加载数据带筛选条件
const reloadWithFilters = async (filterParams = {}) => {
    const sortParams = toolbarStore.getSortParams
    const params = {
        page: 1,
        per_page: 20,
        ...sortParams,
        ...filterParams
    }

    // 如果有品牌筛选，添加品牌ID
    if (currentBrand.value) {
        params.brand_id = currentBrand.value.id
    }

    await productStore.fetchWatches(params)
}

// 页面生命周期 - onLoad
onLoad((options) => {
    // 初始化筛选选项
    // appStore.fetchFilterOptions()
    console.log('路由参数:', options)
    if (options.id) {
        loadBrandWatches(options.id)
    } else {
        loadAllWatches()
    }
})
</script>

<style lang="scss" scoped>
.container {
    min-height: 100vh;
    background-color: #fff;
}

.brand-info {
    padding: 20rpx 30rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #eee;

    .brand-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-right: 20rpx;
    }

    .total-count {
        font-size: 28rpx;
        color: #666;
    }
}

.watches-scroll {
    height: calc(100vh - 260rpx);
}

.watches-list {
    padding: 20rpx;

    // 单列模式样式
    &.single-mode {
        .watch-item-single {
            display: flex;
            background-color: #fff;
            border-radius: 12rpx;
            margin-bottom: 20rpx;
            padding: 20rpx;
            box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

            .watch-image {
                width: 160rpx;
                height: 160rpx;
                border-radius: 8rpx;
                margin-right: 20rpx;
                background-color: #f9f9f9;
                flex-shrink: 0;
            }

            .watch-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;

                .watch-name {
                    font-size: 30rpx;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 10rpx;
                }

                .watch-price {
                    font-size: 28rpx;
                    color: #e74c3c;
                    font-weight: bold;
                    margin-bottom: 10rpx;
                }

                .watch-meta {
                    .brand-text {
                        font-size: 24rpx;
                        color: #666;
                        background-color: #f0f0f0;
                        padding: 4rpx 12rpx;
                        border-radius: 20rpx;
                    }
                }
            }
        }
    }

    // 网格模式样式
    &.grid-mode {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20rpx;

        .watch-item-grid {
            display: flex;
            flex-direction: column;
            background-color: #fff;
            border-radius: 12rpx;
            padding: 20rpx;
            box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

            .watch-image-grid {
                width: 100%;
                height: 200rpx;
                border-radius: 8rpx;
                margin-bottom: 12rpx;
                background-color: #f9f9f9;
            }

            .watch-info-grid {
                flex: 1;
                display: flex;
                flex-direction: column;

                .watch-name-grid {
                    font-size: 26rpx;
                    font-weight: bold;
                    color: #333;
                    line-height: 1.3;
                    height: 68rpx;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    margin-bottom: 8rpx;
                }

                .watch-price-grid {
                    font-size: 24rpx;
                    color: #e74c3c;
                    font-weight: bold;
                    margin-bottom: 8rpx;
                }

                .watch-meta-grid {
                    margin-top: auto;

                    .brand-text-grid {
                        font-size: 20rpx;
                        color: #666;
                        background-color: #f0f0f0;
                        padding: 2rpx 8rpx;
                        border-radius: 20rpx;
                    }
                }
            }
        }
    }
}

.load-status {
    padding: 40rpx;
    text-align: center;

    .loading,
    .empty,
    .no-more {
        font-size: 28rpx;
        color: #999;
    }
}
</style>
