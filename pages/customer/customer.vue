<template>
  <view class="page-wrapper">
    <!-- 固定搜索栏 -->
    <view class="fixed-search">
      <view class="search-container">
        <view class="search-bar-wrapper">
          <uni-search-bar
            @input="onSearchInput"
            @clear="onSearchClear"
            @confirm="onSearchConfirm"
            placeholder="请输入手机号搜索"
            :focus="false"
            v-model="searchKeyword"
            cancelButton="none"
          />
        </view>
        <view class="scan-btn" @click="handleScan">
          <uni-icons type="scan" size="24" color="#007aff"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 可滚动内容区域 -->
    <scroll-view
      class="scroll-content"
      scroll-y="true"
      @scrolltoupper="onPullDownRefresh"
      refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
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

<script>
import CustomTabBar from '@/components/CustomTabBar.vue'
import ConsumerPanel from "@/components/ConsumerPanel.vue";
import { useUserStore } from "@/stores";
import ScanUtils from "@/utils/scanUtils.js";

export default {
  components: {
    ConsumerPanel,
    CustomTabBar
  },
  setup() {
    const userStore = useUserStore();
    return {
      userStore,
    };
  },
  data() {
    return {
      searchKeyword: "",
      searchCard: "",
      isRefreshing: false,
      selectedConsumer: null,
      currentActionType: 'gift', // 'gift' 或 'verify'
      // 面板显示的动态数据，根据操作类型设置不同来源的数据
      // 赠送时：使用 userStore.benefitsCoupons (系统可用的福利)
      // 核销时：使用 consumer.coupons/privileges (消费者已有的福利)
      panelCoupons: [],
      panelPrivileges: [],
    };
  },
  async onUnload(){
    this.userStore.setConsumersCardNumber = ''
  },
  async onLoad() {
    console.log('🚀 页面onLoad开始...');
    try {
      // 获取消费者数据
      await this.loadData();
      console.log('✅ 页面onLoad完成');
    } catch (error) {
      console.error('❌ 页面onLoad失败:', error);
    }
  },
  onShow() {
    console.log('🔍 customer页面 onShow');
    console.log('🔍 当前搜索状态:', {
      searchKeyword: this.userStore.consumersSearchKeyword,
      cardNumber: this.userStore.consumersCardNumber
    });
  },
  onPullDownRefresh() {
    // 下拉刷新
    this.refreshData();
  },
  // 移除触底加载更多，因为不支持分页
  // onReachBottom() {
  // 	if (this.userStore.consumersHasMore && !this.userStore.consumersLoading) {
  // 		this.loadMore()
  // 	}
  // },
  methods: {
    // 加载数据
    async loadData() {
      try {
        console.log('开始加载消费者数据...');

        // 并行加载消费者数据和福利数据
        await Promise.all([
          this.userStore.fetchConsumers(),
          this.userStore.fetchBenefits()
        ]);

        console.log('🔍 数据加载完成，当前状态:');
        console.log('- consumers数量:', this.userStore.consumers.length);
        console.log('- filteredConsumers数量:', this.userStore.filteredConsumers.length);
        console.log('- hasFilteredConsumers:', this.userStore.hasFilteredConsumers);
        console.log('- consumersLoading:', this.userStore.consumersLoading);
        console.log('- searchKeyword:', this.userStore.consumersSearchKeyword);
        console.log('- consumersCardNumber:', this.userStore.consumersCardNumber);

      } catch (error) {
        console.error("加载数据失败:", error);
        uni.showModal({
          title: "加载失败",
          content: `错误信息: ${error.message || error}`,
          showCancel: false,
        });
      }
    },

    // 处理下拉刷新
    async onRefresh() {
      this.isRefreshing = true;
      try {
        // 重置并刷新所有数据
        this.userStore.resetConsumers();
        this.userStore.resetBenefits();
        await Promise.all([
          this.userStore.fetchConsumers(),
          this.userStore.fetchBenefits()
        ]);
        uni.showToast({
          title: "刷新成功",
          icon: "success",
        });
      } catch (error) {
        console.error("刷新数据失败:", error);
        uni.showToast({
          title: "刷新失败",
          icon: "none",
        });
      } finally {
        this.isRefreshing = false;
      }
    },

    // 刷新数据
    async refreshData() {
      try {
        // 重置并刷新所有数据
        this.userStore.resetConsumers();
        this.userStore.resetBenefits();
        await Promise.all([
          this.userStore.fetchConsumers(),
          this.userStore.fetchBenefits()
        ]);
        uni.showToast({
          title: "刷新成功",
          icon: "success",
        });
      } catch (error) {
        console.error("刷新数据失败:", error);
        uni.showToast({
          title: "刷新失败",
          icon: "none",
        });
      } finally {
        // 停止下拉刷新动画
        uni.stopPullDownRefresh();
      }
    },


    // 赠送操作
    handleGift(consumer) {
      console.log("赠送操作:", consumer);
      this.selectedConsumer = consumer;
      this.currentActionType = 'gift';
      // 赠送时使用系统可用的福利数据
      this.panelCoupons = this.userStore.benefitsCoupons || [];
      this.panelPrivileges = this.userStore.benefitsPrivileges || [];
      this.$refs.consumerPanel.openPanel();
    },

    // 核销操作
    handleVerification(consumer) {
      console.log("核销操作:", consumer);
      this.selectedConsumer = consumer;
      this.currentActionType = 'verify';
      // 核销时直接从消费者对象中获取已有的福利数据
      this.panelCoupons = consumer.coupons || [];
      this.panelPrivileges = consumer.privileges || [];
      this.$refs.consumerPanel.openPanel();
    },



    // 处理面板成功事件
    async handlePanelSuccess(data) {
      console.log('操作成功:', data);

      // 刷新数据以获取最新状态
      try {
        await this.loadData();
      } catch (error) {
        console.error('刷新数据失败:', error);
      }

      // 重置选中的消费者（关闭面板）
      this.selectedConsumer = null;
      this.currentActionType = 'gift';
      this.panelCoupons = [];
      this.panelPrivileges = [];
    },

    // 处理面板关闭事件
    handlePanelClose() {
      console.log('面板关闭');
      // 重置状态
      this.selectedConsumer = null;
      this.currentActionType = 'gift';
      this.panelCoupons = [];
      this.panelPrivileges = [];
    },

    // 搜索输入事件（本地实时搜索）
    onSearchInput(e) {
      const keyword = e.detail?.value || e;
      console.log("搜索输入:", keyword);
      this.searchKeyword = keyword;
      this.userStore.setConsumersSearchKeyword(keyword);
    },

    // 搜索清除事件
    onSearchClear() {
      console.log("搜索清除");
      this.searchKeyword = "";
      this.userStore.clearConsumersSearch();
    },

    // 搜索确认事件
    onSearchConfirm(e) {
      const keyword = e.detail?.value || e;
      console.log("搜索确认:", keyword);
      this.searchKeyword = keyword;
      this.userStore.setConsumersSearchKeyword(keyword);
    },

    // 扫一扫功能
    async handleScan() {
      console.log('点击扫一扫');

      try {
        // 使用通用扫码工具
        const scanResult = await ScanUtils.quickScan();
        if (scanResult) {
          console.log('🔍 customer页面扫码结果:', scanResult);
          this.searchCard = scanResult;

          // 先清除之前的搜索条件
          this.userStore.clearConsumersSearch();

          // 设置卡号搜索
          this.userStore.setConsumersCardNumber(scanResult);
        }
      } catch (error) {
        console.error('扫码失败:', error);
      }
    },

    // 获取头像文本
    getAvatarText(consumer) {
      if (consumer?.name?.trim()) {
        // 如果有姓名，取第一个字符
        return consumer.name.charAt(0).toUpperCase();
      } else {
        // 如果姓名为空，显示"匿"
        return "匿";
      }
    },
  },
};
</script>

<style lang="scss">
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
}

.fixed-search {
  position: fixed;
  top: 0;
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
  padding-top: 80px; /* 给固定搜索栏留出空间 */
}

.container {
  padding: 0;
  min-height: calc(100vh - 110px);
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
