<template>
  <view>
    <!-- 轮播图 -->
    <view class="carousel-section" v-if="appStore.hasCarousel">
      <swiper
        class="carousel-swiper"
        indicator-dots
        autoplay
        interval="3000"
        duration="500"
        circular
      >
        <swiper-item
          v-for="(item, index) in appStore.activeCarousel"
          :key="index"
          @click="onCarouselClick(item)"
        >
          <image
            :src="item.image"
            mode="aspectFill"
            class="carousel-image"
            :alt="item.title"
          />
          <view class="carousel-content" v-if="item.title">
            <text class="carousel-title">{{ item.title }}</text>
            <text class="carousel-desc" v-if="item.description">{{
              item.description
            }}</text>
          </view>
        </swiper-item>
      </swiper>
    </view>
    <!-- 加载状态 -->
    <view class="loading-section" v-if="appStore.carouselLoading">
      <uni-load-more status="loading" />
    </view>

    <!-- 空状态 -->
    <view
      class="empty-section"
      v-if="!appStore.hasCarousel && !appStore.carouselLoading"
    >
      <view class="empty-placeholder" :class="{ 'no-image': imageLoadError }">
        <!-- 背景图片 -->
        <image
          v-if="!imageLoadError"
          :src="placeholderImage"
          class="background-image"
          mode="aspectFill"
          alt="活动占位背景"
          @error="onImageError"
          @load="onImageLoad"
        />

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

<script>
import { useAppStore } from "@/stores";

export default {
  name: "CarouselComponent",
  props: {
    // 轮播图高度
    height: {
      type: String,
      default: "200px",
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
  },
  setup() {
    const appStore = useAppStore();
    return {
      appStore,
    };
  },
  data(){
    return{
        loading: true,
        imageLoadError: false,
    }
  },
  computed: {
    // 占位图片路径 - 提供多种备选路径
    placeholderImage() {
      // 尝试多种路径格式
      const paths = [
        '/static/carousel/placeholder.png',
        'static/carousel/placeholder.png',
        './static/carousel/placeholder.png',
        '../static/carousel/placeholder.png'
      ];

      const selectedPath = paths[1]; // 先试第二种
      console.log('尝试加载图片路径:', selectedPath);
      return selectedPath;
    }
  },
  mounted() {
    console.log('CarouselComponent mounted');
    console.log('图片路径:', this.placeholderImage);
    console.log('imageLoadError:', this.imageLoadError);
  },
  methods: {
    // 图片加载错误处理
    onImageError(e) {
      console.error('占位图片加载失败:', e);
      console.log('失败的图片路径:', this.placeholderImage);
      console.log('错误详情:', e.detail);
      this.imageLoadError = true;

      // 尝试其他路径
      console.log('尝试切换到备用方案');
    },

    // 图片加载成功
    onImageLoad(e) {
      console.log('图片加载成功:', this.placeholderImage);
    },
    // 轮播图点击事件
    onCarouselClick(carouselItem) {
      console.log("点击轮播图:", carouselItem);
      if (carouselItem.has_content === 0) {
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
    },
  },
};
</script>

<style lang="scss">
.carousel-section {
  margin-bottom: 20px;

  .carousel-swiper {
    height: 200px;
    border-radius: 12px;
    overflow: hidden;

    .carousel-image {
      width: 100%;
      height: 100%;
    }

    .carousel-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
      padding: 20px 15px 15px;
      color: white;

      .carousel-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 5px;
        display: block;
      }

      .carousel-desc {
        font-size: 12px;
        opacity: 0.9;
        display: block;
      }
    }
  }
}

.loading-section {
  text-align: center;
  padding: 40px 0;
}

.empty-section {
  margin-bottom: 20px;

  .empty-placeholder {
    height: 200px;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);

    // 使用image标签作为背景图片
    .background-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;

      // 如果图片加载失败，显示渐变背景
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #8B9DC3 0%, #667eea 100%);
        z-index: -1;
      }
    }

    // 备用渐变背景
    &.no-image {
      background: linear-gradient(135deg, #8B9DC3 0%, #667eea 100%);
    }

    // 添加半透明遮罩确保文字可读性
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 0;
    }

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
