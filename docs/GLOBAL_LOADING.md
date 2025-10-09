## 全局Loading系统

### 功能说明
为解决tab切换时的生硬体验，实现了一个全局Loading系统。

### 文件结构
```
components/
  GlobalLoading.vue          # 全局Loading组件
stores/
  loading.js                 # Loading状态管理
utils/
  loadingUtils.js           # Loading工具函数
```

### 使用方式

#### 1. Tab切换Loading
在TabBar组件中，切换tab时会自动显示loading：
```javascript
// CustomTabBar.vue
const handleTabChange = (name) => {
  if (tabBarStore.activeTab !== name) {
    tabBarStore.switchTabWithLoading(selectedTab.name)
  }
}
```

#### 2. 页面显示时隐藏Loading
在每个tab页面的onShow中调用：
```javascript
import { hideTabSwitchLoading } from '@/utils/loadingUtils.js'

onShow(() => {
  // 其他逻辑...
  hideTabSwitchLoading()
})
```

#### 3. 手动控制Loading
```javascript
import { showPageLoading, hideAllLoading } from '@/utils/loadingUtils.js'

// 显示页面加载loading
await showPageLoading('数据加载')

// 隐藏所有loading
await hideAllLoading()
```

### 已集成的页面
- [x] pages/index/index.vue (首页)
- [x] pages/maintenance/maintenance.vue (保养)
- [x] pages/profile/profile.vue (我的)
- [x] pages/customer/customer.vue (客户)
- [x] pages/rolex/rolex.vue (劳力士)

### Loading类型
- `tab-switch`: Tab切换Loading
- `page-load`: 页面加载Loading
- `default`: 默认Loading

### 样式特性
- 半透明背景遮罩
- 背景模糊效果
- 旋转动画图标
- 渐入动画效果
- 可选进度条显示

### 时间控制
- Tab切换显示: 立即显示
- Tab切换隐藏: 页面onShow后100ms延迟隐藏
- 切换成功后: 600ms延迟隐藏（让用户看到切换效果）
