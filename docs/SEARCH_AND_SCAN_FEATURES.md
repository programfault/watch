# 消费者页面本地搜索和扫一扫功能

## 功能概述

### 1. 本地搜索功能 🔍
- **实时搜索**: 输入即搜索，无需等待网络请求
- **多字段匹配**: 支持按手机号、姓名、ID搜索
- **状态管理**: 使用 Pinia store 统一管理搜索状态
- **智能过滤**: 自动去除空格，不区分大小写

### 2. 扫一扫功能 📷
- **权限检查**: 自动检查摄像头权限
- **权限引导**: 未授权时引导用户到设置页面
- **扫码搜索**: 扫码结果直接作为搜索关键词
- **错误处理**: 完善的错误处理和用户提示

## 技术实现

### UserStore 状态管理
```javascript
state: {
  consumersSearchKeyword: '', // 搜索关键词
}

getters: {
  // 过滤后的消费者列表
  filteredConsumers: (state) => {
    if (!state.consumersSearchKeyword) {
      return state.consumers
    }

    const keyword = state.consumersSearchKeyword.toLowerCase().trim()
    return state.consumers.filter(consumer => {
      const phone = (consumer.phone || '').toLowerCase()
      const name = (consumer.name || '').toLowerCase()
      const id = (consumer.id || '').toLowerCase()

      return phone.includes(keyword) ||
             name.includes(keyword) ||
             id.includes(keyword)
    })
  }
}

actions: {
  setConsumersSearchKeyword(keyword), // 设置搜索关键词
  clearConsumersSearch(),             // 清除搜索
  resetConsumers()                    // 重置时也清除搜索
}
```

### 页面组件
```vue
<template>
  <!-- 搜索栏 + 扫码按钮 -->
  <view class="search-container">
    <view class="search-bar-wrapper">
      <uni-search-bar v-model="searchKeyword" />
    </view>
    <view class="scan-btn" @click="handleScan">
      <uni-icons type="scan" />
    </view>
  </view>

  <!-- 使用过滤后的消费者列表 -->
  <view v-for="consumer in userStore.filteredConsumers">
    <!-- 消费者项 -->
  </view>
</template>
```

## 功能流程

### 搜索流程
1. **用户输入** → 触发 `onSearchInput`
2. **更新状态** → 调用 `userStore.setConsumersSearchKeyword()`
3. **实时过滤** → `filteredConsumers` getter 自动重新计算
4. **界面更新** → Vue 响应式更新消费者列表

### 扫码流程
1. **点击扫码** → 触发 `handleScan`
2. **权限检查** → `checkCameraAuth()` 检查摄像头权限
3. **请求授权** → 未授权时调用 `uni.authorize()` 或引导设置
4. **打开扫码** → `openScanCode()` 调用 `uni.scanCode()`
5. **处理结果** → 扫码成功后将结果作为搜索关键词

## 权限处理策略

### 摄像头权限状态
- **已授权**: 直接扫码
- **未授权**: 请求授权
- **被拒绝**: 引导到设置页面

### 权限检查代码
```javascript
async checkCameraAuth() {
  const setting = await uni.getSetting()

  if (setting.authSetting['scope.camera'] === false) {
    // 被拒绝 -> 引导设置
    showModal('需要摄像头权限', '请在设置中开启')
  } else if (setting.authSetting['scope.camera'] === undefined) {
    // 未授权 -> 请求授权
    return await uni.authorize({ scope: 'scope.camera' })
  } else {
    // 已授权
    return true
  }
}
```

## 用户体验优化

### 搜索体验
- ✅ 实时搜索，即输即显示结果
- ✅ 清空搜索时自动显示所有数据
- ✅ 搜索无结果时显示友好提示
- ✅ 大小写不敏感，自动去除空格

### 扫码体验
- ✅ 权限引导清晰，操作简单
- ✅ 扫码成功后自动填入搜索框
- ✅ 扫码失败或取消时不影响正常使用
- ✅ 视觉反馈及时，操作状态明确

### 界面布局
- ✅ 搜索框和扫码按钮水平排列
- ✅ 扫码按钮设计为正方形，视觉平衡
- ✅ 响应式设计，适配不同屏幕
- ✅ 按钮按下反馈，提升交互体验

## 错误处理

### 搜索错误
- 搜索关键词格式化（去空格、转小写）
- 防止空搜索导致的性能问题

### 扫码错误
- 权限被拒绝：引导用户设置
- 扫码失败：显示友好提示
- 用户取消：静默处理，不显示错误

## 未来扩展

### 搜索功能
- [ ] 添加搜索历史记录
- [ ] 支持高级筛选（按积分范围、注册时间等）
- [ ] 添加搜索结果排序选项

### 扫码功能
- [ ] 支持多种码格式识别
- [ ] 添加手电筒控制
- [ ] 支持从相册选择二维码图片
