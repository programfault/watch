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
                    <uv-button
                      type="primary"
                      size="small"
                      :custom-style="{ marginRight: '8px' }"
                      @click="handleGift(consumer)"
                    >
                      赠送
                    </uv-button>
                    <uv-button
                      type="warning"
                      size="small"
                      :custom-style="{ marginRight: '8px' }"
                      @click="handleVerification(consumer)"
                    >
                      核销
                    </uv-button>
                    <uv-button
                      type="success"
                      size="small"
                      @click="handleUpdate(consumer)"
                    >
                      更新
                    </uv-button>
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
import { searchConsumers } from "@/api/user.js"
import ConsumerPanel from "@/components/ConsumerPanel.vue"
import CustomTabBar from '@/components/CustomTabBar.vue'
import { useUserStore } from "@/stores"
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

// 更新用户信息操作
const handleUpdate = (consumer) => {
  console.log("更新用户信息操作:", consumer)
  selectedConsumer.value = consumer
  currentActionType.value = 'update'
  // 更新模式下不需要福利数据
  panelCoupons.value = []
  panelPrivileges.value = []
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

<style lang="scss" scoped>
@import './customer.scss';
</style>
