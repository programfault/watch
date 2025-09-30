# Pinia 状态管理 - 搜索功能

## 概述
项目已集成 Pinia 状态管理，首先实现了搜索功能的状态管理。

## 文件结构
```
stores/
├── index.js          # Pinia 主入口文件
└── search.js         # 搜索状态管理

components/
└── SearchComponent.vue  # 搜索组件
```

## 搜索状态管理 (useSearchStore)

### 状态 (State)
- `keyword`: 当前搜索关键词
- `searchHistory`: 搜索历史记录
- `searchResults`: 搜索结果列表
- `loading`: 搜索加载状态
- `hotSearchList`: 热门搜索列表
- `searchType`: 搜索类型 ('all', 'maintenance', 'rolex', 'customer')
- `filters`: 搜索过滤条件

### 计算属性 (Getters)
- `validSearchHistory`: 过滤空白的搜索历史
- `hasResults`: 是否有搜索结果
- `resultCount`: 搜索结果数量

### 方法 (Actions)
- `setKeyword(keyword)`: 设置搜索关键词
- `performSearch(keyword)`: 执行搜索
- `addToHistory(keyword)`: 添加到搜索历史
- `clearHistory()`: 清空搜索历史
- `removeHistoryItem(keyword)`: 删除单个历史记录
- `setSearchType(type)`: 设置搜索类型
- `setFilters(filters)`: 设置过滤条件
- `clearResults()`: 清空搜索结果
- `init()`: 初始化 store

## 使用方法

### 1. 在组件中使用搜索状态
```javascript
import { useSearchStore } from '@/stores'

export default {
  setup() {
    const searchStore = useSearchStore()
    return {
      searchStore
    }
  },
  mounted() {
    // 初始化
    this.searchStore.init()
  },
  methods: {
    async handleSearch() {
      await this.searchStore.performSearch('劳力士')
    }
  }
}
```

### 2. 访问状态数据
```javascript
// 获取搜索结果
console.log(this.searchStore.searchResults)

// 获取搜索历史
console.log(this.searchStore.validSearchHistory)

// 检查是否正在加载
if (this.searchStore.loading) {
  // 显示加载状态
}
```

### 3. 使用搜索组件
```vue
<template>
  <SearchComponent
    @search="onSearch"
    @select-result="onSelectResult"
    @select-history="onSelectHistory"
    @select-hot="onSelectHot"
  />
</template>
```

## 搜索组件功能
- ✅ 搜索输入框
- ✅ 搜索类型切换 (全部/保养/劳力士/客户)
- ✅ 搜索历史记录 (本地存储)
- ✅ 热门搜索推荐
- ✅ 搜索结果展示
- ✅ 加载状态显示
- ✅ 清空、删除历史功能

## 本地存储
搜索历史会自动保存到 `uni.storage` 中，key 为 `searchHistory`。

## 扩展建议
1. 将模拟搜索替换为真实 API 调用
2. 添加搜索建议/自动补全功能
3. 实现搜索结果分页
4. 添加更多过滤条件
5. 实现搜索结果缓存机制

## 其他状态管理
可以按照相同模式创建其他功能的状态管理：
- `useUserStore`: 用户状态管理
- `useMaintenanceStore`: 保养服务状态管理
- `useRolexStore`: 劳力士产品状态管理
- `useCustomerStore`: 客户管理状态管理
