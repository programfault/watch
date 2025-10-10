<template>
  <view class="container">
    <!-- 加载状态 - 骨架屏 -->
    <view v-if="initialLoading || userInfoLoading" class="benefits-skeleton">
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

    <!-- 内容区域（支持下拉刷新） -->
    <scroll-view
      class="benefits-scroll"
      scroll-y="true"
      enable-back-to-top="true"
      refresher-enabled="true"
      :refresher-threshold="100"
      refresher-default-style="none"
      refresher-background="#f5f5f5"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @refresherpulling="onRefresherPulling"
      @refresherrestore="onRefreshRestore"
    >
      <!-- 自定义下拉刷新内容 -->
      <view slot="refresher" class="custom-refresher">
        <view v-if="!isRefreshing" class="pull-tips">
          <uv-icon
            name="arrow-down"
            size="20"
            color="#999"
            :class="{ 'icon-rotate': pullDistance >= 80 }"
          />
          <text v-if="pullDistance < 80" class="tip-text">下拉刷新福利</text>
          <text v-else class="tip-text tip-release">松手立即刷新</text>
        </view>
        <view v-else class="refreshing-tips">
          <ui-icon name="loading" size="20" />
          <text class="tip-text refreshing">正在刷新...</text>
        </view>
      </view>

      <view class="benefits-content" v-if="!initialLoading && !userInfoLoading">

        <!-- 优惠券列表 -->
        <CouponList :coupons="coupons" />

        <!-- 特权列表 -->
        <PrivilegeList :privileges="privileges" />
      </view>
    </scroll-view>

    <!-- 底部标签栏组件 -->
    <CustomTabBar />
  </view>
</template>

<script setup>
import CouponList from '@/components/CouponList.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import PrivilegeList from '@/components/PrivilegeList.vue'
import { useTabBarStore, useUserStore } from '@/stores'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, nextTick, ref } from 'vue'

// 定义组件名称
defineOptions({
  name: 'BenefitsPage'
})

// 获取 stores
const userStore = useUserStore()
const tabBarStore = useTabBarStore()

// 响应式数据
const userInfoLoading = ref(false)
const initialLoading = ref(true) // 初始加载状态，防止白屏
const isRefreshing = ref(false)
const pullDistance = ref(0)
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

// 下拉刷新
const onRefresh = async () => {
  console.log('Benefits页面 - 开始下拉刷新')
  isRefreshing.value = true

  try {
    if (!userStore.isLoggedIn) {
      // 未登录状态，跳转到登录页面
      console.log('未登录，跳转到登录页面')
      // 等待一下让用户看到动画
      await new Promise(resolve => setTimeout(resolve, 800))
      uni.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    console.log('已登录状态，刷新用户信息')
    // 已登录状态，刷新用户信息（包含优惠券和特权）
    await userStore.fetchUserInfo()
    if(userStore.userInfo.status === 1){
      tabBarStore.setUserType('admin')
    } else {
      tabBarStore.setUserType('normal')
    }
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('Benefits页面 - 刷新失败:', error)
    uni.showToast({
      title: '刷新失败',
      icon: 'error'
    })
  } finally {
    isRefreshing.value = false
    pullDistance.value = 0
  }
}

// 下拉距离监听
const onRefresherPulling = (e) => {
  pullDistance.value = e.detail.deltaY || 0
}

// 刷新状态恢复
const onRefreshRestore = () => {
  isRefreshing.value = false
  pullDistance.value = 0
}
</script>

<style lang="scss">
.container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.benefits-scroll {
  flex: 1;
  width: 100%;
}

.benefits-content {
  padding: 0 20rpx 80px;
}

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
  background-color: #fff;
  z-index: 999;
}

.loading-text {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #999;
}

// 自定义下拉刷新样式
.custom-refresher {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 100%;
  position: relative;

  .pull-tips, .refreshing-tips {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .tip-text {
      font-size: 14px;
      color: #999;
      transition: color 0.3s ease;

      &.tip-release {
        font-weight: 600;
      }
      &.refreshing {
        font-weight: 500;
      }
    }

    .icon-rotate {
      transform: rotate(180deg);
      transition: transform 0.3s ease;
    }
  }
}



.pull-icon-container,
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8rpx;
}

.loading-container {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.tip-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-top: 0;
  padding: 0;
}

.tip-release {
  color: #07c160;
  font-weight: 500;
}

.refreshing {
  color: #07c160;
}

.icon-rotate {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.user-info-header {
  background-color: #fff;
  padding: 30rpx 30rpx 20rpx;
  border-bottom: 1rpx solid #eee;
}

.user-name-section {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.name-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.vip-badge {
  margin-left: 12rpx;
  padding: 2rpx 12rpx;
  background-color: #ff6b35;
  color: #fff;
  font-size: 20rpx;
  border-radius: 10rpx;
}

.user-stats {
  display: flex;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 4rpx;
}

.stat-value.gold {
  color: #ff6b35;
}

.stat-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.stat-divider {
  width: 2rpx;
  height: 40rpx;
  background-color: #eee;
  margin: 0 30rpx;
}

.not-login-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.not-login-icon {
  margin-bottom: 20rpx;
}

.not-login-tip {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.login-btn {
  background-color: #007aff;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  padding: 20rpx 40rpx;
  line-height: 1.4;
}

// 福利页面骨架屏样式
.benefits-skeleton {
  padding: 20rpx;

  .section-skeleton {
    margin-bottom: 40rpx;

    .section-title-skeleton {
      height: 40rpx;
      width: 200rpx;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 4rpx;
      margin-bottom: 20rpx;
    }

    .card-skeleton {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 30rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

      .card-header-skeleton {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;

        .card-title-skeleton {
          height: 32rpx;
          width: 40%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 4rpx;
        }

        .card-badge-skeleton {
          height: 28rpx;
          width: 80rpx;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 14rpx;
          animation-delay: 0.2s;
        }
      }

      .card-content-skeleton {
        .skeleton-line {
          height: 24rpx;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 4rpx;
          margin-bottom: 12rpx;
          width: 100%;

          &:last-child {
            margin-bottom: 0;
          }

          &.skeleton-line-short {
            width: 60%;
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
