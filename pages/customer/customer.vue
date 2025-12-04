<template>
  <view class="page-wrapper">
    <!-- 固定搜索栏 -->
    <view class="fixed-search">
      <view class="search-container">
        <view class="search-bar-wrapper">
          <up-search
            ref="searchInput"
            @custom="onSearchAction"
            @search="onSearchConfirm"
            placeholder="请输入手机号搜索"
            :focus="false"
            v-model="searchKeyword"
            :show-action="showSearchHistory"
            :action-text="showSearchHistory ? '取消' : '搜索'"
            @clear="onSearchClear"
            :auto-search="false"
            :clear-trigger="'click'"
            @focus="handleSearchFocus"
            @click="handleSearchClick"
          />
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-area">
      <view class="container">
        <!-- 搜索历史面板 -->
        <view class="search-history-section" v-if="showSearchHistory">
          <view class="history-header">
            <text class="history-title">搜索历史</text>
            <text class="clear-btn" v-if="searchHistory.length > 0" @click="clearSearchHistory">清空</text>
          </view>
          <view class="history-list" v-if="searchHistory.length > 0">
            <view
              v-for="(item, index) in searchHistory"
              :key="index"
              class="history-item"
              @click="fillSearchFromHistory(item)"
            >
              <text class="history-text">{{ item }}</text>
            </view>
          </view>
          <view class="history-empty" v-else>
            <text class="empty-text">暂无搜索历史</text>
          </view>
        </view>

        <!-- 搜索提示状态 -->
        <view class="search-hint" v-else-if="!hasSearched && !userStore.consumersLoading">
          <view class="hint-icon">
            <up-icon name="search" size="48" color="#ccc"/>
          </view>
          <text class="hint-text">请输入手机号进行搜索</text>
          <text class="hint-subtext">支持精确匹配手机号码</text>
        </view>

        <!-- 加载状态 - 骨架屏 -->
        <view class="skeleton-wrapper" v-else-if="!showSearchHistory && userStore.consumersLoading">
          <view class="skeleton-item" v-for="i in 1" :key="i">
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
        <view class="consumers-list" v-else-if="!showSearchHistory && userStore.hasFilteredConsumers">
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
                    <up-button
                      type="primary"
                      size="small"
                      :custom-style="{ marginRight: '8px' }"
                      @click="handleGift(consumer)"
                    >
                      赠送
                    </up-button>
                    <up-button
                      type="warning"
                      size="small"
                      :custom-style="{ marginRight: '8px' }"
                      @click="handleVerification(consumer)"
                    >
                      核销
                    </up-button>
                    <up-button
                      type="success"
                      size="small"
                      @click="handleUpdate(consumer)"
                    >
                      更新
                    </up-button>
                  </view>
              </view>
            </view>
        </view>

        <!-- 搜索无结果状态 -->
        <view class="empty-state" v-else-if="!showSearchHistory && hasSearched && !userStore.consumersLoading">
          <view class="empty-icon">
            <up-icon name="search" size="48" color="#ccc"/>
          </view>
          <text class="empty-text">未找到匹配的消费者</text>
          <text class="empty-subtext">请尝试其他手机号码</text>
        </view>

        <!-- 由于不支持分页，移除加载更多功能 -->
      </view>
    </view>

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
		<CustomTabBar v-show="true" />
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

// 搜索历史相关
const searchHistory = ref([])
const showSearchHistory = ref(false)
const SEARCH_HISTORY_KEY = 'customer_search_history'
const MAX_HISTORY_COUNT = 10

// 组件引用
const consumerPanel = ref(null)
const searchInput = ref(null)

// 页面生命周期 - onUnload
onUnload(async () => {
  userStore.setConsumersCardNumber('')
})

// 页面生命周期 - onLoad
onLoad(() => {
  console.log('🚀 Customer页面 onLoad')

  // 重置所有状态到初始状态
  searchKeyword.value = ""
  hasSearched.value = false
  selectedConsumer.value = null
  currentActionType.value = 'gift'
  panelCoupons.value = []
  panelPrivileges.value = []

  // 重置消费者列表和搜索状态
  userStore.resetConsumers()
  userStore.clearConsumersSearch()

  // 异步加载福利数据（用于后续的赠送操作）
  loadBenefitsAsync()

  // 加载搜索历史
  loadSearchHistory()

  console.log('✅ Customer页面初始化完成')
})

// 页面生命周期 - onShow
onShow(() => {
  console.log('🔍 customer页面 onShow')
  console.log('🔍 恢复页面到初始状态')

  // 重置所有搜索相关的状态
  searchKeyword.value = ""
  hasSearched.value = false

  // 重置选中的消费者和面板状态
  selectedConsumer.value = null
  currentActionType.value = 'gift'
  panelCoupons.value = []
  panelPrivileges.value = []

  // 重置消费者列表和store中的搜索状态
  userStore.resetConsumers()
  userStore.clearConsumersSearch() // 使用store的清除搜索方法

  // 确保页面滚动位置重置到顶部，并清空搜索框
  nextTick(() => {
    // 重置页面滚动位置
    uni.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })

    // 手动清空搜索框（如果组件支持清空方法）
    if (searchInput.value && typeof searchInput.value.clear === 'function') {
      searchInput.value.clear()
    }
  })

  console.log('✅ 页面状态已重置到初始状态')
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

  // 隐藏搜索历史面板
  showSearchHistory.value = false

  // 保存到搜索历史
  saveToSearchHistory(keyword.trim())

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
  showSearchHistory.value = false

  // 重置消费者列表和搜索状态
  userStore.resetConsumers()
  userStore.clearConsumersSearch()

  console.log("✅ 搜索状态已清除")
}

// 搜索操作事件（点击搜索/取消按钮时触发）
const onSearchAction = async (e) => {
  // 如果当前显示搜索历史,点击取消按钮
  if (showSearchHistory.value) {
    console.log('点击取消按钮,隐藏搜索历史')
    showSearchHistory.value = false
    return
  }

  // 否则是点击搜索按钮,执行搜索
  const keyword = searchKeyword.value?.trim() || ''
  console.log("点击搜索按钮，搜索关键词:", keyword)

  if (!keyword) {
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

// 搜索确认事件（按回车键或点击键盘确认按钮时触发）
const onSearchConfirm = async (e) => {
  const keyword = searchKeyword.value?.trim() || ''
  console.log("键盘确认搜索，搜索关键词:", keyword)

  if (!keyword) {
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

// ==================== 搜索历史相关方法 ====================

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = uni.getStorageSync(SEARCH_HISTORY_KEY)
    if (history && Array.isArray(history)) {
      searchHistory.value = history
      console.log('✅ 搜索历史加载成功:', history)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 保存到搜索历史
const saveToSearchHistory = (keyword) => {
  if (!keyword || !keyword.trim()) return

  const trimmedKeyword = keyword.trim()

  // 移除重复项（如果已存在，移到最前面）
  const newHistory = [trimmedKeyword, ...searchHistory.value.filter(item => item !== trimmedKeyword)]

  // 限制历史记录数量
  if (newHistory.length > MAX_HISTORY_COUNT) {
    newHistory.length = MAX_HISTORY_COUNT
  }

  searchHistory.value = newHistory

  // 保存到本地存储
  try {
    uni.setStorageSync(SEARCH_HISTORY_KEY, newHistory)
    console.log('✅ 搜索历史已保存:', newHistory)
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

// 处理搜索框点击
const handleSearchClick = () => {
  console.log('🔍 搜索框被点击')
  showSearchHistory.value = true
}

// 处理搜索框聚焦
const handleSearchFocus = () => {
  console.log('🔍 搜索框获得焦点')
  showSearchHistory.value = true
}

// 从历史记录填充搜索框并搜索
const fillSearchFromHistory = (keyword) => {
  searchKeyword.value = keyword
  performSearch(keyword)
}

// 清空搜索历史
const clearSearchHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        searchHistory.value = []
        try {
          uni.removeStorageSync(SEARCH_HISTORY_KEY)
          uni.showToast({
            title: '已清空',
            icon: 'success'
          })
          console.log('✅ 搜索历史已清空')
        } catch (error) {
          console.error('清空搜索历史失败:', error)
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import './customer.scss';
</style>
