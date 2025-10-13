<template>
    <uv-navbar title="天辰手表" @leftClick="leftClick" height="44px">
        <template v-slot:left>
        <view class="uv-nav-slot" v-if="showSearchResults">
            <uv-icon name="home" size="20"></uv-icon>
        </view>
    </template>
    </uv-navbar>
	<!-- 搜索框吸顶 -->
	<uv-sticky offset-top="44" customNavHeight="44">
		<view class="search-box">
			<uv-search
				placeholder="搜索品牌、手表、服务..."
				v-model="searchKeyword"
				:showAction="searchStore.showSearchPanel"
				:actionText="searchStore.showSearchPanel ? '取消' : '搜索'"
				:animation="false"
				shape="square"
				bgColor="#ffffff"
				@focus="onSearchFocus"
				@search="onSearch"
				@custom="onSearchAction"
				@clear="onSearchClear"
				@change="onSearchInput"
			></uv-search>
		</view>
	</uv-sticky>

	<!-- 搜索面板 -->
	<view class="search-panel" v-if="searchStore.showSearchPanel && !showSearchResults">
		<!-- 搜索历史 -->
		<view class="search-history">
			<view class="history-header">
				<text class="history-title">搜索历史</text>
				<text
					class="clear-btn"
					v-if="searchStore.validSearchHistory.length > 0"
					@click="clearHistory"
				>清空</text>
			</view>
			<view
				class="history-list"
				v-if="searchStore.validSearchHistory.length > 0"
			>
				<view
					class="history-item"
					v-for="(item, index) in searchStore.validSearchHistory"
					:key="index"
					@click="selectHistory(item)"
				>
					<text class="history-text">{{ item }}</text>
				</view>
			</view>
			<view class="empty-history" v-else>
				<text class="empty-text">暂无搜索历史</text>
			</view>
		</view>
	</view>

	<!-- 搜索结果页面的搜索面板 -->
	<view class="search-panel" v-if="searchStore.showSearchPanel && showSearchResults">
		<!-- 搜索历史 -->
		<view class="search-history">
			<view class="history-header">
				<text class="history-title">搜索历史</text>
				<text
					class="clear-btn"
					v-if="searchStore.validSearchHistory.length > 0"
					@click="clearHistory"
				>清空</text>
			</view>
			<view
				class="history-list"
				v-if="searchStore.validSearchHistory.length > 0"
			>
				<view
					class="history-item"
					v-for="(item, index) in searchStore.validSearchHistory"
					:key="index"
					@click="selectHistory(item)"
				>
					<text class="history-text">{{ item }}</text>
				</view>
			</view>
			<view class="empty-history" v-else>
				<text class="empty-text">暂无搜索历史</text>
			</view>
		</view>
	</view>

	<!-- 搜索结果 -->
	<view class="search-results" v-if="showSearchResults && !searchStore.showSearchPanel">
		<ProductListComponent ref="productListRef" :keyword="currentSearchKeyword" />
	</view>

	<!-- 主容器 -->
	<view class="container" v-if="!searchStore.showSearchPanel && !showSearchResults">
		<!-- 轮播图组件 -->
		<CarouselComponent/>
		<!-- 品牌组件 -->
		<BrandsComponent @brandClick="onBrandClick" />
	</view>

    <!-- 悬浮按钮 - 简化测试版本 -->
		   <view class="simple-floating-button">
			   <button
				   open-type="contact"
				   session-from="weapp"
				   class="custom-service-btn"
			   >
				   <uv-icon
					   name="server-man"
					   size="28"
					   color="#fff"
				   />
			   </button>
		   </view>

    <CustomTabBar />
	<!-- 全局Loading组件 -->
	<GlobalLoading />
</template>

<script setup>
import BrandsComponent from '@/components/BrandsComponent.vue'
import CarouselComponent from '@/components/CarouselComponent.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import GlobalLoading from '@/components/GlobalLoading.vue'
import ProductListComponent from '@/components/ProductListComponent.vue'
import { useAppStore, useConfigStore, useProductStore, useSearchStore, useTabBarStore, useUserStore } from '@/stores'
import { hideTabSwitchLoading } from '@/utils/loadingUtils.js'
import { onHide, onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 定义组件名称
defineOptions({
	name: 'IndexPage'
})

// 获取 stores
const searchStore = useSearchStore()
const appStore = useAppStore()
const configStore = useConfigStore()
const userStore = useUserStore()
const tabBarStore = useTabBarStore()
const productStore = useProductStore()

// 搜索相关响应式数据
const searchKeyword = ref('')
const showSearchResults = ref(false)
const currentSearchKeyword = ref('')
const productListRef = ref(null)


// 初始化数据的方法
const initData = async () => {
	try {
		// 优先加载配置信息
		if (!configStore.isConfigLoaded) {
			await configStore.fetchConfig()
		}

		// 初始化搜索历史
		searchStore.init()

		if (userStore.isLoggedIn && userStore.userInfo && userStore.userInfo.status === 1) {
            tabBarStore.setUserType('admin')
		} else if (userStore.isLoggedIn && userStore.userInfo && userStore.userInfo.status === 0) {
			tabBarStore.setUserType('normal')
        } else {
            tabBarStore.setUserType('anonymous')
        }
		await appStore.initApp()
	} catch (error) {
		uni.showToast({
			title: '数据加载失败',
			icon: 'none'
		});
	}
}
// 角色切换方法
const switchRole = (role) => {
	tabBarStore.setUserType(role)
	uni.showToast({
		title: `已切换到${tabBarStore.userTypeText}`,
		icon: 'success'
	})
}

// 搜索相关方法
const onSearchFocus = () => {
	console.log('搜索框被点击')

	// 如果当前在搜索结果页面，不要切换到搜索面板，而是清空搜索框让用户重新搜索
	if (showSearchResults.value) {
		console.log('当前在搜索结果页面，清空搜索框供用户重新搜索')
		// 可以选择清空搜索框或者直接显示搜索面板
		// 这里我们选择显示搜索面板，但保持在搜索模式
	}

	// 显示搜索面板，实现无感体验
	searchStore.showPanel()
}

const onSearchClear = () => {
	searchKeyword.value = ''
	searchStore.clearResults()
	productStore.clearSearchResults()
}

const onSearch = async (value) => {
	const keyword = value || searchKeyword.value
	console.log('=== 开始搜索流程 ===')
	console.log('搜索关键词:', keyword)

	if (!keyword || !keyword.trim()) {
		uni.showToast({
			title: '请输入搜索关键词',
			icon: 'none'
		})
		return
	}

	console.log('添加搜索历史:', keyword)
	// 添加到搜索历史
	searchStore.addToHistory(keyword)

	console.log('隐藏搜索面板')
	// 隐藏搜索面板
	searchStore.hidePanel()

	console.log('清空之前的搜索结果')
	// 先清空之前的搜索结果，避免显示过期数据
	const productStore = useProductStore()
	productStore.watchesList = []
	productStore.watchesLoading = true
	// 清空当前品牌信息，因为搜索不应该显示品牌筛选信息
	productStore.currentBrand = null

	console.log('显示搜索结果页面')
	// 显示搜索结果
	currentSearchKeyword.value = keyword
	showSearchResults.value = true

	// 等待组件挂载然后调用搜索方法
	await new Promise(resolve => setTimeout(resolve, 100)) // 等待 100ms 确保组件完全渲染

	console.log('检查 productListRef:', !!productListRef.value)
	if (productListRef.value) {
		console.log('调用 ProductListComponent.searchWithKeyword')
		try {
			await productListRef.value.searchWithKeyword(keyword)
			console.log('搜索完成')
		} catch (error) {
			console.error('搜索调用失败:', error)
		}
	} else {
		console.error('productListRef 不存在，使用 nextTick 重试')
		// 使用 nextTick 重试
		await new Promise(resolve => setTimeout(resolve, 200))
		if (productListRef.value) {
			console.log('重试成功，调用搜索方法')
			await productListRef.value.searchWithKeyword(keyword)
		} else {
			console.error('重试后 productListRef 仍然不存在')
		}
	}
}

const onSearchAction = () => {
	if (searchStore.showSearchPanel) {
		// 如果搜索面板已显示，则取消搜索
		onSearchCancel()
	} else {
		// 否则执行搜索
		onSearch(searchKeyword.value)
	}
}

const onSearchInput = (value) => {
	searchKeyword.value = value
	searchStore.setKeyword(value)
}

// 取消搜索
const onSearchCancel = () => {
	console.log('取消搜索，隐藏搜索面板')

	// 清空搜索框输入
	searchKeyword.value = ''
	searchStore.setKeyword('')

	// 隐藏搜索面板
	searchStore.hidePanel()

	// 如果当前有搜索结果，保持在搜索结果页面，否则回到首页
	if (showSearchResults.value) {
		console.log('保持在搜索结果页面')
		// 保持 showSearchResults.value = true 和 currentSearchKeyword.value 不变
		// 只隐藏搜索面板，让用户回到搜索结果查看
	} else {
		console.log('回到首页')
		// 如果本来就在首页，清空所有搜索相关状态
		showSearchResults.value = false
		currentSearchKeyword.value = ''
	}
}

// 选择历史记录
const selectHistory = async (keyword) => {
	searchKeyword.value = keyword
	searchStore.setKeyword(keyword)
	await onSearch(keyword)
}

// 清空历史记录
const clearHistory = () => {
	uni.showModal({
		title: '提示',
		content: '确定要清空搜索历史吗？',
		success: (res) => {
			if (res.confirm) {
				searchStore.clearHistory()
			}
		}
	})
}

// 品牌点击事件处理
const onBrandClick = async (brand) => {
	console.log('=== 品牌点击事件 ===')
	console.log('选择的品牌:', brand)

	if (!brand || !brand.id) {
		uni.showToast({
			title: '品牌信息错误',
			icon: 'none'
		})
		return
	}

	try {
		console.log('清空之前的品牌筛选结果')
		// 先清空之前的数据，避免显示过期数据
		const productStore = useProductStore()
		productStore.watchesList = []
		productStore.watchesLoading = true

		// 设置当前搜索关键词为品牌名称（用于显示）
		currentSearchKeyword.value = brand.name_cn || brand.name_en

		// 显示搜索结果页面
		showSearchResults.value = true

		// 等待组件挂载然后调用品牌筛选方法
		const waitForComponent = async (retries = 5) => {
			for (let i = 0; i < retries; i++) {
				await new Promise(resolve => setTimeout(resolve, 100 * (i + 1))) // 递增等待时间
				
				console.log(`检查 productListRef (第${i + 1}次):`, !!productListRef.value)
				
				if (productListRef.value) {
					console.log('组件已加载，调用 ProductListComponent.searchByBrand')
					try {
						await productListRef.value.searchByBrand(brand.id, brand)
						console.log('品牌筛选完成')
						
						uni.showToast({
							title: `已切换到${brand.name_cn}`,
							icon: 'success',
							duration: 1500
						})
						return true
					} catch (error) {
						console.error('品牌筛选调用失败:', error)
						uni.showToast({
							title: '品牌数据加载失败',
							icon: 'none'
						})
						return false
					}
				}
			}
			
			console.error('多次重试后 productListRef 仍然不存在')
			uni.showToast({
				title: '组件加载失败，请重试',
				icon: 'none'
			})
			return false
		}
		
		await waitForComponent()
	} catch (error) {
		console.error('品牌点击处理失败:', error)
		uni.showToast({
			title: '操作失败，请重试',
			icon: 'none'
		})
	}
}

// 页面生命周期 - onLoad
onLoad(async () => {
	await initData()
})

onShow(() => {
    // 重置搜索状态，回到默认首页
    searchStore.setKeyword('')
    searchStore.hidePanel()

    // 重置页面状态到默认首页
    searchKeyword.value = ''
    showSearchResults.value = false
    currentSearchKeyword.value = ''

    // 清除产品搜索结果
    productStore.clearSearchResults()

	// 设置当前页面的tabBar状态
	tabBarStore.setActiveTab('index')
	// 隐藏tab切换loading
	hideTabSwitchLoading()
})

onHide(() => {
})

// navbar 左侧点击处理 - 返回首页
const leftClick = () => {
	console.log('Home 图标被点击，返回首页')
	// 只有在显示搜索结果时才有 home 图标，点击时返回首页
	if (showSearchResults.value) {
		console.log('从搜索结果返回首页')
		showSearchResults.value = false
		currentSearchKeyword.value = ''
		searchKeyword.value = ''
		searchStore.setKeyword('')
		searchStore.hidePanel()
		// 回到主页时清空品牌信息
		productStore.currentBrand = null

		uni.showToast({
			title: '已返回首页',
			icon: 'success',
			duration: 1000
		})
	}
}

</script>

<style lang="scss">
@mixin flex($direction: row) {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: $direction;
	}
	.uv-nav-slot {
		@include flex;
		align-items: center;
		justify-content: space-between;
		border-width: 0.5px;
		border-radius: 100px;
		border-color: #dadbde;
		padding: 3px 7px;
		opacity: 0.8;
	}

	/* 确保 navbar 和 sticky 组件在模态弹窗时被遮罩覆盖 */
	:deep(.uv-navbar) {
		z-index: 1 !important;
	}

	:deep(.uv-sticky) {
		z-index: 1 !important;
	}
// 搜索框样式
.search-box {
	margin-top: 0;
	margin-bottom: 5px; /* 减小底部间距 */
	width: 100%;
	margin-left: auto;
	margin-right: auto;
	box-sizing: border-box;
	padding-left: 16px;
	padding-right: 16px;
	background-color: #f8f8f8;
	padding-top: 8px; /* 减小顶部内边距 */
	padding-bottom: 8px; /* 减小底部内边距 */
	/* 确保在模态弹窗时被遮罩覆盖 */
	position: relative;
	z-index: 1;
}

// 搜索面板样式
.search-panel {
	padding: 15px;
	margin-top: 96px; /* navbar(44) + 搜索框区域(52) 的高度 */
	padding-top: 10px;
	background-color: #f8f8f8;
	min-height: calc(100vh - 96px - 70px); /* navbar(44) + 搜索框区域(52) + tabbar(70) */

	.search-history {
		margin-bottom: 20px;

		.history-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10px;

			.history-title {
				font-size: 16px;
				font-weight: bold;
				color: #333;
			}

			.clear-btn {
				font-size: 14px;
				color: #007aff;
			}
		}

		.history-list {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;

			.history-item {
				display: inline-flex;
				align-items: center;
				padding: 6px 12px;
				background: #fff;
				border-radius: 16px;
				border: 1px solid #e0e0e0;

				.history-text {
					font-size: 14px;
					color: #666;
				}
			}
		}

		.empty-history {
			text-align: center;
			padding: 40px 0;

			.empty-text {
				color: #999;
				font-size: 14px;
			}
		}
	}
}

// 搜索结果样式
.search-results {
	background-color: #f8f8f8;
	margin-top: 96px; /* navbar(44) + 搜索框区域(52) 的高度 */
	min-height: calc(100vh - 96px - 70px); /* navbar(44) + 搜索框区域(52) + tabbar(70) */
	padding-bottom: calc(10px + env(safe-area-inset-bottom)); /* 为tabbar预留空间 */
}

.container {
	min-height: calc(100vh - 96px - 70px); /* navbar(44) + 搜索框区域(52) + tabbar(70) */
	padding: 20px;
	margin-top: 96px; /* navbar(44) + 搜索框区域(52) 的高度 */
	padding-top: 5px; /* 减小顶部间距，让轮播图更靠近搜索框 */
	padding-bottom: calc(10px + env(safe-area-inset-bottom)); /* 为tabbar预留空间 */
	background-color: #f8f8f8;
	box-sizing: border-box;
}

// 客服悬浮按钮样式
.simple-floating-button {
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

.custom-service-btn {
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

.custom-service-btn::after {
  border: none !important;
}
</style>
