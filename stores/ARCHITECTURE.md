# Pinia Store 架构设计

## 整体架构

### 1. **分模块设计** ✅
按功能领域将 Store 分为不同模块：

```
stores/
├── index.js          # Pinia 实例和统一导出
├── search.js         # 搜索功能相关
├── app.js           # 应用全局数据（轮播图、配置等）
├── product.js       # 产品数据管理
└── user.js          # 用户和客户管理
```

### 2. **API 请求封装** ✅
统一的 HTTP 请求处理：

```
utils/
└── request.js       # 通用请求封装

api/
├── index.js         # 统一导出
├── app.js          # 应用相关接口
├── product.js      # 产品相关接口
└── user.js         # 用户相关接口
```

## Store 功能划分

### useAppStore - 应用全局数据
- ✅ **轮播图管理**：获取、缓存轮播图数据
- ✅ **全局状态**：加载状态、网络状态
- ✅ **应用初始化**：统一的初始化流程

### useProductStore - 产品数据管理
- ✅ **产品列表**：分页加载、筛选、排序
- ✅ **产品详情**：单个产品详细信息
- ✅ **产品分类**：分类数据管理
- ✅ **产品搜索**：关键词搜索功能
- ✅ **筛选条件**：价格、品牌、分类筛选

### useUserStore - 用户和客户管理
- ✅ **用户认证**：登录、登出、用户信息
- ✅ **权限管理**：用户权限、角色判断
- ✅ **客户管理**：客户列表、添加、编辑
- ✅ **用户设置**：个人偏好设置
- ✅ **登录状态**：自动检查和恢复登录状态

### useSearchStore - 搜索功能（保持独立）
- ✅ **搜索状态**：关键词、结果、加载状态
- ✅ **搜索历史**：本地存储历史记录
- ✅ **热门搜索**：推荐搜索词
- ✅ **搜索面板**：显示/隐藏控制
- ✅ **跨 Store 协作**：与 ProductStore 联动

## 使用示例

### 1. 在页面中使用多个 Store
```javascript
import { useAppStore, useProductStore, useUserStore } from '@/stores'

export default {
  setup() {
    const appStore = useAppStore()
    const productStore = useProductStore()
    const userStore = useUserStore()

    return {
      appStore,
      productStore,
      userStore
    }
  },

  async onLoad() {
    // 并行初始化
    await Promise.all([
      this.appStore.initApp(),
      this.userStore.initUser(),
      this.productStore.fetchCategories()
    ])
  }
}
```

### 2. Store 间协作示例
```javascript
// 搜索功能与产品 Store 协作
const searchStore = useSearchStore()
const productStore = useProductStore()

// 执行搜索时调用产品 Store 的方法
await productStore.searchProductsByKeyword(keyword)
```

### 3. API 请求示例
```javascript
// 直接使用封装好的请求方法
import { getCarousel } from '@/api'

const data = await getCarousel()
```

## 设计优势

### 1. **职责分离** 📋
- 每个 Store 专注于特定领域
- 避免单个 Store 过于庞大
- 便于团队协作开发

### 2. **可维护性** 🔧
- 模块化设计，易于定位问题
- 统一的 API 请求处理
- 一致的错误处理机制

### 3. **可扩展性** 🚀
- 新功能可独立添加新 Store
- API 请求封装支持各种业务场景
- Store 间可灵活组合使用

### 4. **性能优化** ⚡
- 按需加载数据
- 合理的缓存策略
- 避免重复请求

### 5. **开发体验** 💫
- TypeScript 友好（可选）
- 统一的使用模式
- 完整的错误处理

## 扩展建议

### 1. 添加新的 Store 模块
```javascript
// stores/maintenance.js - 保养服务管理
// stores/order.js - 订单管理
// stores/notification.js - 通知管理
```

### 2. 增强 API 功能
```javascript
// 添加请求拦截器
// 添加响应拦截器
// 添加自动重试机制
// 添加请求缓存
```

### 3. 添加持久化插件
```javascript
// 使用 pinia-plugin-persistedstate
// 自动持久化重要数据
```

这个架构设计充分考虑了项目的可维护性、可扩展性和开发效率，为后续功能开发提供了坚实的基础。
