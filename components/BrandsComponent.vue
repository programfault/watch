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
      v-if="sortedBrandsList.length > 0"
    >
      <uni-grid-item
        v-for="(brand, index) in sortedBrandsList"
        :key="brand.id"
        @click="onBrandClick(brand)"
      >
        <view class="brand-item" @click.stop="onBrandClick(brand)" :id="index">
          <image
            :src="brand.logo"
            mode="aspectFit"
            class="brand-logo"
            :alt="brand.name_cn"
          />
          <text class="brand-name-cn">{{ brand.name_cn }}</text>
          <text class="brand-name-en">{{ brand.name_en }}</text>
        </view>
      </uni-grid-item>
    </uni-grid>

    <!-- 品牌加载状态 -->
    <view class="loading-section" v-if="appStore.brandsLoading">
      <uni-load-more status="loading" />
    </view>

    <!-- 品牌空状态 -->
    <view class="empty-section" v-if="!sortedBrandsList.length && !appStore.brandsLoading">
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
  computed: {
    // 根据 sort 字段从小到大排序的品牌列表
    sortedBrandsList() {
      if (!this.appStore.brandsList || this.appStore.brandsList.length === 0) {
        return []
      }

      return [...this.appStore.brandsList].sort((a, b) => {
        // 从小到大排序 (升序)
        const sortA = a.sort || 0
        const sortB = b.sort || 0
        return sortA - sortB
      })
    }
  },
  methods: {
    // 品牌点击事件
    onBrandClick(brand) {
      console.log('点击品牌:', brand)

      // 检查品牌数据
      if (!brand) {
        console.error('品牌数据为空')
        uni.showToast({
          title: '品牌数据错误',
          icon: 'none'
        })
        return
      }

      console.log('品牌ID:', brand.id)
      console.log('品牌中文名:', brand.name_cn)
      console.log('品牌英文名:', brand.name_en)

      // 构建跳转URL，只传递品牌ID
      const url = `/pages/product/list?id=${brand.id}`
      console.log('跳转URL:', url)

      // 跳转到产品列表页面，传递品牌信息
      uni.navigateTo({
        url: url,
        success: (res) => {
          console.log('页面跳转成功:', res)
        },
        fail: (err) => {
          console.error('页面跳转失败:', err)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
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
