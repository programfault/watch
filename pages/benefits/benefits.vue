<template>
  <view class="container">
    <!-- 加载状态 - 骨架屏 -->
    <view v-if="initialLoading || userInfoLoading" class="benefits-skeleton" :style="dynamicSkeletonStyle">
      <!-- 优惠券骨架屏 -->
      <view class="section-skeleton">
        <view class="section-title-skeleton"></view>
        <view class="card-skeleton" v-for="i in 3" :key="'coupon-' + i">
          <view class="card-header-skeleton">
            <view class="card-title-skeleton"></view>
            <view class="card-badge-skeleton"></view>
          </view>
          <view class="card-content-skeleton">
            <view class="skeleton-line"></view>
            <view class="skeleton-line skeleton-line-short"></view>
          </view>
        </view>
      </view>

      <!-- 特权骨架屏 -->
      <view class="section-skeleton">
        <view class="section-title-skeleton"></view>
        <view class="card-skeleton" v-for="i in 2" :key="'privilege-' + i">
          <view class="card-header-skeleton">
            <view class="card-title-skeleton"></view>
            <view class="card-badge-skeleton"></view>
          </view>
          <view class="card-content-skeleton">
            <view class="skeleton-line"></view>
            <view class="skeleton-line skeleton-line-short"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="benefits-content" :style="dynamicContentStyle" v-if="!initialLoading && !userInfoLoading">
      <!-- 优惠券列表 -->
      <CouponList :coupons="coupons" />

      <!-- 特权列表 -->
      <PrivilegeList :privileges="privileges" />
    </view>

    <!-- 底部标签栏组件 -->
    <CustomTabBar v-show="true" />
  </view>
</template>

<script setup>
import CouponList from '@/components/CouponList.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import PrivilegeList from '@/components/PrivilegeList.vue'
import { useTabBarStore, useUserStore, useLayoutStore } from '@/stores'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, nextTick, ref } from 'vue'

// 定义组件名称
defineOptions({
  name: 'BenefitsPage'
})

// 获取 stores
const userStore = useUserStore()
const tabBarStore = useTabBarStore()
const layoutStore = useLayoutStore()

// 响应式数据
const userInfoLoading = ref(false)
const initialLoading = ref(true) // 初始加载状态，防止白屏
const externalUserId = ref('')
const targetUserInfo = ref(null) // 存储通过ID获取的目标用户信息

const userInfo = computed(() => {
  return userStore.userInfo || {}
})

// 优惠券列表 - 优先使用通过userId获取的用户对象中的数据
const coupons = computed(() => {
  return targetUserInfo.value?.coupons || userInfo.value.coupons || []
})

// 特权列表 - 优先使用通过userId获取的用户对象中的数据
const privileges = computed(() => {
  return targetUserInfo.value?.privileges || userInfo.value.privileges || []
})

// 动态内容区域样式
const dynamicContentStyle = computed(() => {
  if (layoutStore.isInitialized) {
    // 使用layout store计算的安全区域高度和响应式边距
    const safeBottom = layoutStore.safeAreaBottom || 0
    const screenWidth = layoutStore.screenWidth || 375

    // 根据屏幕宽度计算响应式边距
    let horizontalPadding = '32rpx'
    if (screenWidth <= 320) {
      horizontalPadding = '24rpx' // 小屏幕
    } else if (screenWidth >= 768) {
      horizontalPadding = '48rpx' // 大屏幕
    }

    const paddingBottom = 100 + Math.max(safeBottom, 0) // 100rpx基础高度 + 安全区域

    console.log('🎨 Benefits页面动态样式计算:', {
      screenWidth,
      safeBottom,
      horizontalPadding,
      paddingBottom,
      isLayoutInitialized: layoutStore.isInitialized
    })

    return {
      padding: `24rpx ${horizontalPadding} ${paddingBottom}rpx`,
      'box-sizing': 'border-box'
    }
  }
  // 回退到固定高度
  console.log('⚠️ Benefits页面使用固定样式 - layout store未初始化')
  return {
    padding: '24rpx 32rpx 120rpx',
    'box-sizing': 'border-box'
  }
})

// 动态骨架屏样式
const dynamicSkeletonStyle = computed(() => {
  if (layoutStore.isInitialized) {
    const screenWidth = layoutStore.screenWidth || 375

    // 使用与内容区域相同的响应式边距逻辑
    let horizontalPadding = '32rpx'
    if (screenWidth <= 320) {
      horizontalPadding = '24rpx'
    } else if (screenWidth >= 768) {
      horizontalPadding = '48rpx'
    }

    return {
      padding: `24rpx ${horizontalPadding}`,
      'box-sizing': 'border-box'
    }
  }
  // 回退到固定样式
  return {
    padding: '24rpx 32rpx',
    'box-sizing': 'border-box'
  }
})

// 检查登录状态并跳转
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
}

// 检查登录状态
const checkLoginAndRedirect = () => {
  // 这里只是检查，不做跳转，因为我们支持未登录状态的下拉刷新
  return true
}

// 页面生命周期 - onLoad
onLoad((options) => {
  console.log('Benefits页面 onLoad', options)

  // 确保layout store已初始化
  if (!layoutStore.isInitialized) {
    console.log('Benefits页面 - 初始化layout store')
    try {
      layoutStore.initializeLayout()
    } catch (error) {
      console.error('Benefits页面 - layout store初始化失败:', error)
    }
  }

  // 立即显示页面结构，不等待数据加载
  nextTick(() => {
    // 在下一个渲染周期开始数据加载
    initPageDataAsync(options)
  })
})

// 异步初始化页面数据 - 不阻塞页面渲染
const initPageDataAsync = async (options) => {
  try {
    console.log('开始异步初始化Benefits页面数据')
    userInfoLoading.value = true

    // 短暂延迟，确保页面骨架屏先显示
    await new Promise(resolve => setTimeout(resolve, 50))

    // 初始化用户状态
    await userStore.initUserState()

    // 检查登录状态
    if (!checkLoginAndRedirect()) {
      return
    }

    // 检查是否有外部传入的用户ID
    if (options.userId) {
      console.log('接收到外部用户ID:', options.userId)
      externalUserId.value = options.userId

      // 通过用户ID获取完整用户对象
      await fetchUserById(options.userId)
    }

    console.log('✅ Benefits页面数据初始化完成')

  } catch (error) {
    console.error('Benefits页面 - 异步初始化失败:', error)
    uni.showToast({
      title: "页面初始化失败",
      icon: "none",
      duration: 2000
    })
  } finally {
    userInfoLoading.value = false
    initialLoading.value = false // 关闭初始loading状态
  }
}

// 通过用户ID获取完整用户对象
const fetchUserById = async (userId) => {
  try {
    console.log('通过用户ID获取完整用户对象:', userId)

    // 检查传入的userId是否与当前登录用户ID一致
    const currentUserId = userStore.userInfo?.id
    if (currentUserId && String(currentUserId) === String(userId)) {
      console.log('请求的是当前登录用户的福利信息，直接使用userInfo中的数据')
      // 直接使用当前用户信息，不需要额外请求
      targetUserInfo.value = {
        ...userStore.userInfo,
        id: userId,
        coupons: userStore.userInfo.coupons || [],
        privileges: userStore.userInfo.privileges || []
      }
      return
    }

    // 先检查当前已加载的消费者列表中是否有该用户
    const consumer = userStore.consumers.find(c => String(c.id) === String(userId))
    if (consumer) {
      console.log('从已有消费者列表中找到用户:', consumer)
      targetUserInfo.value = consumer
      return
    }

    // 如果是其他用户ID，才进行API请求
    console.log('需要通过API获取其他用户的福利信息:', userId)

    // 根据项目中API的使用模式，这里使用user_id作为查询参数
    await userStore.fetchConsumers({ user_id: userId })

    // 调用fetchBenefits方法获取该用户的优惠券和特权数据
    console.log('调用fetchBenefits方法获取用户福利数据，用户ID:', userId)
    await userStore.fetchBenefits({ user_id: userId })
    console.log('福利数据获取完成:', userStore.benefits)

    // 从返回的消费者列表中查找特定用户
    const fetchedConsumer = userStore.consumers.find(c => String(c.id) === String(userId))
    if (fetchedConsumer) {
      console.log('成功获取用户对象:', fetchedConsumer)

      // 检查是否有通过fetchBenefits获取的福利数据
      if (userStore.benefits && userStore.benefits.coupons) {
        console.log('检测到有福利数据，合并到用户对象中')
        // 合并福利数据到用户对象
        targetUserInfo.value = {
          ...fetchedConsumer,
          coupons: userStore.benefits.coupons || [],
          privileges: userStore.benefits.privileges || []
        }
      } else {
        // 没有福利数据，直接使用获取到的用户对象
        targetUserInfo.value = fetchedConsumer
      }
    } else {
      console.log('未能找到指定用户ID的用户:', userId)
      // 如果找不到，可以显示一个提示
      uni.showToast({
        title: '未找到该用户的福利信息',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('通过用户ID获取用户对象失败:', error)
    uni.showToast({
      title: '获取用户信息失败',
      icon: 'error'
    })
  }
}

// 页面生命周期 - onShow
onShow(() => {
  console.log('Benefits页面 onShow')

  // 检查登录状态
  if (!checkLoginAndRedirect()) {
    return
  }
  // 设置当前页面的tabBar状态
  tabBarStore.setActiveTab('profile')
  // 页面显示，状态由Pinia自动管理
})
</script>

<style lang="scss">
.container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 确保页面不滚动 */
  position: fixed; /* 固定定位防止页面滚动 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.benefits-content {
  /* padding通过内联样式动态设置 */
  box-sizing: border-box;
  flex: 1; /* 占满剩余空间 */
  overflow: hidden; /* 防止滚动 */
  display: flex;
  flex-direction: column;
}

// 移除重复样式，优化后的整洁版本
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  z-index: 999;

  .loading-text {
    margin-top: 32rpx;
    font-size: 28rpx;
    color: #64748b;
    font-weight: 500;
  }
}

// 移除下拉刷新相关样式

// 福利页面骨架屏样式
.benefits-skeleton {
  /* padding通过内联样式动态设置 */
  box-sizing: border-box;

  .section-skeleton {
    margin-bottom: 48rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title-skeleton {
      height: 44rpx;
      width: 220rpx;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 6rpx;
      margin-bottom: 24rpx;
    }

    .card-skeleton {
      background-color: #fff;
      border-radius: 16rpx;
      padding: 32rpx;
      margin-bottom: 24rpx;
      box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
      border: 1rpx solid #f0f0f0;

      &:last-child {
        margin-bottom: 0;
      }

      .card-header-skeleton {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24rpx;

        .card-title-skeleton {
          height: 36rpx;
          width: 45%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 6rpx;
        }

        .card-badge-skeleton {
          height: 32rpx;
          width: 88rpx;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 16rpx;
          animation-delay: 0.2s;
        }
      }

      .card-content-skeleton {
        .skeleton-line {
          height: 28rpx;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 6rpx;
          margin-bottom: 16rpx;
          width: 100%;

          &:last-child {
            margin-bottom: 0;
          }

          &.skeleton-line-short {
            width: 65%;
            animation-delay: 0.3s;
          }
        }
      }
    }
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
