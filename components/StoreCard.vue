<template>
  <view class="store-item">
    <view class="store-header">
      <text class="store-name" @click="handleShowDetail">{{ store.name }}</text>
    </view>
    <view class="store-info">
      <text class="store-address" @click="handleShowDetail">{{ store.address }}</text>
    </view>
    <text v-if="store.description" class="store-description" @click="handleShowDetail">{{ store.description }}</text>
    <view class="store-footer">
      <text class="store-hours">营业时间: {{ store.opening_hours }}</text>
      <view class="action-buttons">
        <!-- 距离显示在左侧 -->
        <view class="distance-info">
          <text class="distance-text" v-if="locationAuthorized && userLocation && formattedDistance">距您 {{ formattedDistance }}</text>
          <text class="distance-placeholder" v-else-if="!locationAuthorized">位置未授权</text>
          <text class="distance-placeholder" v-else-if="!userLocation">获取位置中...</text>
          <text class="distance-placeholder" v-else-if="!store.latitude || !store.longitude">无位置信息</text>
          <text class="distance-placeholder" v-else>计算异常</text>
        </view>
        <!-- 按钮组在右侧 -->
        <view class="button-group">
          <view class="phone-section" @click.stop="handleCall">
            <up-icon name="phone" size="14" color="#007aff" />
            <text class="store-phone">电话</text>
          </view>
          <!-- 只有有位置权限时才显示导航按钮 -->
          <view v-if="locationAuthorized" class="nav-button" @click.stop="handleNavigate">
            <up-icon name="map" size="16" color="#fff" />
            <text class="nav-text">导航</text>
          </view>
          <!-- 没有位置权限时显示提示，点击可以开启定位 -->
          <view v-else class="nav-disabled" @click.stop="handleRequestLocation">
            <up-icon name="map" size="14" color="#ccc" />
            <text class="nav-disabled-text">开启定位</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// Props定义
const props = defineProps({
  store: {
    type: Object,
    required: true,
    default: () => ({})
  },
  locationAuthorized: {
    type: Boolean,
    default: false
  },
  userLocation: {
    type: Object,
    default: null
  },
  formatStoreDistance: {
    type: Function,
    required: true
  }
})

// 计算属性
const formattedDistance = computed(() => {
  return props.formatStoreDistance(props.store)
})

// 定义事件
const emit = defineEmits(['showDetail', 'call', 'navigate', 'requestLocation'])

// 处理显示详情
const handleShowDetail = () => {
  emit('showDetail', props.store)
}

// 处理拨打电话
const handleCall = () => {
  emit('call', props.store)
}

// 处理导航
const handleNavigate = () => {
  emit('navigate', props.store)
}

// 处理请求定位
const handleRequestLocation = () => {
  emit('requestLocation')
}
</script>

<style lang="scss" scoped>
.store-item {
  background-color: #fff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.store-header {
  margin-bottom: 8px;
}

.store-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.store-info {
  margin-bottom: 8px;
}

.store-address {
  font-size: 14px;
  color: #666;
}

.store-description {
  font-size: 13px;
  color: #999;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.store-footer {
  margin-top: 12px;
}

.store-hours {
  font-size: 13px;
  color: #999;
  display: block;
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.distance-info {
  flex: 1;
}

.distance-text {
  font-size: 14px;
  color: #007aff;
}

.distance-placeholder {
  font-size: 14px;
  color: #ccc;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.phone-section {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: #f0f8ff;
  transition: all 0.2s ease;

  &:active {
    background-color: #e6f3ff;
    transform: scale(0.95);
  }
}

.store-phone {
  font-size: 14px;
  color: #007aff;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #007aff;
  color: #fff;
  transition: all 0.2s ease;

  &:active {
    background-color: #005bb5;
    transform: scale(0.95);
  }
}

.nav-text {
  font-size: 14px;
  color: #fff;
}

.nav-disabled {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #f5f5f5;
  transition: all 0.2s ease;

  &:active {
    background-color: #e8e8e8;
    transform: scale(0.95);
  }
}

.nav-disabled-text {
  font-size: 14px;
  color: #ccc;
}
</style>
