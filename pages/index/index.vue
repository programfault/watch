<template>
	<view class="container">
		<!-- 搜索组件 -->
		<HomeSearchComponent @search="onSearch" ref="homeSearch" from="home" />

		<!-- 轮播图组件 -->
		<CarouselComponent v-if="!searchStore.showSearchPanel" />

		<!-- 品牌组件 -->
		<BrandsComponent v-if="!searchStore.showSearchPanel" />
        <van-tabbar v-model="active" @change="onChange">
        <van-tabbar-item icon="home-o" name="home">首页</van-tabbar-item>
        <van-tabbar-item icon="user-o" name="profile">我的</van-tabbar-item>
        </van-tabbar>
		<!-- 客服按钮 -->
        <!-- <view class="container">
            <button @click="openCustomerService">联系客服</button>
        </view> -->

		<!-- 悬浮扫一扫按钮 - 仅管理员可见 -->
		<view
			v-if="userStore.isLoggedIn && userStore.isAdmin"
			class="floating-scan-btn"
			@click="handleFloatingScan"
		>
			<uni-icons type="scan" size="28" color="#fff"></uni-icons>
		</view>
	</view>
</template>

<script>
import { ref } from 'vue';
import BrandsComponent from '@/components/BrandsComponent.vue'
import CarouselComponent from '@/components/CarouselComponent.vue'
import HomeSearchComponent from '@/components/HomeSearchComponent.vue'
import { useAppStore, useSearchStore, useUserStore } from '@/stores'
import ScanUtils from '@/utils/scanUtils.js'
export default {
	components: {
		HomeSearchComponent,
		BrandsComponent,
		CarouselComponent
	},
	setup() {
		const searchStore = useSearchStore()
		const appStore = useAppStore()
		const userStore = useUserStore()
        const active = ref(0);
		return {
			searchStore,
			appStore,
			userStore,
            active
		}
	},
	data() {
		return {

		}
	},
	async onLoad() {
		console.log('Index页面 onLoad')
		// 初始化应用数据
		try {
			// await this.appStore.initApp()
		} catch (error) {
			console.error('初始化失败:', error)
		}
	},

	onShow() {
		console.log('Index页面 onShow')

		// 每次页面显示都重新初始化 stores，确保状态正确
		try {
			console.log('🔍 强制重新初始化所有 stores');
			this.userStore = useUserStore();
			this.searchStore = useSearchStore();
			this.appStore = useAppStore();

			console.log('🔍 onShow - stores 重新初始化完成:', {
				userStore: !!this.userStore && typeof this.userStore.setConsumersCardNumber === 'function',
				searchStore: !!this.searchStore,
				appStore: !!this.appStore,
				userStoreMethods: this.userStore ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.userStore)).slice(0, 5) : []
			});
		} catch (error) {
			console.error('❌ onShow - stores 初始化失败:', error);
		}

		// 从其他页面返回首页时，完全重置搜索框
		if (this.$refs.homeSearch) {
			this.$refs.homeSearch.resetSearch()
		}
	},

	onHide() {
		console.log('Index页面 onHide')
	},
	methods: {
		// 搜索事件 - 可选的业务处理
        onChange(name) {
            console.log('当前选中标签:', name);
            if (name.detail === 'profile') {
                console.log('切换到我的标签，跳转profile页面');
                uni.switchTab({
                    url: '/pages/profile/profile'
                });
            }
        },
		onSearch(keyword) {
			console.log('首页搜索:', keyword)
		},
        onContact(e) {
            console.log('客服会话触发', e.detail);
            // e.detail 中包含客服会话相关信息
        },
        openCustomerService() {
            const customerServiceId = "ww17da4a406b6bf90b"
            uni.openCustomerServiceChat({
				extInfo: {
					url: `https://work.weixin.qq.com/kfid/kfc222a4433ef7716d7`
				},
				corpId: customerServiceId,
				success: (res) => {
					console.log('客服聊天打开成功:', res)
				},
				fail: (err) => {
					console.error('客服聊天打开失败:', err)
					// 失败时提供备用方案
					uni.showModal({
						title: '客服提示',
						content: '无法打开客服聊天，请联系客服微信：' + customerServiceId,
						showCancel: false
					})
				}
			})
        },

		// 悬浮扫一扫处理
		async handleFloatingScan() {
			console.log('悬浮扫一扫点击');

			// 总是重新获取 userStore 实例以确保最新状态
			let userStore = useUserStore();

			// 更新组件的引用
			this.userStore = userStore;

			console.log('🔍 userStore 重新获取后检查:', {
				userStoreExists: !!userStore,
				clearMethodExists: !!userStore?.clearConsumersSearch,
				setMethodExists: !!userStore?.setConsumersCardNumber,
				storeType: typeof userStore,
				isFunction: typeof userStore.setConsumersCardNumber,
			});

			try {
				// 最后一次验证
				if (!userStore) {
					console.error('❌ userStore 获取失败');
					uni.showToast({
						title: '系统初始化失败',
						icon: 'error'
					});
					return;
				}

				// 检查必要的方法是否存在
				if (typeof userStore.setConsumersCardNumber !== 'function') {
					console.error('❌ setConsumersCardNumber 方法不存在');
					console.log('userStore 属性:', Object.keys(userStore));
					console.log('userStore 原型方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(userStore)));

					// 尝试直接设置方法（临时解决方案）
					if (!userStore.setConsumersCardNumber) {
						userStore.setConsumersCardNumber = function(cardNumber) {
							this.consumersCardNumber = cardNumber || "";
							console.log('🔍 临时方法设置 consumersCardNumber:', this.consumersCardNumber);
						};
					}

					if (!userStore.clearConsumersSearch) {
						userStore.clearConsumersSearch = function() {
							this.consumersSearchKeyword = "";
							this.consumersCardNumber = "";
							console.log('🔍 临时方法清除搜索条件');
						};
					}
				}

				// 使用扫码工具进行扫码
				const scanResult = await ScanUtils.quickScan();

				if (scanResult) {
					console.log('🔍 扫码结果:', scanResult);

					// 先清除之前的搜索条件
					try {
						userStore.clearConsumersSearch();
						console.log('✅ clearConsumersSearch 调用成功');
					} catch (e) {
						console.error('❌ clearConsumersSearch 调用失败:', e);
					}

					// 设置用户store中的consumersCardNumber
					try {
						userStore.setConsumersCardNumber(scanResult);
						console.log('✅ setConsumersCardNumber 调用成功');
					} catch (e) {
						console.error('❌ setConsumersCardNumber 调用失败:', e);
					}

					// 延迟一下确保状态更新
					await this.$nextTick();

					// 跳转到客户页面
					// 检查是否刚刚完成登录，如果是则不跳转
					const justLoggedIn = uni.getStorageSync("justLoggedIn");
					if (justLoggedIn) {
						console.log('刚完成登录，跳过自动跳转到customer页面');
						uni.showToast({
							title: '扫码成功，卡号已记录',
							icon: 'success'
						});
					} else {
						uni.navigateTo({
							url: '/pages/customer/customer'
						});
					}
				}
			} catch (error) {
				console.error('扫码操作失败:', error);
				uni.showToast({
					title: '扫码失败，请重试',
					icon: 'error'
				});
			}
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 20px;
	min-height: 100vh;
	background-color: #f8f8f8;
}

// 客服按钮样式
.customer-service-btn {
	position: fixed;
	right: 30rpx;
	bottom: 100rpx;
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #07c160 0%, #00a859 100%);
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 20rpx rgba(7, 193, 96, 0.3);
	z-index: 999;
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.4);
	}

	.service-text {
		font-size: 20rpx;
		color: #fff;
		margin-top: 4rpx;
		font-weight: 500;
	}
}

// 悬浮扫一扫按钮样式
.floating-scan-btn {
	position: fixed;
	right: 30rpx;
	bottom: 200rpx; // 位置稍高一些，避免与其他按钮重叠
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #007aff 0%, #0056d3 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.3);
	z-index: 998; // 比客服按钮稍低
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.4);
	}

	// 添加一个轻微的脉动动画效果
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% {
		box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.3);
	}
	50% {
		box-shadow: 0 8rpx 25rpx rgba(0, 122, 255, 0.5);
	}
	100% {
		box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.3);
	}
}
</style>
