<template>
  <view class="page-wrapper">
    <!-- 固定搜索栏 -->
    <view class="fixed-search">
      <uni-search-bar
        @input="onSearchInput"
        @clear="onSearchClear"
        @confirm="onSearchConfirm"
        placeholder="请输入手机号码搜索"
        :focus="false"
        v-model="searchKeyword"
        cancelButton="none"
      />
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
        <view class="consumers-list" v-else-if="userStore.hasConsumers">
          <uni-swipe-action
            v-for="consumer in userStore.consumers"
            :key="consumer.id"
          >
            <uni-swipe-action-item
              :right-options="swipeOptions"
              @click="handleSwipeAction($event, consumer)"
            >
              <view class="consumer-item">
                <view class="consumer-avatar">
                  <view class="avatar-circle" :class="{ 'avatar-female': consumer.gender === 2 }">
                    <text class="avatar-text">{{ getAvatarText(consumer) }}</text>
                  </view>
                </view>
                <view class="consumer-content">
                  <view class="consumer-header">
                    <view class="consumer-info">
                      <text class="consumer-phone">{{ consumer.phone }}</text>
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
                <view class="consumer-arrow">
                  <text class="arrow-icon">›</text>
                </view>
              </view>
            </uni-swipe-action-item>
          </uni-swipe-action>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-else>
          <text class="empty-text">暂无消费者数据</text>
          <view class="empty-buttons">
            <button class="refresh-btn" @click="refreshData">刷新数据</button>
            <button class="test-btn" @click="testAPI">测试API</button>
            <button class="mock-btn" @click="loadMockData">加载测试数据</button>
          </view>
        </view>

        <!-- 由于不支持分页，移除加载更多功能 -->
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { useUserStore } from "@/stores";

export default {
  setup() {
    const userStore = useUserStore();
    return {
      userStore,
    };
  },
  data() {
    return {
      searchKeyword: "",
      isRefreshing: false,
      swipeOptions: [
        {
          text: "赠送",
          style: {
            backgroundColor: "#007aff",
          },
        },
        {
          text: "核销",
          style: {
            backgroundColor: "#ff9500",
          },
        },
      ],
    };
  },
  async onLoad() {
    // 获取消费者数据
    await this.loadData();
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
        console.log("开始加载消费者数据...");
        console.log("当前consumers状态:", this.userStore.consumers);
        console.log(
          "当前consumersLoading状态:",
          this.userStore.consumersLoading
        );
        console.log("当前hasConsumers状态:", this.userStore.hasConsumers);

        const result = await this.userStore.fetchConsumers();
        console.log("fetchConsumers返回结果:", result);
        console.log("加载后consumers状态:", this.userStore.consumers);
        console.log("加载后hasConsumers状态:", this.userStore.hasConsumers);
      } catch (error) {
        console.error("加载消费者数据失败:", error);
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
        this.userStore.resetConsumers();
        await this.userStore.fetchConsumers();
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
        this.userStore.resetConsumers();
        await this.userStore.fetchConsumers();
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

    // 移除加载更多方法，因为不支持分页
    // async loadMore() {
    // 	try {
    // 		await this.userStore.fetchConsumers({}, true)
    // 	} catch (error) {
    // 		console.error('加载更多失败:', error)
    // 		uni.showToast({
    // 			title: '加载更多失败',
    // 			icon: 'none'
    // 		})
    // 	}
    // },

    // 处理滑动操作
    handleSwipeAction(e, consumer) {
      const { index } = e;
      if (index === 0) {
        // 赠送操作
        this.handleGift(consumer);
      } else if (index === 1) {
        // 核销操作
        this.handleVerification(consumer);
      }
    },

    // 赠送操作（暂时为空）
    handleGift(consumer) {
      console.log("赠送操作:", consumer);
      // TODO: 实现赠送逻辑
    },

    // 核销操作（暂时为空）
    handleVerification(consumer) {
      console.log("核销操作:", consumer);
      // TODO: 实现核销逻辑
    },

    // 搜索输入事件（暂时为空）
    onSearchInput(e) {
      console.log("搜索输入:", e);
      // TODO: 实现搜索逻辑
    },

    // 搜索清除事件（暂时为空）
    onSearchClear() {
      console.log("搜索清除");
      this.searchKeyword = "";
      // TODO: 重置搜索结果
    },

    // 搜索确认事件（暂时为空）
    onSearchConfirm(e) {
      console.log("搜索确认:", e);
      // TODO: 执行搜索
    },

    // 测试API调用
    async testAPI() {
      try {
        console.log("开始测试API调用...");
        // 直接调用API函数
        const { getConsumers } = await import("@/api");
        const result = await getConsumers();
        console.log("直接API调用结果:", result);

        uni.showModal({
          title: "API测试结果",
          content: JSON.stringify(result, null, 2),
          showCancel: false,
        });
      } catch (error) {
        console.error("API测试失败:", error);
        uni.showModal({
          title: "API测试失败",
          content: `错误: ${error.message || error}`,
          showCancel: false,
        });
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

    // 加载模拟数据（用于测试界面）
    async loadMockData() {
      const mockData = {
        code: 200,
        message: "success",
        data: {
          users: [
            {
              id: 1,
              name: "张三",
              phone: "130****9901",
              birthday: "1982-02-20",
              gender: 1,
              points: 150,
              coupon_count: 3,
              privilege_count: 2,
            },
            {
              id: 2,
              name: "李美",
              phone: "138****8888",
              birthday: "1990-05-15",
              gender: 2,
              points: 80,
              coupon_count: 1,
              privilege_count: 1,
            },
            {
              id: 3,
              name: "",
              phone: "139****7777",
              birthday: "1985-03-10",
              gender: 1,
              points: 200,
              coupon_count: 2,
              privilege_count: 3,
            },
          ],
          total: 3,
        },
      };

      // 直接设置到store中
      this.userStore.consumers = mockData.data.users;
      this.userStore.consumersTotal = mockData.data.total;
      this.userStore.consumersHasMore = false;

      uni.showToast({
        title: "模拟数据已加载",
        icon: "success",
      });
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

  .color-indicators {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 8px;
    padding: 6px 0;

    .indicator-item {
      display: flex;
      align-items: center;
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

  .consumer-item {
    display: flex;
    align-items: center;
    background: #fff;
    margin-bottom: 8px;
    border-radius: 12px;
    padding: 18px 20px;
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

    .consumer-arrow {
      margin-left: 12px;

      .arrow-icon {
        font-size: 20px;
        color: #d9d9d9;
        font-weight: 300;
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

  .refresh-btn {
    background: #007aff;
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 10px 20px;
    font-size: 14px;
    width: 120px;
  }

  .test-btn {
    background: #ff9500;
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 10px 20px;
    font-size: 14px;
    width: 120px;
  }

  .mock-btn {
    background: #34c759;
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 10px 20px;
    font-size: 14px;
    width: 120px;
  }
}

// 滑动操作按钮样式由uni-swipe-action组件自动处理
</style>
