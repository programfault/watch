<template>
  <view>
    <!-- 轮播图 - 仅在有数据时显示 -->
    <view class="carousel-section" v-if="appStore.hasCarousel">
      <swiper :autoplay="autoplay" :interval="interval" :duration="duration" :circular="true" :indicator-dots="showDots"
        indicator-active-color="#fff" indicator-color="rgba(255, 255, 255, 0.4)"
        :style="{ height: height + 'px' }" class="carousel-swiper">
        <swiper-item v-for="(item, index) in carouselList" :key="index" @click="onCarouselClick(index)">
          <image :src="item.image" mode="aspectFill" class="swiper-image" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 占位内容 - 在没有轮播图数据时显示（包括加载中状态） -->
    <view class="empty-section" v-if="!appStore.hasCarousel">
      <view class="empty-placeholder">
        <!-- 装饰性背景图案 -->
        <view class="bg-pattern">
          <view class="pattern-circle circle-1"></view>
          <view class="pattern-circle circle-2"></view>
          <view class="pattern-circle circle-3"></view>
        </view>

        <!-- 主要内容 -->
        <view class="empty-content">
          <text class="empty-title">精彩活动即将上线</text>
          <text class="empty-desc">最新品牌活动与优惠信息正在准备中</text>
          <view class="placeholder-dots">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useAppStore } from "@/stores";
import { computed } from "vue";

// 定义组件名称和props
defineOptions({
  name: "CarouselComponent"
});

// 定义props
const props = defineProps({
  // 轮播图高度
  height: {
    type: [String, Number],
    default: 200,
  },
  // 自动播放间隔时间
  interval: {
    type: Number,
    default: 3000,
  },
  // 切换动画时长
  duration: {
    type: Number,
    default: 500,
  },
  // 是否显示指示点
  showDots: {
    type: Boolean,
    default: true,
  },
  // 是否自动播放
  autoplay: {
    type: Boolean,
    default: true,
  },
});

// Store实例
const appStore = useAppStore();

const carouselList = computed(() => {
  return appStore.activeCarousel || [];
});

// 轮播图点击事件
const onCarouselClick = (index) => {
  const carouselItem = appStore.activeCarousel[index];
  console.log("点击轮播图:", carouselItem);
  if (!carouselItem || carouselItem.has_content === 0) {
    console.log("无内容可跳转");
    return;
  }
  // 跳转到活动页面，传递轮播图信息
  uni.navigateTo({
    url: `/pages/activity/activity?id=${
      carouselItem.id || "unknown"
    }&title=${encodeURIComponent(
      carouselItem.title || ""
    )}&description=${encodeURIComponent(carouselItem.description || "")}`,
  });
};
</script>

<style lang="scss">
.carousel-section {
  margin-bottom: 20px;

  .carousel-swiper {
    overflow: hidden;

    .swiper-image {
      width: 100%;
      height: 100%;
    }
  }
}

.empty-section {
  margin-bottom: 20px;

  .empty-placeholder {
    height: 200px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);



    // 美丽的渐变背景
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    // 装饰性背景图案
    .bg-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;

      .pattern-circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);

        &.circle-1 {
          width: 120rpx;
          height: 120rpx;
          top: -60rpx;
          right: -60rpx;
          animation: float 3s ease-in-out infinite;
        }

        &.circle-2 {
          width: 80rpx;
          height: 80rpx;
          bottom: -40rpx;
          left: -40rpx;
          animation: float 4s ease-in-out infinite reverse;
        }

        &.circle-3 {
          width: 60rpx;
          height: 60rpx;
          top: 30%;
          left: 10%;
          animation: float 5s ease-in-out infinite;
        }
      }
    }

    // 主要内容区域
    .empty-content {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40rpx;
    }

    .empty-title {
      color: #ffffff;
      font-size: 36rpx;
      font-weight: 700;
      margin-bottom: 16rpx;
      display: block;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
    }

    .empty-desc {
      color: rgba(255, 255, 255, 0.85);
      font-size: 28rpx;
      margin-bottom: 40rpx;
      display: block;
      line-height: 1.4;
    }

    .placeholder-dots {
      display: flex;
      gap: 16rpx;

      .dot {
        width: 20rpx;
        height: 20rpx;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.6);
        animation: pulse 2s ease-in-out infinite;

        &:nth-child(1) {
          animation-delay: 0s;
        }

        &:nth-child(2) {
          animation-delay: 0.4s;
        }

        &:nth-child(3) {
          animation-delay: 0.8s;
        }
      }
    }
  }
}

// 动画效果
@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10rpx);
  }
  60% {
    transform: translateY(-5rpx);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0rpx) rotate(0deg);
  }
  50% {
    transform: translateY(-20rpx) rotate(180deg);
  }
}
</style>
