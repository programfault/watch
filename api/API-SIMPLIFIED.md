# 消费者操作 API 简化说明

## API 接口
- **方法**: `POST`
- **路径**: `/consumers`
- **函数**: `processConsumerAction(payload)`

## 简化的 Payload 结构

### 必需字段
```javascript
{
  actionType: string,        // 操作类型: 'gift' | 'verify'
  consumerId: string,        // 消费者ID
  points: number,           // 积分数量 (默认: 0)
  coupons: string[],        // 优惠券ID列表 (默认: [])
  privileges: string[]      // 特权ID列表 (默认: [])
}
```

### 字段说明
- `actionType`: 操作类型，`'gift'` 表示赠送，`'verify'` 表示核销
- `consumerId`: 消费者的唯一标识ID，后台可根据此ID查询消费者详细信息
- `points`: 涉及的积分数量，赠送时为正数，核销时也为正数（表示扣除的积分）
- `coupons`: 涉及的优惠券ID数组，后台可根据ID查询优惠券详情
- `privileges`: 涉及的特权ID数组，后台可根据ID查询特权详情

## 实际调用示例

### 赠送操作
```javascript
// 赠送积分 + 优惠券 + 特权
const giftPayload = {
  actionType: 'gift',
  consumerId: 'consumer_123',
  points: 100,
  coupons: ['coupon_001', 'coupon_002'],
  privileges: ['privilege_001']
};

// 只赠送积分
const pointsGift = {
  actionType: 'gift',
  consumerId: 'consumer_456',
  points: 200,
  coupons: [],
  privileges: []
};
```

### 核销操作
```javascript
// 核销积分 + 优惠券
const verifyPayload = {
  actionType: 'verify',
  consumerId: 'consumer_789',
  points: 50,
  coupons: ['coupon_003'],
  privileges: []
};

// 只核销优惠券
const couponVerify = {
  actionType: 'verify',
  consumerId: 'consumer_101',
  points: 0,
  coupons: ['coupon_004', 'coupon_005'],
  privileges: []
};
```

## 前端调用方式
```javascript
import { processConsumerAction } from '@/api/app'

try {
  const response = await processConsumerAction(payload)
  console.log('操作成功:', response)
} catch (error) {
  console.error('操作失败:', error)
}
```

## 数据验证规则
- `consumerId` 不能为空
- 至少需要有一项不为空：`points > 0` 或 `coupons.length > 0` 或 `privileges.length > 0`
- `points` 必须为非负整数
- `coupons` 和 `privileges` 必须为字符串数组

## 优势
1. **减少数据传输量**: 不传递完整的消费者信息和详细的福利信息
2. **提高安全性**: 前端不需要知道完整的后端数据结构
3. **降低耦合度**: 后端可以自由修改数据结构而不影响前端
4. **提高性能**: 后台根据ID批量查询，比前端传递完整数据更高效
