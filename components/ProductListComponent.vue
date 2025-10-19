<template>
<view class="product-list-container">
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
import FilterPanelComponent from "@/components/FilterPanelComponent.vue"
import ToolbarComponent from "@/components/ToolbarComponent.vue"
import { useAppStore } from "@/stores"
import { useProductStore } from "@/stores/product.js"
import { useToolbarStore } from "@/stores/toolbar.js"
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

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

// 显示模式
const { displayMode } = storeToRefs(toolbarStore)

// 方法定义
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

const onFilterChange = (filters) => {
    productStore.applyFilters(filters)
}

const onFilterCountChange = (count) => {
    toolbarStore.setFilterCount(count)
}

const onFilterClose = () => {
    // 筛选面板关闭时的处理
}

const loadMore = () => {
    if (pagination.value.has_next && !loading.value) {
        productStore.loadMoreWatches()
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

// 当关键词改变时，重新搜索
const searchWithKeyword = async (keyword) => {
    console.log('ProductListComponent 开始搜索:', keyword)
    if (keyword && keyword.trim()) {
        try {
            // 传递正确的参数格式：包含 keyword 的对象
            await productStore.searchWatches({ keyword: keyword.trim() })
            console.log('搜索完成，结果数量:', watches.value?.length)
        } catch (error) {
            console.error('搜索失败:', error)
            uni.showToast({
                title: '搜索失败，请重试',
                icon: 'none'
            })
        }
    }
}

// 品牌筛选方法
const searchByBrand = async (brandId, brandInfo = null) => {
    console.log('ProductListComponent 开始品牌筛选:', { brandId, brandInfo })

    if (!brandId) {
        console.error('品牌ID为空')
        return
    }

    try {
        // 使用 productStore 的 fetchByBrand 方法
        await productStore.fetchByBrand(brandId)
        console.log('品牌筛选完成，结果数量:', watches.value?.length)
        console.log('当前品牌信息:', currentBrand.value)
    } catch (error) {
        console.error('品牌筛选失败:', error)
        uni.showToast({
            title: '品牌数据加载失败，请重试',
            icon: 'none'
        })
    }
}

// 初始化方法
const init = () => {
    console.log('ProductListComponent 初始化完成')
}

// 暴露方法给父组件
defineExpose({
    searchWithKeyword,
    searchByBrand,
    init
})
</script>

<style lang="scss" scoped>
.product-list-container {
    padding: 0;
    padding-top: 0; /* 移除顶部间距，让工具栏更贴近搜索框 */
    background-color: #f8f8f8;
    /* 使用100%宽度，由父容器控制边距 */
    width: 100%;
    box-sizing: border-box;
}



.watches-scroll {
    flex: 1;
    height: calc(100vh - 126px - 70px); /* 减去 navbar+搜索框(126) + tabbar(70) */
    padding-top: 108px; /* 为固定的工具栏容器留出空间，防止内容被覆盖 */
    box-sizing: border-box;
}

.watches-list {
    &.single-mode {
        .watch-item-single {
            display: flex;
            background-color: #fff;
            padding: 15px;
            margin-bottom: 10px;

            .watch-image {
                width: 80px;
                height: 80px;
                margin-right: 15px;
            }

            .watch-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;

                .watch-name {
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                    margin-bottom: 5px;
                }

                .watch-price {
                    font-size: 18px;
                    color: #e85a4f;
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .watch-meta {
                    .brand-text {
                        font-size: 12px;
                        color: #999;
                    }
                }
            }
        }
    }

    &.grid-mode {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;

        .watch-item-grid {
            background-color: #fff;
            padding: 10px;

            .watch-image-grid {
                width: 100%;
                height: 120px;
                margin-bottom: 8px;
            }

            .watch-info-grid {
                .watch-name-grid {
                    font-size: 14px;
                    color: #333;
                    font-weight: 500;
                    margin-bottom: 5px;
                    display: block;
                }

                .watch-price-grid {
                    font-size: 16px;
                    color: #e85a4f;
                    font-weight: bold;
                    margin-bottom: 5px;
                    display: block;
                }

                .watch-meta-grid {
                    .brand-text-grid {
                        font-size: 12px;
                        color: #999;
                    }
                }
            }
        }
    }
}

.load-status {
    text-align: center;
    padding: 20px;

    .loading, .empty, .no-more {
        color: #999;
        font-size: 14px;
    }
}
</style>
