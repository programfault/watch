<template>
    <view class="container">
        <!-- 加载状态 -->
        <view v-if="watchDetailLoading" class="loading">
            <uni-load-more status="loading" :content-text="{ contentdown: '加载中...', contentrefresh: '加载中...', contentnomore: '加载中...' }" />
        </view>

        <!-- 手表详情内容 -->
        <view v-else-if="currentWatch" class="watch-detail">
            <!-- 图片轮播 -->
            <view class="images-section">
                <swiper class="watch-images" :indicator-dots="true" :indicator-color="'rgba(255,255,255,0.6)'" :indicator-active-color="'#007aff'">
                    <swiper-item v-for="(image, index) in watchImages" :key="index">
                        <image :src="image.image_url || image.url" mode="aspectFill" class="detail-image" :show-loading="true"></image>
                    </swiper-item>
                </swiper>
            </view>

            <!-- 基本信息 -->
            <view class="basic-info-section">
                <!-- 品牌 Logo -->
                <view v-if="currentWatch.brand" class="brand-header">
                    <image v-if="currentWatch.brand.logo" :src="currentWatch.brand.logo" class="brand-logo" mode="aspectFit" />
                    <text class="brand-name">{{ currentWatch.brand.name_cn }}</text>
                </view>

                <!-- 手表名称和价格 -->
                <view class="watch-title">
                    <text class="watch-name">{{ currentWatch.name_cn || currentWatch.name }}</text>
                    <text class="watch-name-en">{{ currentWatch.name_en }}</text>
                </view>

                <view class="price-section">
                    <text class="price-label">参考价格</text>
                    <text class="watch-price">¥{{ formatPrice(currentWatch.price) }}</text>
                </view>
            </view>

            <!-- 产品描述 -->
            <view class="summary-section">
                <view class="section-header">
                    <text class="section-title">产品介绍</text>
                </view>
                <view class="summary-content">
                    <text class="summary-text">{{ currentWatch.summary }}</text>
                </view>
            </view>

            <!-- 技术规格 -->
            <view v-if="currentWatch.attributes && currentWatch.attributes.length > 0" class="specs-section">
                <view class="section-header">
                    <text class="section-title">技术规格</text>
                </view>
                <view class="specs-grid">
                    <view v-for="attr in currentWatch.attributes" :key="attr.id" class="spec-item">
                        <text class="spec-label">{{ attr.name }}</text>
                        <text class="spec-value">{{ attr.value }}{{ attr.unit || '' }}</text>
                    </view>
                </view>
            </view>

            <!-- 可售门店 -->
            <view v-if="currentWatch.available_stores && currentWatch.available_stores.length > 0" class="stores-section" :class="{ 'blinking': storesBlinking }" id="stores-section">
                <view class="section-header">
                    <text class="section-title">可售门店</text>
                </view>
                <view class="stores-list">
                    <StoreCard
                        v-for="store in currentWatch.available_stores"
                        :key="store.id"
                        :store="store"
                        :location-authorized="locationAuthorized"
                        :user-location="userLocation"
                        :format-store-distance="formatStoreDistance"
                        @show-detail="showStoreDetail"
                        @call="callStore"
                        @navigate="navigateToStore"
                        @request-location="requestLocationPermission"
                    />
                </view>
            </view>

            <!-- 底部操作栏 -->
            <view class="bottom-actions">
                <view class="left-actions">
                    <view class="icon-btn contact-btn" @click="handleContact">
                        <uv-icon name="server-man" size="26" color="#666"></uv-icon>
                        <text>客服</text>
                    </view>
                    <view class="icon-btn favorite-btn" :class="{ 'favorited': isFavorited }" @click="handleFavorite">
                        <uv-icon name="heart" size="26" :color="isFavorited ? '#ff4d4f' : '#666'"></uv-icon>
                        <text>{{ isFavorited ? '已收藏' : '收藏' }}</text>
                    </view>
                </view>
                <button class="main-btn store-btn" @click="handleViewStores">
                    <text>在售门店</text>
                </button>
            </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty">
            <uv-icon name="info-circle" size="60" color="#ccc"></uv-icon>
            <text class="empty-text">手表信息不存在</text>
        </view>

        <!-- 底部间距 -->
        <view class="bottom-spacer"></view>
    </view>
</template>

<script setup>
import StoreCard from '@/components/StoreCard.vue'
import { useFavoritesStore } from '@/stores/favorites.js'
import { useProductStore } from '@/stores/product.js'
import { getCurrentTimeToMinute } from '@/utils/timeUtils.js'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
// 导入位置相关工具函数
import {
    calculateDistance,
    checkLocationPermission,
    formatDistance,
    openMapNavigation,
    requestLocationPermission
} from '@/utils/locationUtils.js'
// 导入客服工具函数
import { quickContactCustomerService } from '@/utils/customerServiceUtils.js'

const productStore = useProductStore()
const favoritesStore = useFavoritesStore()
const { currentWatch, watchDetailLoading } = storeToRefs(productStore)

const watchId = ref(null)

// 收藏状态
const isFavorited = computed(() => {
    return currentWatch.value?.id ? favoritesStore.isFavorited(currentWatch.value.id) : false
})

// 定位相关状态
const locationAuthorized = ref(false)
const userLocation = ref(null)

// 门店区域闪烁状态
const storesBlinking = ref(false)

const watchImages = computed(() => {
    if (!currentWatch.value || !currentWatch.value.images) return []
    return currentWatch.value.images.length > 0 ? currentWatch.value.images : [{ image_url: '/static/logo.png' }]
})

// 格式化价格
const formatPrice = (price) => {
    if (!price) return '0'
    return Number(price).toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })
}

const loadWatchDetail = async () => {
    try {
        await productStore.fetchWatchDetail(watchId.value)

        // 如果加载成功且有产品信息，添加到浏览记录
        if (currentWatch.value && currentWatch.value.id) {
            favoritesStore.addToBrowsingHistory({
                id: currentWatch.value.id,
                title: currentWatch.value.name_cn || currentWatch.value.name,
                price: currentWatch.value.price,
                visitedAt: getCurrentTimeToMinute()
            })
        }
    } catch (error) {
        console.error('加载手表详情失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
    }
}

// 联系客服
const handleContact = () => {
    quickContactCustomerService({
        onSuccess: (result) => {
            console.log('客服聊天打开成功:', result)
        },
        onFail: (error) => {
            console.log('客服聊天打开失败:', error)
        }
    })
}

// 收藏功能
const handleFavorite = () => {
    if (!currentWatch.value?.id) {
        uni.showToast({
            title: '产品信息不完整',
            icon: 'none'
        })
        return
    }

    // 切换收藏状态
    favoritesStore.toggleFavorite({
        id: currentWatch.value.id,
        title: currentWatch.value.name_cn || currentWatch.value.name,
        model: currentWatch.value.model,
        price: currentWatch.value.price,
        images: currentWatch.value.images,
        visitedAt: getCurrentTimeToMinute()
    })
}

// 查看在售门店
const handleViewStores = () => {
    if (currentWatch.value?.available_stores?.length > 0) {
        // 启动闪烁效果
        storesBlinking.value = true
        
        // 滑动到门店区域
        uni.pageScrollTo({
            selector: '#stores-section',
            duration: 300,
            success: () => {
                // 滑动完成后，延迟一点时间再停止闪烁，确保用户看到效果
                setTimeout(() => {
                    storesBlinking.value = false
                }, 1500) // 闪烁1.5秒
            },
            fail: () => {
                // 即使滑动失败也要停止闪烁
                setTimeout(() => {
                    storesBlinking.value = false
                }, 1500)
            }
        })
    } else {
        uni.showToast({
            title: '暂无可售门店',
            icon: 'none'
        })
    }
}

// 显示店铺详情
const showStoreDetail = (store) => {
    uni.showModal({
        title: store.name,
        content: `地址: ${store.address}\n电话: ${store.phone}\n营业时间: ${store.opening_hours}\n\n${store.description || ''}`,
        showCancel: false
    })
}

// 拨打电话
const callStore = (store) => {
    uni.makePhoneCall({
        phoneNumber: store.phone,
        fail: (err) => {
            console.error('拨打电话失败:', err)
            uni.showToast({
                title: '拨打电话失败',
                icon: 'none'
            })
        }
    })
}

// 地图导航
const navigateToStore = async (store) => {
    if (!store.latitude || !store.longitude) {
        uni.showToast({
            title: '该店铺暂无位置信息',
            icon: 'none'
        })
        return
    }

    await openMapNavigation(store)
}

// 计算门店距离
const calculateStoreDistance = (store) => {
    if (!userLocation.value || !store.latitude || !store.longitude) {
        return Infinity
    }
    return calculateDistance(userLocation.value, store)
}

// 格式化门店距离显示
const formatStoreDistance = (store) => {
    const distance = calculateStoreDistance(store)
    if (distance === Infinity) return null
    return formatDistance(distance)
}

// 页面显示时检查权限
onShow(() => {
    checkLocationPermission()
})

// 组件挂载时检查权限
onMounted(() => {
    checkLocationPermission()
})

onLoad((options) => {
    console.log("=======")
    console.log(options.id)
    if (options.id) {
        watchId.value = options.id
        loadWatchDetail()
    }
})
</script>

<style lang="scss" scoped>
@import './detail.scss';
</style>
