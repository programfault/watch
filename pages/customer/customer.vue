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
            @clear="onSearchClear"
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
    >
      <view class="container">
        <!-- 搜索提示状态 -->
        <view class="search-hint" v-if="!hasSearched && !userStore.consumersLoading">
          <view class="hint-icon">
            <uv-icon name="search" size="48" color="#ccc"/>
          </view>
          <text class="hint-text">请输入手机号进行搜索</text>
          <text class="hint-subtext">支持精确匹配手机号码</text>
        </view>

        <!-- 加载状态 - 骨架屏 -->
        <view class="skeleton-wrapper" v-else-if="userStore.consumersLoading">
          <view class="skeleton-item" v-for="i in 5" :key="i">
            <view class="skeleton-avatar"></view>
            <view class="skeleton-content">
              <view class="skeleton-line skeleton-line-title"></view>
              <view class="skeleton-line skeleton-line-subtitle"></view>
              <view class="skeleton-line skeleton-line-small"></view>
            </view>
            <view class="skeleton-actions">
              <view class="skeleton-btn" v-for="j in 3" :key="j"></view>
            </view>
          </view>
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

        <!-- 搜索无结果状态 -->
        <view class="empty-state" v-else-if="hasSearched && !userStore.consumersLoading">
          <view class="empty-icon">
            <uv-icon name="inbox" size="48" color="#ccc"/>
          </view>
          <text class="empty-text">未找到匹配的消费者</text>
          <text class="empty-subtext">请尝试其他手机号码</text>
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
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { nextTick, ref } from 'vue'

// 定义组件名称
defineOptions({
	name: 'CustomerPage'
})

// 获取 stores
const userStore = useUserStore()

// 响应式数据
const searchKeyword = ref("")
const hasSearched = ref(false) // 是否已经进行过搜索
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
onLoad(() => {
  console.log('🚀 Customer页面 onLoad')

  // 重置消费者列表和搜索状态
  userStore.resetConsumers()
  hasSearched.value = false

  // 异步加载福利数据（用于后续的赠送操作）
  loadBenefitsAsync()
})

// 页面生命周期 - onShow
onShow(() => {
  console.log('🔍 customer页面 onShow')
  console.log('🔍 当前搜索状态:', {
    searchKeyword: userStore.consumersSearchKeyword,
    cardNumber: userStore.consumersCardNumber
  })
})



// 方法定义
// 异步加载福利数据 - 用于后续的赠送操作
const loadBenefitsAsync = async () => {
  try {
    console.log('开始异步加载福利数据...')
    await userStore.fetchBenefits()
    console.log('✅ 福利数据加载完成')
  } catch (error) {
    console.warn('福利数据加载失败，但不影响搜索功能:', error)
  }
}

// 重新搜索当前关键词（用于操作完成后刷新数据）
const refreshCurrentSearch = async () => {
  if (!searchKeyword.value.trim() || !hasSearched.value) {
    return
  }

  console.log('刷新当前搜索结果:', searchKeyword.value)
  await performSearch(searchKeyword.value.trim())
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

  // 刷新当前搜索结果以获取最新状态
  try {
    await refreshCurrentSearch()
  } catch (error) {
    console.error('刷新搜索结果失败:', error)
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

// 执行搜索的核心方法
const performSearch = async (keyword) => {
  if (!keyword.trim()) {
    return
  }

  console.log("执行搜索:", keyword)

  try {
    userStore.consumersLoading = true
    hasSearched.value = true

    const response = await searchConsumers({ keyword: keyword.trim() })

    // 处理搜索结果
    if (response && 'users' in response && 'total' in response) {
      userStore.consumers = response.users || []
      userStore.consumersTotal = response.total || 0

      if ((response.users || []).length === 0) {
        uni.showToast({
          title: "未找到相关消费者",
          icon: "none"
        })
      }
    } else if (response?.code === 200 || response?.success) {
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

      userStore.consumers = consumersData

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
    console.error("搜索异常:", error)
    uni.showToast({
      title: "网络异常，搜索失败",
      icon: "none"
    })
  } finally {
    userStore.consumersLoading = false
  }
}

// 搜索清除事件
const onSearchClear = () => {
  console.log("搜索清除")
  searchKeyword.value = ""
  hasSearched.value = false

  // 重置消费者列表
  userStore.resetConsumers()
}

// 搜索确认事件（只在点击搜索按钮时触发）
const onSearchConfirm = async (e) => {
  // 使用当前输入框的值，确保是最新的搜索关键词
  const keyword = searchKeyword.value?.trim() || ''
  console.log("点击搜索按钮，搜索关键词:", keyword)

  if (!keyword) {
    // 如果关键词为空，提示用户输入搜索内容
    uni.showToast({
      title: '请输入搜索内容',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 执行搜索
  await performSearch(keyword)
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
