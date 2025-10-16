<template>
  <view class="floating-service-button">
    <button
      open-type="contact"
      session-from="weapp"
      class="service-btn"
    >
      <up-icon
        name="server-man"
        size="28"
        color="#fff"
      />
    </button>
  </view>
</template>

<script setup>
// 定义组件名称
defineOptions({
  name: 'FloatingServiceButton'
})
</script>

<style lang="scss" scoped>
.floating-service-button {
  position: fixed;
  bottom: 200rpx;
  right: 30rpx;
  width: 80rpx;
  height: 80rpx;
  background-color: #e85a4f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  box-shadow: 0 6rpx 20rpx rgba(232, 90, 79, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 15rpx rgba(232, 90, 79, 0.4);
  }
}

.service-btn {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  -webkit-tap-highlight-color: transparent;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 0;
  font-size: 0;
  line-height: 0;
  text-align: center;
}

.service-btn::after {
  border: none !important;
}
</style>
