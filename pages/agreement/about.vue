<template>
  <view class="about-container">
    <scroll-view class="content-scroll" scroll-y="true">
      <view class="about-content">
        <!-- 品牌头部 -->
        <view class="brand-header">
          <view class="brand-logo">
            <text class="logo-text">天辰表行</text>
          </view>
          <text class="brand-slogan">专注名表 · 传承经典 · 品质服务</text>
        </view>

        <!-- 公司简介 -->
        <view class="section-card">
          <view class="section-header">
            <view class="header-icon">🏢</view>
            <text class="section-title">关于我们</text>
          </view>
          <view class="section-body">
            <text class="content-text">
              大连天辰表行创立以来，始终秉承"专业、诚信、品质"的经营理念，致力于为顾客提供最优质的名表产品与服务。我们是辽宁地区领先的高端腕表零售商，汇聚了全球30+顶级腕表品牌。
            </text>

          </view>
        </view>

        <!-- 品牌矩阵 -->
        <view class="section-card">
          <view class="section-header">
            <view class="header-icon">⌚</view>
            <text class="section-title">品牌矩阵</text>
          </view>
          <view class="section-body">
            <view class="brand-category">
              <text class="category-title">瑞士顶级品牌</text>
              <view class="brand-tags">
                <text class="brand-tag">欧米茄</text>
                <text class="brand-tag">浪琴</text>
                <text class="brand-tag">宝玑</text>
                <text class="brand-tag">劳力士</text>
                <text class="brand-tag">百达翡丽</text>
              </view>
            </view>
            <view class="brand-category">
              <text class="category-title">代理品牌</text>
              <view class="brand-tags">
                <text class="brand-tag special">西铁城）</text>
                <text class="brand-tag special">ARMANI</text>
                <text class="brand-tag special">Swatch</text>
                <text class="brand-tag special">精工</text>
                <text class="brand-tag special">欧米茄</text>
                <text class="brand-tag special">宝玑</text>
                <text class="brand-tag special">百达翡丽</text>
                <text class="brand-tag special">浪琴</text>
              </view>
            </view>
            <text class="content-text tip">
              汇聚全球30+国际知名腕表品牌，为您提供多元化的选择。
            </text>
          </view>
        </view>

        <!-- 服务优势 -->
        <view class="section-card">
          <view class="section-header">
            <view class="header-icon">✨</view>
            <text class="section-title">服务优势</text>
          </view>
          <view class="section-body">
            <view class="advantage-list">
              <view class="advantage-item">
                <view class="advantage-icon">
                  <text class="icon-text">🛡️</text>
                </view>
                <view class="advantage-content">
                  <text class="advantage-title">正品保障</text>
                  <text class="advantage-desc">所有产品均为品牌官方授权，确保100%正品</text>
                </view>
              </view>

              <view class="advantage-item">
                <view class="advantage-icon">
                  <text class="icon-text">🏪</text>
                </view>
                <view class="advantage-content">
                  <text class="advantage-title">门店覆盖</text>
                  <text class="advantage-desc">辽鲁两省20+线下门店，覆盖核心商圈</text>
                </view>
              </view>

              <view class="advantage-item">
                <view class="advantage-icon">
                  <text class="icon-text">🔧</text>
                </view>
                <view class="advantage-content">
                  <text class="advantage-title">专业维修</text>
                  <text class="advantage-desc">品牌授权维修服务，资深技师团队</text>
                </view>
              </view>

              <view class="advantage-item">
                <view class="advantage-icon">
                  <text class="icon-text">💎</text>
                </view>
                <view class="advantage-content">
                  <text class="advantage-title">一站式服务</text>
                  <text class="advantage-desc">销售、保养、维修、鉴定全方位服务</text>
                </view>
              </view>

              <view class="advantage-item">
                <view class="advantage-icon">
                  <text class="icon-text">👥</text>
                </view>
                <view class="advantage-content">
                  <text class="advantage-title">专业团队</text>
                  <text class="advantage-desc">资深销售顾问，为您提供专业选购建议</text>
                </view>
              </view>

              <view class="advantage-item">
                <view class="advantage-icon">
                  <text class="icon-text">🎁</text>
                </view>
                <view class="advantage-content">
                  <text class="advantage-title">会员权益</text>
                  <text class="advantage-desc">积分、优惠券、专属特权等多重福利</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 企业荣誉 -->
        <view class="section-card">
          <view class="section-header">
            <view class="header-icon">🏆</view>
            <text class="section-title">企业荣誉</text>
          </view>
          <view class="section-body">
            <view class="honor-list">
              <view class="honor-item">
                <text class="honor-dot">•</text>
                <text class="honor-text">西铁城辽宁省独家代理商</text>
              </view>
              <view class="honor-item">
                <text class="honor-dot">•</text>
                <text class="honor-text">ARMANI辽宁省独家代理商</text>
              </view>
              <view class="honor-item">
                <text class="honor-dot">•</text>
                <text class="honor-text">Swatch大连市总代理</text>
              </view>
              <view class="honor-item">
                <text class="honor-dot">•</text>
                <text class="honor-text">精工大连市总代理</text>
              </view>
              <view class="honor-item">
                <text class="honor-dot">•</text>
                <text class="honor-text">多个国际品牌授权维修服务中心</text>
              </view>
              <view class="honor-item">
                <text class="honor-dot">•</text>
                <text class="honor-text">辽宁地区知名高端腕表零售商</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 发展历程 -->
        <view class="section-card">
          <view class="section-header">
            <view class="header-icon">📅</view>
            <text class="section-title">发展历程</text>
          </view>
          <view class="section-body">
            <text class="content-text">
              多年来，天辰表行稳步发展，从最初的单一门店，发展成为拥有20+门店、覆盖辽宁山东两省核心商圈的专业名表零售服务商。我们始终坚持以客户为中心，不断提升服务品质，获得了广大消费者的信赖与支持。
            </text>
            <text class="content-text">
              未来，我们将继续秉承"匠心服务，品质至上"的理念，为更多热爱腕表的朋友提供专业、优质的服务体验。
            </text>
          </view>
        </view>

        <!-- 企业使命与愿景 -->
        <view class="section-card highlight">
          <view class="section-body">
            <view class="mission-item">
              <text class="mission-label">企业使命</text>
              <text class="mission-text">传承时间的艺术，成就品质生活</text>
            </view>
            <view class="divider"></view>
            <view class="mission-item">
              <text class="mission-label">企业愿景</text>
              <text class="mission-text">成为中国北方最具影响力的高端腕表零售服务商</text>
            </view>
            <view class="divider"></view>
            <view class="mission-item">
              <text class="mission-label">核心价值观</text>
              <text class="mission-text">专业 · 诚信 · 品质 · 创新 · 共赢</text>
            </view>
          </view>
        </view>

        <!-- 联系我们 -->
        <view class="section-card">
          <view class="section-header">
            <view class="header-icon">📞</view>
            <text class="section-title">联系我们</text>
          </view>
          <view class="section-body">
            <view class="contact-list">
              <view class="contact-item">
                <text class="contact-label">公司名称</text>
                <text class="contact-value">大连天辰表行有限公司</text>
              </view>
              <view class="contact-item">
                <text class="contact-label">客服热线</text>
                <text class="contact-value highlight-text">0411-82520856</text>
              </view>
              <view class="contact-item">
                <text class="contact-label">服务时间</text>
                <text class="contact-value">周一至周日 9:00-21:00</text>
              </view>
              <view class="contact-item">
                <text class="contact-label">总部地址</text>
                <text class="contact-value">大连市中山区友好路15号友好大厦2010室</text>
              </view>
              <view class="contact-item">
                <text class="contact-label">官方邮箱</text>
                <text class="contact-value">wangli@timepalace.cn</text>
              </view>
            </view>

            <view class="contact-tip">
              <text class="tip-text">💡 如需了解更多信息或寻找离您最近的门店，欢迎通过小程序联系在线客服。</text>
            </view>
          </view>
        </view>

        <!-- 底部版权信息 -->
        <view class="footer-info">
          <text class="footer-text">© 2025 大连天辰表行有限公司</text>
          <text class="footer-text">版权所有 · 保留一切权利</text>
          <text class="footer-text version">v1.0.0</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'

// 定义组件名称
defineOptions({
  name: 'AboutUsPage'
})

// 页面生命周期
onLoad(() => {
  console.log('关于我们页面加载')
})
</script>

<style lang="scss" scoped>
.about-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

.content-scroll {
  height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
}

.about-content {
  padding: 40rpx;
  padding-bottom: 80rpx;
}

// 品牌头部
.brand-header {
  text-align: center;
  padding: 60rpx 0;
  margin-bottom: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

  .brand-logo {
    margin-bottom: 20rpx;

    .logo-text {
      font-size: 56rpx;
      font-weight: bold;
      color: #ffffff;
      letter-spacing: 6rpx;
      text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
    }
  }

  .brand-slogan {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 2rpx;
  }
}

// 通用卡片样式
.section-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

  &.highlight {
    background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .header-icon {
      font-size: 44rpx;
      margin-right: 12rpx;
    }

    .section-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #2c3e50;
    }
  }

  .section-body {
    .content-text {
      display: block;
      font-size: 30rpx;
      color: #495057;
      line-height: 1.8;
      margin-bottom: 24rpx;
      text-align: justify;

      &:last-child {
        margin-bottom: 0;
      }

      &.tip {
        font-size: 28rpx;
        color: #6c757d;
        padding: 20rpx;
        background: #f8f9fa;
        border-radius: 12rpx;
        border-left: 4rpx solid #667eea;
      }
    }
  }
}

// 品牌分类
.brand-category {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .category-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 20rpx;
  }

  .brand-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .brand-tag {
      padding: 16rpx 28rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      font-size: 28rpx;
      border-radius: 50rpx;
      font-weight: 500;

      &.special {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
    }
  }
}

// 服务优势列表
.advantage-list {
  .advantage-item {
    display: flex;
    align-items: flex-start;
    padding: 24rpx;
    margin-bottom: 24rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    transition: all 0.3s ease;

    &:last-child {
      margin-bottom: 0;
    }

    .advantage-icon {
      flex-shrink: 0;
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16rpx;
      margin-right: 20rpx;

      .icon-text {
        font-size: 40rpx;
      }
    }

    .advantage-content {
      flex: 1;

      .advantage-title {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8rpx;
      }

      .advantage-desc {
        display: block;
        font-size: 28rpx;
        color: #6c757d;
        line-height: 1.6;
      }
    }
  }
}

// 荣誉列表
.honor-list {
  .honor-item {
    display: flex;
    align-items: flex-start;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .honor-dot {
      flex-shrink: 0;
      font-size: 32rpx;
      color: #667eea;
      margin-right: 12rpx;
      font-weight: bold;
    }

    .honor-text {
      flex: 1;
      font-size: 30rpx;
      color: #495057;
      line-height: 1.6;
    }
  }
}

// 使命愿景
.mission-item {
  text-align: center;
  padding: 20rpx 0;

  .mission-label {
    display: block;
    font-size: 28rpx;
    color: #6c757d;
    margin-bottom: 12rpx;
    font-weight: 500;
  }

  .mission-text {
    display: block;
    font-size: 32rpx;
    color: #2c3e50;
    font-weight: bold;
    line-height: 1.6;
  }
}

.divider {
  height: 2rpx;
  background: rgba(0, 0, 0, 0.1);
  margin: 20rpx 0;
}

// 联系方式
.contact-list {
  .contact-item {
    display: flex;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .contact-label {
      flex-shrink: 0;
      width: 160rpx;
      font-size: 30rpx;
      color: #6c757d;
      font-weight: 500;
    }

    .contact-value {
      flex: 1;
      font-size: 30rpx;
      color: #2c3e50;
      line-height: 1.6;

      &.highlight-text {
        color: #667eea;
        font-weight: bold;
        font-size: 32rpx;
      }
    }
  }
}

.contact-tip {
  margin-top: 32rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 12rpx;
  border-left: 4rpx solid #667eea;

  .tip-text {
    font-size: 28rpx;
    color: #495057;
    line-height: 1.6;
  }
}

// 底部信息
.footer-info {
  text-align: center;
  padding: 60rpx 40rpx 40rpx;
  margin-top: 40rpx;

  .footer-text {
    display: block;
    font-size: 26rpx;
    color: #adb5bd;
    line-height: 1.8;
    margin-bottom: 8rpx;

    &.version {
      margin-top: 16rpx;
      color: #ced4da;
      font-size: 24rpx;
    }
  }
}
</style>
