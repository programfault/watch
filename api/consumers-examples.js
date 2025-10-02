/**
 * /consumers API 调用示例
 *
 * 这个文件展示了如何使用新的 processConsumerAction API
 */

// API 调用示例

// 1. 赠送操作示例
const giftExample = {
  actionType: 'gift',
  consumerId: 'consumer_123',
  points: 100,                    // 赠送100积分
  coupons: [                      // 赠送的优惠券ID列表
    'coupon_001',
    'coupon_002'
  ],
  privileges: [                   // 赠送的特权ID列表
    'privilege_001'
  ]
};

// 2. 核销操作示例
const verifyExample = {
  actionType: 'verify',
  consumerId: 'consumer_123',
  points: 50,                     // 核销50积分
  coupons: [                      // 核销的优惠券ID列表
    'coupon_003'
  ],
  privileges: [                   // 核销的特权ID列表
    'privilege_002'
  ]
};

// 3. 只赠送积分的示例
const pointsOnlyGift = {
  actionType: 'gift',
  consumerId: 'consumer_456',
  points: 200,                    // 只赠送积分
  coupons: [],
  privileges: []
};

// 4. 只核销优惠券的示例
const couponOnlyVerify = {
  actionType: 'verify',
  consumerId: 'consumer_789',
  points: 0,                      // 不涉及积分
  coupons: ['coupon_004', 'coupon_005'],
  privileges: []
};// API使用示例
/*
import { processConsumerAction } from '@/api/app'

try {
  // 调用API
  const response = await processConsumerAction(giftExample)
  console.log('操作成功:', response)

  // 显示成功提示
  uni.showToast({
    title: '赠送成功',
    icon: 'success'
  })
} catch (error) {
  console.error('操作失败:', error)

  // 显示错误提示
  uni.showToast({
    title: error.message || '操作失败',
    icon: 'none'
  })
}
*/

export {
    couponOnlyVerify, giftExample, pointsOnlyGift, verifyExample
};
