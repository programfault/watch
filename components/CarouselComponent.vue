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
            <text class="carousel-desc" v-if="item.description">{{ item.description }}</text>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 加载状态 -->
    <view class="loading-section" v-if="appStore.carouselLoading">
      <uni-load-more status="loading" />
    </view>

    <!-- 空状态 -->
    <view class="empty-section" v-if="!appStore.hasCarousel && !appStore.carouselLoading">
      <text class="empty-text">暂无轮播内容</text>
    </view>
  </view>
</template>

<script>
import { useAppStore } from '@/stores'

export default {
  name: 'CarouselComponent',
  props: {
    // 轮播图高度
    height: {
      type: String,
      default: '200px'
    },
    // 自动播放间隔时间
    interval: {
      type: Number,
      default: 3000
    },
    // 切换动画时长
    duration: {
      type: Number,
      default: 500
    },
    // 是否显示指示点
    showDots: {
      type: Boolean,
      default: true
    },
    // 是否自动播放
    autoplay: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const appStore = useAppStore()
    return {
      appStore
    }
  },
  methods: {
    // 轮播图点击事件
    onCarouselClick(carouselItem) {
      console.log('点击轮播图:', carouselItem)

      // 显示轮播图信息提示
      uni.showToast({
        title: `点击了: ${carouselItem.title}`,
        icon: 'none'
      })

      // 如果后续 API 返回跳转信息，可以在这里添加跳转逻辑
      // 例如: if (carouselItem.link_url) { uni.navigateTo({ url: carouselItem.link_url }) }
    }
  }
}
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
      background: linear-gradient(transparent, rgba(0,0,0,0.6));
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
  text-align: center;
  padding: 40px 0;

  .empty-text {
    color: #999;
    font-size: 14px;
  }
}
</style>
