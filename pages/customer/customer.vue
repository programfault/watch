<template>
  <view class="page-wrapper">
    <!-- 固定搜索栏 -->
    <view class="fixed-search">
      <view class="search-container">
        <view class="search-bar-wrapper">
          <uv-search
            @custom="onSearchConfirm"
            placeholder="请输入手机号搜索"
            :focus="false"
            v-model="searchKeyword"
            :show-action="true"
            action-text="搜索"
            @search="onSearchConfirm"
            :auto-search="false"
            :clear-trigger="'click'"
          />
        </view>
      </view>
    </view>

    <!-- 可滚动内容区域 -->
    <scroll-view
      class="scroll-content"
      scroll-y="true"
      @scrolltoupper="onPullDownRefresh"
      refresher-enabled="true"
      :refresher-threshold="80"
      refresher-default-style="none"
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
          <text v-if="pullDistance < 80" class="tip-text">下拉刷新客户</text>
          <text v-else class="tip-text tip-release">松手立即刷新</text>
        </view>
        <view v-else class="refreshing-tips">
          <uv-icon name="loading" size="20" color="#007aff" />
          <text class="tip-text refreshing">正在刷新...</text>
        </view>
      </view>
      <view class="container">
        <!-- 加载状态 -->
        <view class="loading" v-if="userStore.consumersLoading">
          <uni-load-more status="loading" />
        </view>

        <!-- 消费者列表 -->
        <view class="consumers-list" v-else-if="userStore.hasFilteredConsumers">
          <view
            v-for="consumer in userStore.filteredConsumers"
            :key="consumer.id"
            class="consumer-item-wrapper"
          >
            <view class="consumer-item">
                  <!-- 上半部分：头像、信息、徽章 -->
                  <view class="consumer-main">
                    <view class="consumer-avatar">
                      <view class="avatar-circle" :class="{ 'avatar-female': consumer.gender === 2 }">
                        <text class="avatar-text">{{ getAvatarText(consumer) }}</text>
                      </view>
                    </view>
                    <view class="consumer-content">
                      <view class="consumer-header">
                        <view class="consumer-info">
                          <text class="consumer-phone">{{ consumer.phone }}</text>
                          <view class="consumer-card" v-if="consumer.card_number">
                            <text class="card-label">卡号:</text>
                            <text class="card-value">{{ consumer.card_number }}</text>
                          </view>
                          <view class="consumer-points">
                            <text class="points-label">积分:</text>
                            <text class="points-value">{{ consumer.points }}</text>
                          </view>
                        </view>
                        <view class="consumer-badges">
                          <view class="badge-group">
                            <text class="badge-label">券</text>
                            <text class="badge-value error">{{ consumer.coupon_count }}</text>
                          </view>
                          <view class="badge-group">
                            <text class="badge-label">特权</text>
                            <text class="badge-value warning">{{ consumer.privilege_count }}</text>
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                  <!-- 下半部分：操作按钮 -->
                  <view class="consumer-actions">
                    <view class="action-btn gift-btn" @click="handleGift(consumer)">
                      <text class="btn-text">赠送</text>
                    </view>
                    <view class="action-btn verify-btn" @click="handleVerification(consumer)">
                      <text class="btn-text">核销</text>
                    </view>
                  </view>
              </view>
            </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-else-if="!userStore.consumersLoading">
          <text class="empty-text" v-if="userStore.consumersSearchKeyword">暂无匹配的消费者</text>
          <text class="empty-text" v-else>暂无消费者数据</text>
        </view>

        <!-- 由于不支持分页，移除加载更多功能 -->
      </view>
    </scroll-view>

    <!-- 消费者面板 -->
    <ConsumerPanel
      ref="consumerPanel"
      :consumerData="selectedConsumer"
      :actionType="currentActionType"
      :coupons="panelCoupons"
      :privileges="panelPrivileges"
      :userPoints="selectedConsumer?.points || 0"
      :showPoints="true"
      :showCoupons="true"
      :showPrivileges="true"
      @success="handlePanelSuccess"
      @close="handlePanelClose"
    />
    <!-- 底部标签栏组件 -->
		<CustomTabBar />
  </view>
</template>

<script setup>
import ConsumerPanel from "@/components/ConsumerPanel.vue"
import CustomTabBar from '@/components/CustomTabBar.vue'
import { useUserStore } from "@/stores"
import { searchConsumers } from "@/api/user.js"
import { onLoad, onPullDownRefresh, onShow, onUnload } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 定义组件名称
defineOptions({
	name: 'CustomerPage'
})

// 获取 stores
const userStore = useUserStore()

// 响应式数据
const searchKeyword = ref("")
const isRefreshing = ref(false)
const pullDistance = ref(0)
const selectedConsumer = ref(null)
const currentActionType = ref('gift') // 'gift' 或 'verify'
// 面板显示的动态数据，根据操作类型设置不同来源的数据
// 赠送时：使用 userStore.benefitsCoupons (系统可用的福利)
// 核销时：使用 consumer.coupons/privileges (消费者已有的福利)
const panelCoupons = ref([])
const panelPrivileges = ref([])

// 组件引用
const consumerPanel = ref(null)

// 页面生命周期 - onUnload
onUnload(async () => {
  userStore.setConsumersCardNumber('')
})

// 页面生命周期 - onLoad
onLoad(async () => {
  console.log('🚀 页面onLoad开始...')
  try {
    // 获取消费者数据
    await loadData()
    console.log('✅ 页面onLoad完成')
  } catch (error) {
    console.error('❌ 页面onLoad失败:', error)
  }
})

// 页面生命周期 - onShow
onShow(() => {
  console.log('🔍 customer页面 onShow')
  console.log('🔍 当前搜索状态:', {
    searchKeyword: userStore.consumersSearchKeyword,
    cardNumber: userStore.consumersCardNumber
  })
})

// 页面生命周期 - onPullDownRefresh
onPullDownRefresh(() => {
  // 下拉刷新
  refreshData()
})

// 方法定义
// 加载数据
const loadData = async () => {
  try {
    console.log('开始加载消费者数据...')

    // 并行加载消费者数据和福利数据
    await Promise.all([
      userStore.fetchConsumers(),
      userStore.fetchBenefits()
    ])

    console.log('🔍 数据加载完成，当前状态:')
    console.log('- consumers数量:', userStore.consumers.length)
    console.log('- filteredConsumers数量:', userStore.filteredConsumers.length)
    console.log('- hasFilteredConsumers:', userStore.hasFilteredConsumers)
    console.log('- consumersLoading:', userStore.consumersLoading)
    console.log('- searchKeyword:', userStore.consumersSearchKeyword)
    console.log('- consumersCardNumber:', userStore.consumersCardNumber)

  } catch (error) {
    console.error("加载数据失败:", error)
    uni.showModal({
      title: "加载失败",
      content: `错误信息: ${error.message || error}`,
      showCancel: false,
    })
  }
}

// 处理下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true
  try {
    // 重置并刷新所有数据
    userStore.resetConsumers()
    userStore.resetBenefits()
    await Promise.all([
      userStore.fetchConsumers(),
      userStore.fetchBenefits()
    ])
    uni.showToast({
      title: "刷新成功",
      icon: "success",
    })
  } catch (error) {
    console.error("刷新数据失败:", error)
    uni.showToast({
      title: "刷新失败",
      icon: "none",
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

// 刷新数据
const refreshData = async () => {
  try {
    // 重置并刷新所有数据
    userStore.resetConsumers()
    userStore.resetBenefits()
    await Promise.all([
      userStore.fetchConsumers(),
      userStore.fetchBenefits()
    ])
    uni.showToast({
      title: "刷新成功",
      icon: "success",
    })
  } catch (error) {
    console.error("刷新数据失败:", error)
    uni.showToast({
      title: "刷新失败",
      icon: "none",
    })
  } finally {
    // 停止下拉刷新动画
    uni.stopPullDownRefresh()
  }
}

// 赠送操作
const handleGift = (consumer) => {
  console.log("赠送操作:", consumer)
  selectedConsumer.value = consumer
  currentActionType.value = 'gift'
  // 赠送时使用系统可用的福利数据
  panelCoupons.value = userStore.benefitsCoupons || []
  panelPrivileges.value = userStore.benefitsPrivileges || []
  consumerPanel.value.openPanel()
}

// 核销操作
const handleVerification = (consumer) => {
  console.log("核销操作:", consumer)
  selectedConsumer.value = consumer
  currentActionType.value = 'verify'
  // 核销时直接从消费者对象中获取已有的福利数据
  panelCoupons.value = consumer.coupons || []
  panelPrivileges.value = consumer.privileges || []
  consumerPanel.value.openPanel()
}


// 处理面板成功事件
const handlePanelSuccess = async (data) => {
  console.log('操作成功:', data)

  // 刷新数据以获取最新状态
  try {
    await loadData()
  } catch (error) {
    console.error('刷新数据失败:', error)
  }

  // 重置选中的消费者（关闭面板）
  selectedConsumer.value = null
  currentActionType.value = 'gift'
  panelCoupons.value = []
  panelPrivileges.value = []
}

// 处理面板关闭事件
const handlePanelClose = () => {
  console.log('面板关闭')
  // 重置状态
  selectedConsumer.value = null
  currentActionType.value = 'gift'
  panelCoupons.value = []
  panelPrivileges.value = []
}

// 搜索清除事件
const onSearchClear = async () => {
  console.log("搜索清除")
  searchKeyword.value = ""
  
  // 清除搜索后重新加载全部数据
  try {
    userStore.consumersLoading = true
    await userStore.fetchConsumers()
  } catch (error) {
    console.error("重新加载数据失败:", error)
  } finally {
    userStore.consumersLoading = false
  }
}

// 搜索确认事件
const onSearchConfirm = async (e) => {
  const keyword = e.detail?.value || e
  console.log("搜索确认:", keyword)
  searchKeyword.value = keyword
  
  if (!keyword.trim()) {
    // 如果关键词为空，加载全部数据
    try {
      userStore.consumersLoading = true
      await userStore.fetchConsumers()
    } catch (error) {
      console.error("加载数据失败:", error)
    } finally {
      userStore.consumersLoading = false
    }
    return
  }
  
  // 调用新的搜索API
  try {
    userStore.consumersLoading = true
    const response = await searchConsumers({ keyword: keyword.trim() })
    
    // 处理搜索结果
    try {
      // 优先检查是否直接包含users和total字段（API直接返回的数据格式）
      if (response && 'users' in response && 'total' in response) {
        userStore.consumers = response.users || []
        userStore.consumersTotal = response.total || 0
        
        // 如果搜索结果为空，显示提示
        if ((response.users || []).length === 0) {
          uni.showToast({
            title: "未找到相关消费者",
            icon: "none"
          })
        }
      }
      // 检查标准响应格式
      else if (response?.code === 200 || response?.success) {
        // 根据响应格式设置消费者数据
        let consumersData = []
        
        if (response?.data?.users) {
          consumersData = response.data.users || []
          userStore.consumersTotal = response.data.total || consumersData.length
        } else if (response?.data) {
          consumersData = response.data || []
          userStore.consumersTotal = consumersData.length
        } else if (Array.isArray(response)) {
          consumersData = response
          userStore.consumersTotal = consumersData.length
        }
        
        // 直接设置搜索结果到消费者列表
        userStore.consumers = consumersData
        
        // 如果搜索结果为空，显示提示
        if (consumersData.length === 0) {
          uni.showToast({
            title: "未找到相关消费者",
            icon: "none"
          })
        }
      } else {
        console.error("搜索失败:", response?.message || "未知错误")
        uni.showToast({
          title: response?.message || "搜索失败",
          icon: "none"
        })
      }
    } catch (error) {
      console.error("处理搜索结果时出错:", error)
      uni.showToast({
        title: "处理搜索结果时出错",
        icon: "none"
      })
    }
  } catch (error) {
    console.error("搜索异常:", error)
    uni.showToast({
      title: "网络异常，搜索失败",
      icon: "none"
    })
  } finally {
    userStore.consumersLoading = false
  }
}



// 获取头像文本
const getAvatarText = (consumer) => {
  if (consumer?.name?.trim()) {
    // 如果有姓名，取第一个字符
    return consumer.name.charAt(0).toUpperCase()
  } else {
    // 如果姓名为空，显示"匿"
    return "匿"
  }
}
</script>

<style lang="scss">
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
  box-sizing: border-box;
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
        color: #007aff;
        font-weight: 600;
      }

      &.refreshing {
        color: #007aff;
        font-weight: 500;
      }
    }

    .icon-rotate {
      transform: rotate(180deg);
      transition: transform 0.3s ease;
    }
  }
}

.fixed-search {
  position: fixed;
  top: env(safe-area-inset-top);
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #fff;
  padding: 10px 16px 8px;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .search-container {
    display: flex;
    align-items: center;
    gap: 12px;

    .search-bar-wrapper {
      flex: 1;
    }

    .scan-btn {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.95);
        background-color: #e9ecef;
      }
    }
  }
}

.scroll-content {
  flex: 1;
  padding-top: calc(80px + env(safe-area-inset-top)); /* 给固定搜索栏和安全区域留出空间 */
  padding-bottom: calc(50px + env(safe-area-inset-bottom)); /* 给tabbar留出空间 */
  box-sizing: border-box;
}

.container {
  padding: 0;
  min-height: calc(100vh - env(safe-area-inset-top) - 50px - env(safe-area-inset-bottom) - 110px);
  box-sizing: border-box;
}

.loading {
  text-align: center;
  padding: 40px 0;
}

.consumers-list {
  padding: 0 12px;

  // 移除uni-list-item的默认样式
  ::v-deep .custom-list-item {
    .uni-list-item {
      background: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;

      .uni-list-item__container {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
      }
    }
  }

  .consumer-item {
    display: flex;
    flex-direction: column;
    background: #fff;
    margin: 0 0 12px 0;
    border-radius: 12px;
    padding: 16px 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #f5f5f5;
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.98);
      background: #fafafa;
    }

    .consumer-avatar {
      margin-right: 16px;

      .avatar-circle {
        width: 44px;
        height: 44px;
        border-radius: 22px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;

        &.avatar-female {
          background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%);
        }

        .avatar-text {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
        }
      }
    }

    .consumer-main {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .consumer-content {
      flex: 1;

      .consumer-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .consumer-info {
          flex: 1;

          .consumer-phone {
            font-size: 14px;
            font-weight: 500;
            color: #666;
            letter-spacing: 0.3px;
            display: block;
            margin-bottom: 4px;
          }

          .consumer-card {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-bottom: 2px;

            .card-label {
              font-size: 12px;
              color: #999;
            }

            .card-value {
              font-size: 12px;
              font-weight: 600;
              color: #999;
            }
          }

          .consumer-points {
            display: flex;
            align-items: center;
            gap: 4px;

            .points-label {
              font-size: 12px;
              color: #999;
            }

            .points-value {
              font-size: 12px;
              font-weight: 600;
              color: #52c41a;
            }
          }
        }

        .consumer-badges {
          display: flex;
          gap: 12px;
          margin-top: 2px;

          .badge-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 36px;

            .badge-label {
              font-size: 10px;
              color: #999;
              margin-bottom: 2px;
              line-height: 1;
            }

            .badge-value {
              font-size: 14px;
              font-weight: 600;
              padding: 3px 8px;
              border-radius: 8px;
              color: #fff;
              min-width: 24px;
              text-align: center;
              line-height: 1.2;

              &.success {
                background: #52c41a;
              }

              &.error {
                background: #ff4d4f;
              }

              &.warning {
                background: #faad14;
              }
            }
          }
        }
      }
    }

    .consumer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 12px;
      margin-top: 8px;
      border-top: 1px solid #f0f0f0;

      .action-btn {
        padding: 8px 16px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 56px;
        text-align: center;

        .btn-text {
          color: #fff;
          font-size: 12px;
          font-weight: 500;
        }

        &:active {
          transform: scale(0.95);
          opacity: 0.8;
        }

        &.gift-btn {
          background: linear-gradient(135deg, #007aff 0%, #0056d3 100%);
        }

        &.verify-btn {
          background: linear-gradient(135deg, #ff9500 0%, #e6850e 100%);
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;

  .empty-text {
    display: block;
    font-size: 16px;
    color: #999;
    margin-bottom: 20px;
  }

  .empty-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
}
</style>
