# 初始化 API 文档

## AppStore 方法说明

### `fetchInitData()`
- **作用**: 直接调用 `/init` API 获取数据
- **返回**: 初始化数据
- **用途**: 底层数据获取方法

### `initApp()`
- **作用**: 应用初始化入口，调用 `fetchInitData()`
- **返回**: Promise
- **用途**: 小程序启动时的数据初始化

### `refreshApp()`
- **作用**: 刷新应用数据，重新调用 `fetchInitData()`
- **返回**: Promise
- **用途**: 用户下拉刷新或需要重新获取最新数据时使用

## `/init` 接口

### 描述
获取小程序初始化所需的所有数据，包含页面、品牌、筛选选项、店铺信息。这个API替代了之前需要分别请求的四个API。

### 请求方式
```
GET /init
```

### 请求参数
无需参数

### 返回数据结构
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "pages": [
            {
                "id": 2,
                "title": "人才招聘",
                "description": "多种方式联系我们的客服团队",
                "carousel_image": null,
                "is_carousel": 0,
                "sort": 2,
                "content": "",
                "has_content": 1
            }
        ],
        "brands": [
            {
                "id": 15,
                "name_cn": "沛纳海",
                "name_en": "Panerai",
                "logo": "https://example.com/logo.png",
                "description": "意大利奢华腕表品牌",
                "sort": 15
            }
        ],
        "filter_options": {
            "attributes": []
        },
        "stores": {
            "stores": [],
            "total": 0
        }
    }
}
```

### 数据字段说明

#### pages 字段
- `id`: 页面ID
- `title`: 页面标题
- `description`: 页面描述
- `carousel_image`: 轮播图图片URL（当is_carousel=1时使用）
- `is_carousel`: 是否为轮播图（1=是轮播图，0=普通页面）
- `sort`: 排序值
- `content`: 页面内容
- `has_content`: 是否有内容

#### brands 字段
- `id`: 品牌ID
- `name_cn`: 中文名称
- `name_en`: 英文名称
- `logo`: 品牌logo URL
- `description`: 品牌描述
- `sort`: 排序值

#### filter_options 字段
- `attributes`: 筛选属性数组

#### stores 字段
- `stores`: 店铺列表数组
- `total`: 店铺总数

### 使用方式

#### API 调用
```javascript
import { getInitData } from '@/api/init.js'

const response = await getInitData()
```

#### Store 方法
```javascript
import { useAppStore } from '@/stores'

const appStore = useAppStore()
await appStore.fetchInitData()
```

### 错误处理
如果初始化API失败，系统会自动回退到分别请求的方式，确保应用正常运行。

### 兼容性说明
- ✅ 新增了一体化初始化API
- ✅ 保留了原有的分别请求API作为备用
- ✅ 自动回退机制确保兼容性
- ✅ 不影响现有功能
