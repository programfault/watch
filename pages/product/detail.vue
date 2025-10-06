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
            <view v-if="currentWatch.available_stores && currentWatch.available_stores.length > 0" class="stores-section" id="stores-section">
                <view class="section-header">
                    <text class="section-title">可售门店</text>
                </view>
                <view class="stores-list">
                    <view v-for="store in currentWatch.available_stores" :key="store.id" class="store-item">
                        <view class="store-header">
                            <text class="store-name" @click="showStoreDetail(store)">{{ store.name }}</text>
                        </view>
                        <view class="store-info">
                            <text class="store-address" @click="showStoreDetail(store)">{{ store.address }}</text>
                        </view>
                        <text v-if="store.description" class="store-desc" @click="showStoreDetail(store)">{{ store.description }}</text>
                        <view class="store-footer">
                            <text class="store-hours">营业时间: {{ store.opening_hours }}</text>
                        </view>
                        <view class="action-buttons">
                            <!-- 距离显示在左侧 -->
                            <view class="distance-info">
                                <text class="distance-text" v-if="locationAuthorized && userLocation && formatDistance(store)">距您 {{ formatDistance(store) }}</text>
                                <text class="distance-placeholder" v-else-if="!locationAuthorized">位置未授权</text>
                                <text class="distance-placeholder" v-else-if="!userLocation">获取位置中...</text>
                                <text class="distance-placeholder" v-else-if="!store.latitude || !store.longitude">无位置信息</text>
                                <text class="distance-placeholder" v-else>计算异常</text>
                            </view>
                            <!-- 按钮组在右侧 -->
                            <view class="button-group">
                                <view class="phone-section" @click.stop="callStore(store)">
                                    <uv-icon name="phone" size="14" color="#007aff"></uv-icon>
                                    <text class="store-phone">电话</text>
                                </view>
                                <!-- 只有有位置权限时才显示导航按钮 -->
                                <view v-if="locationAuthorized" class="nav-button" @click.stop="navigateToStore(store)">
                                    <uv-icon name="map" size="16" color="#fff"></uv-icon>
                                    <text class="nav-text">导航</text>
                                </view>
                                <!-- 没有位置权限时显示提示 -->
                                <view v-else class="nav-disabled" @click.stop="requestLocationPermission">
                                    <uv-icon name="map" size="14" color="#ccc"></uv-icon>
                                    <text class="nav-disabled-text">开启定位</text>
                                </view>
                            </view>
                        </view>
                    </view>
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
import { useFavoritesStore } from '@/stores/favorites.js'
import { useProductStore } from '@/stores/product.js'
import { getCurrentTimeToMinute } from '@/utils/timeUtils.js'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

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
    uni.showActionSheet({
        itemList: ['在线客服', '电话咨询'],
        success: (res) => {
            if (res.tapIndex === 0) {
                uni.showToast({
                    title: '正在连接客服...',
                    icon: 'none'
                })
                // 这里可以跳转到客服页面或打开客服聊天
            } else if (res.tapIndex === 1) {
                uni.makePhoneCall({
                    phoneNumber: '400-888-8888'
                })
            }
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
        // 滑动到门店区域
        uni.pageScrollTo({
            selector: '#stores-section',
            duration: 300
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
const navigateToStore = (store) => {
    if (!store.latitude || !store.longitude) {
        uni.showToast({
            title: '该店铺暂无位置信息',
            icon: 'none'
        })
        return
    }

    uni.openLocation({
        latitude: parseFloat(store.latitude),
        longitude: parseFloat(store.longitude),
        name: store.name,
        address: store.address,
        fail: (err) => {
            console.error('打开地图失败:', err)
            uni.showToast({
                title: '打开地图失败',
                icon: 'none'
            })
        }
    })
}

// 请求定位权限
const requestLocationPermission = async () => {
    try {
        const modalResult = await uni.showModal({
            title: '位置权限请求',
            content: '为了为您提供最近门店的导航服务和距离显示，需要获取您的位置信息。',
            confirmText: '同意授权',
            cancelText: '暂不授权'
        })

        if (modalResult.confirm) {
            try {
                await uni.authorize({ scope: 'scope.userLocation' })
                locationAuthorized.value = true
                await getUserLocation()
                uni.showToast({ title: '位置权限开启成功', icon: 'success' })
            } catch (authError) {
                locationAuthorized.value = false
                uni.showToast({ title: '授权失败', icon: 'none' })
            }
        }
    } catch (error) {
        console.error('请求权限失败:', error)
    }
}

// 获取用户当前位置
const getUserLocation = async () => {
    try {
        const res = await uni.getLocation({
            type: 'gcj02',
            highAccuracyExpireTime: 4000,
            isHighAccuracy: true
        })

        userLocation.value = {
            latitude: res.latitude,
            longitude: res.longitude
        }

        return userLocation.value
    } catch (error) {
        console.error('获取位置失败:', error)
        locationAuthorized.value = false
        return null
    }
}

// 计算门店距离
const calculateDistance = (store) => {
    if (!userLocation.value || !store.latitude || !store.longitude) {
        return Infinity
    }

    const rad1 = (userLocation.value.latitude * Math.PI) / 180
    const rad2 = (parseFloat(store.latitude) * Math.PI) / 180
    const deltaLat = rad2 - rad1
    const deltaLon = (parseFloat(store.longitude) - userLocation.value.longitude) * Math.PI / 180

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(rad1) * Math.cos(rad2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = 6371 * c // 地球半径(公里)

    return distance
}

// 格式化距离显示
const formatDistance = (store) => {
    const distance = calculateDistance(store)
    if (distance === Infinity) return null

    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`
    } else if (distance < 10) {
        return `${distance.toFixed(1)}km`
    } else {
        return `${Math.round(distance)}km`
    }
}

// 检查定位权限
const checkLocationPermission = async () => {
    try {
        const setting = await uni.getSetting()

        if (setting.authSetting['scope.userLocation'] === true) {
            locationAuthorized.value = true
            await getUserLocation()
        } else {
            locationAuthorized.value = false
        }
    } catch (error) {
        console.error('检查位置权限失败:', error)
        locationAuthorized.value = false
    }
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
