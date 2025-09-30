<template>
  <view class="brands-section">
    <view class="section-header">
      <text class="section-title">手表品牌</text>
    </view>

    <!-- 品牌网格 -->
    <uni-grid
      :column="3"
      :square="false"
      :showBorder="false"
      v-if="appStore.brandsList.length > 0"
    >
      <uni-grid-item
        v-for="(brand, index) in appStore.brandsList"
        :key="brand.id"
        @click="onBrandClick(brand)"
      >
        <view class="brand-item">
          <image
            :src="brand.logo"
            mode="aspectFit"
            class="brand-logo"
            :alt="brand.name_cn"
          />
          <text class="brand-name-cn">{{ brand.name_cn }}</text>
        </view>
      </uni-grid-item>
    </uni-grid>

    <!-- 品牌加载状态 -->
    <view class="loading-section" v-if="appStore.brandsLoading">
      <uni-load-more status="loading" />
    </view>

    <!-- 品牌空状态 -->
    <view class="empty-section" v-if="!appStore.brandsList.length && !appStore.brandsLoading">
      <text class="empty-text">暂无品牌信息</text>
    </view>
  </view>
</template>

<script>
import { useAppStore } from '@/stores'

export default {
  name: 'BrandsComponent',
  props: {
    // 是否显示标题
    showTitle: {
      type: Boolean,
      default: true
    },
    // 自定义标题
    title: {
      type: String,
      default: '手表品牌'
    },
    // 网格列数
    columns: {
      type: Number,
      default: 3
    }
  },
  setup() {
    const appStore = useAppStore()
    return {
      appStore
    }
  },
  methods: {
    // 品牌点击事件
    onBrandClick(brand) {
      console.log('点击品牌:', brand)

      // 显示品牌信息提示
      uni.showToast({
        title: `点击了: ${brand.name_cn}`,
        icon: 'none'
      })

      // 后续可以跳转到品牌详情页或产品列表页
      // uni.navigateTo({
      //   url: `/pages/brand/detail?id=${brand.id}`
      // })
    }
  }
}
</script>

<style lang="scss">
.brands-section {
  margin-bottom: 20px;

  .section-header {
    margin-bottom: 15px;

    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
  }

  .brand-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 10px;
    background: #fff;
    border-radius: 8px;
    margin: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.95);
    }

    .brand-logo {
      width: 50px;
      height: 50px;
      margin-bottom: 8px;
      border-radius: 4px;
    }

    .brand-name-cn {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      text-align: center;
      margin-bottom: 2px;
    }

    .brand-name-en {
      font-size: 12px;
      color: #666;
      text-align: center;
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
}
</style>
