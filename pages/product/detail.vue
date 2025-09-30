<template>
<view class="container">
<view v-if="watchDetailLoading" class="loading">
<text>加载中...</text>
</view>

<view v-else-if="currentWatch" class="watch-detail">
<swiper class="watch-images" :indicator-dots="true">
<swiper-item v-for="(image, index) in watchImages" :key="index">
<image :src="image.image_url || image.url" mode="aspectFit" class="detail-image"></image>
</swiper-item>
</swiper>

<view class="basic-info">
<text class="watch-name">{{ currentWatch.name_cn || currentWatch.name }}</text>
<text class="watch-price">¥{{ currentWatch.price }}</text>
</view>

<view class="detail-section">
<text class="section-title">产品详情</text>
<text class="summary">{{ currentWatch.summary }}</text>
</view>
</view>

<view v-else class="empty">
<text>手表信息不存在</text>
</view>
</view>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/product.js'

export default {
name: 'ProductDetail',

data() {
return {
watchId: null
}
},

computed: {
...storeToRefs(useProductStore()),
watchImages() {
if (!this.currentWatch || !this.currentWatch.images) return []
return this.currentWatch.images.length > 0 ? this.currentWatch.images : [{ image_url: '/static/logo.png' }]
}
},

onLoad(options) {
if (options.id) {
this.watchId = options.id
this.loadWatchDetail()
}
},

methods: {
async loadWatchDetail() {
const productStore = useProductStore()
try {
await productStore.fetchWatchDetail(this.watchId)
} catch (error) {
uni.showToast({
title: '加载失败',
icon: 'none'
})
}
}
}
}
</script>

<style lang="scss" scoped>
.container {
min-height: 100vh;
background-color: #f5f5f5;
}

.loading, .empty {
text-align: center;
padding: 100rpx;
font-size: 28rpx;
color: #999;
}

.watch-images {
height: 500rpx;
background-color: #fff;

.detail-image {
width: 100%;
height: 100%;
}
}

.basic-info {
background-color: #fff;
padding: 30rpx;
margin-bottom: 20rpx;

.watch-name {
display: block;
font-size: 36rpx;
font-weight: bold;
color: #333;
margin-bottom: 20rpx;
}

.watch-price {
display: block;
font-size: 42rpx;
color: #e74c3c;
font-weight: bold;
}
}

.detail-section {
background-color: #fff;
padding: 30rpx;

.section-title {
display: block;
font-size: 32rpx;
font-weight: bold;
color: #333;
margin-bottom: 20rpx;
}

.summary {
display: block;
font-size: 28rpx;
color: #666;
line-height: 1.6;
}
}
</style>
