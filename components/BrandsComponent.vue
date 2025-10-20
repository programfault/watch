<template>
  <view class="brands-section">
    <view class="section-header">
      <text class="section-title">手表品牌</text>
    </view>

    <!-- 品牌网格 -->
    <u-grid
      :col="3"
      :border="false"
      v-if="sortedBrandsList.length > 0"
    >
      <u-grid-item
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
          <!-- <text class="brand-name-en">{{ brand.name_en }}</text> -->
        </view>
      </u-grid-item>
    </u-grid>

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

<script setup>
import { useAppStore } from '@/stores';
import { computed } from 'vue';

// 定义组件名称
defineOptions({
  name: 'BrandsComponent'
});

// 定义emits
const emit = defineEmits(['brandClick']);

// 定义props
const props = defineProps({
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
});

// Store实例
const appStore = useAppStore();

// 根据 sort 字段从小到大排序的品牌列表
const sortedBrandsList = computed(() => {
  if (!appStore.brandsList || appStore.brandsList.length === 0) {
    return [];
  }

  return [...appStore.brandsList].sort((a, b) => {
    // 从小到大排序 (升序)
    const sortA = a.sort || 0;
    const sortB = b.sort || 0;
    return sortA - sortB;
  });
});

// 品牌点击事件
const onBrandClick = (brand) => {
  console.log('点击品牌:', brand);

  // 检查品牌数据
  if (!brand) {
    console.error('品牌数据为空');
    uni.showToast({
      title: '品牌数据错误',
      icon: 'none'
    });
    return;
  }

  console.log('品牌ID:', brand.id);
  console.log('品牌中文名:', brand.name_cn);
  console.log('品牌英文名:', brand.name_en);

  // 发出事件给父组件，让父组件处理品牌点击
  emit('brandClick', brand);
};
</script>

<style lang="scss">
.brands-section {
  margin-bottom: 20px;
  background: #fff;

  .section-header {
    padding: 15px 20px 10px;
    border-bottom: 1px solid #f5f5f5;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
  }

  .brand-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 10px;
    background: #fff;
    border-radius: 0;
    margin: 0;
    border-bottom: 1px solid #f5f5f5;
    transition: background-color 0.2s ease;

    &:active {
      background-color: #f8f8f8;
    }

    .brand-logo {
      width: 60px;
      height: 60px;
      margin-bottom: 8px;
      border-radius: 4px;
    }

    .brand-name-cn {
      font-size: 13px;
      font-weight: 400;
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
