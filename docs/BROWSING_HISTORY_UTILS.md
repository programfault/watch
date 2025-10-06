# 浏览记录工具函数使用指南

## 📁 文件位置
- 主工具函数：`/utils/browsingHistory.js`
- 使用示例：`/utils/browsingHistoryExamples.js`

## 🚀 快速开始

### 1. 导入函数
```javascript
import {
    getFormattedBrowsingHistory,
    formatBrowsingTime,
    isInBrowsingHistory
} from '@/utils/browsingHistory.js'
```

### 2. 常用场景

#### 获取浏览记录列表
```javascript
// 获取最近5条浏览记录（默认）
const history = getFormattedBrowsingHistory()

// 获取最近3条浏览记录
const recent3 = getFormattedBrowsingHistory(3)

// 返回格式：
[
    {
        id: 1,
        title: "劳力士潜航者",
        price: 65000,
        image: "http://...",
        formattedTime: "2小时前浏览",
        formattedPrice: "¥65,000",
        displayImage: "http://... 或默认图"
    }
]
```

#### 检查商品是否已浏览
```javascript
// 检查产品ID为123的商品是否已浏览过
const hasViewed = isInBrowsingHistory(123)

if (hasViewed) {
    console.log('用户浏览过这个商品')
}
```

#### 获取浏览统计
```javascript
import { getBrowsingHistoryStats } from '@/utils/browsingHistory.js'

const stats = getBrowsingHistoryStats()
// 返回：{ total: 5, todayCount: 2, yesterdayCount: 1, hasHistory: true }
```

## 📋 主要函数列表

| 函数名 | 功能 | 参数 | 返回值 |
|-------|------|------|--------|
| `getFormattedBrowsingHistory(limit)` | 获取格式化的浏览记录 | limit: 数量限制 | Array |
| `getBrowsingHistoryFromStore(limit)` | 从Store获取原始数据 | limit: 数量限制 | Array |
| `getBrowsingHistoryFromStorage(limit)` | 从存储直接获取 | limit: 数量限制 | Array |
| `isInBrowsingHistory(productId)` | 检查是否已浏览 | productId: 商品ID | Boolean |
| `findBrowsingHistoryById(productId)` | 查找指定商品记录 | productId: 商品ID | Object/null |
| `getBrowsingHistoryStats()` | 获取浏览统计 | 无 | Object |
| `formatBrowsingTime(timeStr)` | 格式化时间显示 | timeStr: 时间字符串 | String |
| `formatBrowsingPrice(price)` | 格式化价格显示 | price: 价格数值 | String |
| `getBrowsingHistoryIds(limit)` | 获取商品ID列表 | limit: 数量限制 | Array |

## 💡 实际使用场景

### 场景1: 首页显示"最近浏览"
```javascript
// 在页面的script setup中
import { getFormattedBrowsingHistory } from '@/utils/browsingHistory.js'

const recentHistory = ref([])

onShow(() => {
    recentHistory.value = getFormattedBrowsingHistory(3)
})
```

```vue
<!-- 在模板中显示 -->
<view v-for="item in recentHistory" :key="item.id">
    <image :src="item.displayImage" />
    <text>{{ item.title }}</text>
    <text>{{ item.formattedPrice }}</text>
    <text>{{ item.formattedTime }}</text>
</view>
```

### 场景2: 产品列表标记已浏览
```javascript
import { isInBrowsingHistory } from '@/utils/browsingHistory.js'

// 处理商品列表
const processProductList = (products) => {
    return products.map(product => ({
        ...product,
        hasViewed: isInBrowsingHistory(product.id)
    }))
}
```

### 场景3: 个人中心显示统计
```javascript
import { getBrowsingHistoryStats, formatBrowsingTime } from '@/utils/browsingHistory.js'

const stats = getBrowsingHistoryStats()
const statsText = `共浏览${stats.total}个商品，今日${stats.todayCount}个`
```

### 场景4: 搜索推荐
```javascript
import { getBrowsingHistoryIds } from '@/utils/browsingHistory.js'

// 获取浏览过的商品ID，用于推荐相似商品
const viewedIds = getBrowsingHistoryIds()
// 发送给后端API获取推荐商品
```

## ⚠️ 注意事项

1. **Store vs Storage**:
   - 推荐使用 `getBrowsingHistoryFromStore()` （会自动同步）
   - `getBrowsingHistoryFromStorage()` 只在Store不可用时使用

2. **数据格式**:
   - 所有时间都是ISO格式字符串
   - 价格为数值类型
   - 图片URL可能为空，使用 `displayImage` 字段获取带默认值的图片

3. **性能考虑**:
   - 浏览记录最多保存5条
   - 函数都是同步执行，不会有性能问题

4. **错误处理**:
   - 所有函数都包含错误处理
   - 异常时返回空数组或默认值

## 🔧 自定义扩展

如果需要其他功能，可以基于基础函数进行组合：

```javascript
// 自定义：获取本周浏览的所有商品
const getThisWeekBrowsing = () => {
    const allHistory = getBrowsingHistoryFromStore(50) // 获取更多数据
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    return allHistory.filter(item =>
        new Date(item.viewedAt) >= weekStart
    )
}

// 自定义：按价格区间筛选浏览记录
const getBrowsingByPriceRange = (minPrice, maxPrice) => {
    const allHistory = getBrowsingHistoryFromStore()

    return allHistory.filter(item =>
        item.price >= minPrice && item.price <= maxPrice
    )
}
```
