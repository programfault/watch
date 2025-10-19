<template>
	<!-- 导航栏 -->
	<up-navbar title="天辰手表" :fixed="true" :safe-area-inset-top="true" :placeholder="true" bg-color="#ffffff"
		title-color="#333333" height="44" @leftClick="leftClick">
		<template #left v-if="showSearchResults">
			<view class="navbar-home-icon">
				<up-icon name="home" size="20" color="#666666"></up-icon>
			</view>
		</template>
	</up-navbar>

	<!-- 搜索框容器 - 全局固定定位 -->
	<view class="search-container" :style="searchContainerStyle">
		<view class="search-wrapper">
			<up-search placeholder="搜索品牌、手表、服务..." v-model="searchKeyword" :show-action="searchStore.showSearchPanel"
				:actionText="searchStore.showSearchPanel ? '取消' : '搜索'" :animation="false" shape="square"
				bg-color="#ffffff" border-color="#e5e5e5" @focus="onSearchFocus" @search="onSearch"
				@custom="onSearchAction" @clear="onSearchClear" @change="onSearchInput"></up-search>
		</view>
	</view>

	<!-- 搜索历史面板 - 全局弹层 -->
	<SearchHistoryPanel :visible="searchStore.showSearchPanel" @select-history="selectHistory"
		@clear-history="clearHistory" />

	<!-- 主要内容区域 -->
	<view class="page-content" :style="contentStyle" v-show="!searchStore.showSearchPanel">
		<!-- 搜索结果页面 -->
		<view class="search-results" :style="searchResultsStyle" v-if="showSearchResults">
			<ProductListComponent ref="productListRef" :keyword="currentSearchKeyword" />
		</view>

		<!-- 首页内容 -->
		<view class="home-content" v-show="!showSearchResults">
			<!-- 轮播图组件 -->
			<CarouselComponent />
			<!-- 品牌组件 -->
			<BrandsComponent @brandClick="onBrandClick" />
		</view>

		<!-- 悬浮客服按钮 -->
		<FloatingServiceButton />

		<!-- 底部标签栏 -->
		<CustomTabBar v-show="true" />
	</view>

</template>

<script setup>
import BrandsComponent from '@/components/BrandsComponent.vue'
import CarouselComponent from '@/components/CarouselComponent.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import FloatingServiceButton from '@/components/FloatingServiceButton.vue'
import ProductListComponent from '@/components/ProductListComponent.vue'
import SearchHistoryPanel from '@/components/SearchHistoryPanel.vue'
import { useAppStore, useLayoutStore, useProductStore, useSearchStore, useTabBarStore, useUserStore } from '@/stores'
import { hideTabSwitchLoading } from '@/utils/loadingUtils.js'
import { onHide, onLoad, onShow, onReady } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'

// 定义组件名称
defineOptions({
	name: 'IndexPage'
})

// 获取 stores
const searchStore = useSearchStore()
const appStore = useAppStore()
const layoutStore = useLayoutStore()
const userStore = useUserStore()
const tabBarStore = useTabBarStore()
const productStore = useProductStore()

// 搜索相关响应式数据
const searchKeyword = ref('')
const showSearchResults = ref(false)
const currentSearchKeyword = ref('')
const productListRef = ref(null)

// 使用布局store的样式计算
const searchContainerStyle = computed(() => {
  if (layoutStore.isInitialized) {
    return layoutStore.searchContainerStyle
  }
  // 布局未初始化时的默认样式
  return { top: '88px' }
})

const contentStyle = computed(() => {
  if (layoutStore.isInitialized && layoutStore.layoutInfo) {
    const layout = layoutStore.layoutInfo
    const marginTop = layout.content.startPosition + 4  // 减少间距从8px到4px
    const minHeight = layout.content.availableHeight - 4

    // 使用 layout store 计算的底部安全区域高度
    const paddingBottom = `calc(${layout.tabbar.totalHeight}px + ${layout.tabbar.safeAreaBottom}px)`

    console.log('📏 布局计算结果:', {
      statusBarHeight: layout.device.statusBarHeight,
      navbarHeight: layout.navbar.navbarHeight,
      navbarBottomPosition: layout.navbar.navbarBottomPosition,
      searchHeight: layout.search.searchHeight,
      searchTop: layout.search.searchTop,
      contentStartPosition: layout.content.startPosition,
      finalMarginTop: marginTop,
      availableHeight: layout.content.availableHeight,
      finalMinHeight: minHeight,
      tabbarHeight: layout.tabbar.height,
      tabbarTotalHeight: layout.tabbar.totalHeight,
      safeAreaBottom: layout.tabbar.safeAreaBottom,
      finalPaddingBottom: paddingBottom
    })

    return {
      marginTop: `${marginTop}px`, // 搜索框下方 + 4px间距
      minHeight: `${minHeight}px`, // 减去间距
      paddingBottom: "8px", // 使用动态计算的底部间距
      paddingTop: `${layout.search.searchHeight + 8}px` // 搜索框高度 + 8px间距，避免被搜索框遮挡
    }
  }
  // 布局未初始化时的默认样式
  return {
    marginTop: '140px',
    minHeight: 'calc(100vh - 200px)',
    paddingBottom: '80px' // 默认值
  }
})

// 搜索结果容器的样式计算
const searchResultsStyle = computed(() => {
  if (layoutStore.isInitialized && layoutStore.layoutInfo) {
    const layout = layoutStore.layoutInfo

    // 计算搜索结果容器的高度
    const contentStartPosition = layout.content.startPosition + 4 // 内容开始位置
    const tabbarTotalHeight = layout.tabbar.totalHeight + layout.tabbar.safeAreaBottom // TabBar总高度
    const availableHeight = layout.device.windowHeight - contentStartPosition - tabbarTotalHeight

    console.log('🔍 搜索结果容器高度计算:', {
      windowHeight: layout.device.windowHeight,
      contentStartPosition,
      tabbarTotalHeight,
      availableHeight
    })

    return {
      height: `${availableHeight}px`
    }
  }
  // 布局未初始化时的默认样式
  return {
    height: 'calc(100vh - 140px - 80px)'
  }
})// 等待 ProductListComponent 组件可用的工具函数 (适用于 v-if)
const waitForProductListComponent = async (maxRetries = 10) => {
	console.log('🔍 检查 ProductListComponent 可用性')

	// 使用 v-if 后，组件需要等待渲染完成后才能访问
	for (let i = 0; i < maxRetries; i++) {
		// 检查组件 ref 是否可用
		if (productListRef.value) {
			console.log('✅ ProductListComponent 组件已准备就绪')
			return true
		}

		console.log(`等待 ProductListComponent 渲染 (第${i + 1}/${maxRetries}次)`)

		// 等待一个tick周期让组件完成渲染
		await new Promise(resolve => {
			if (uni.$nextTick) {
				uni.$nextTick(resolve)
			} else {
				setTimeout(resolve, 100) // 增加等待时间，因为 v-if 需要重新渲染
			}
		})
	}

	console.error('❌ ProductListComponent 组件渲染超时')
	console.log('组件状态检查:', {
		productListRefExists: !!productListRef.value,
		showSearchResults: showSearchResults.value
	})
	return false
}


// 初始化数据的方法 - 简化版本
const initData = async () => {
	console.log('🚀 开始主页数据初始化')

	// 确保初始状态正确
	showSearchResults.value = false
	currentSearchKeyword.value = ''
	searchKeyword.value = ''

	// 立即初始化不需要网络请求的数据
	searchStore.init()

	try {
		// 调用一体化初始化API
		console.log('🚀 调用应用初始化')
		await appStore.fetchInitData()
		console.log('✅ 应用初始化成功，数据加载完成')
	} catch (error) {
		console.error('❌ 应用初始化失败:', error)
		// 失败时不做特殊处理，让 state 保持空数组状态
		// 页面会自然显示"暂无数据"的状态
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

	// 使用 v-show 后组件始终存在，只需等待一个tick确保状态更新完成
	await uni.$nextTick?.() || new Promise(resolve => setTimeout(resolve, 0))

	if (productListRef.value) {
		console.log('调用 ProductListComponent.searchWithKeyword')
		try {
			await productListRef.value.searchWithKeyword(keyword)
			console.log('搜索完成')
		} catch (error) {
			console.error('搜索调用失败:', error)
			uni.showToast({
				title: '搜索失败，请重试',
				icon: 'none'
			})
		}
	} else {
		// 如果 ref 还不可用，尝试等待组件初始化
		const componentReady = await waitForProductListComponent()
		if (componentReady && productListRef.value) {
			try {
				await productListRef.value.searchWithKeyword(keyword)
				console.log('搜索完成')
			} catch (error) {
				console.error('搜索调用失败:', error)
				uni.showToast({
					title: '搜索失败，请重试',
					icon: 'none'
				})
			}
		} else {
			console.error('productListRef 不可用')
			uni.showToast({
				title: '组件初始化失败，请重试',
				icon: 'none'
			})
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

		// 确保搜索面板被隐藏
		searchStore.hidePanel()

		// 显示搜索结果页面
		showSearchResults.value = true

		// 使用 v-show 后组件始终存在，只需等待一个tick确保状态更新完成
		await uni.$nextTick?.() || new Promise(resolve => setTimeout(resolve, 0))

		if (productListRef.value) {
			console.log('组件已准备，调用 ProductListComponent.searchByBrand')
			try {
				await productListRef.value.searchByBrand(brand.id, brand)
				console.log('品牌筛选完成')

				uni.showToast({
					title: `已切换到${brand.name_cn}`,
					icon: 'success',
					duration: 1500
				})
			} catch (error) {
				console.error('品牌筛选调用失败:', error)
				uni.showToast({
					title: '品牌数据加载失败',
					icon: 'none'
				})
			}
		} else {
			// 如果 ref 还不可用，尝试等待组件初始化
			const componentReady = await waitForProductListComponent()
			if (componentReady && productListRef.value) {
				try {
					await productListRef.value.searchByBrand(brand.id, brand)
					console.log('品牌筛选完成')

					uni.showToast({
						title: `已切换到${brand.name_cn}`,
						icon: 'success',
						duration: 1500
					})
				} catch (error) {
					console.error('品牌筛选调用失败:', error)
					uni.showToast({
						title: '品牌数据加载失败',
						icon: 'none'
					})
				}
			} else {
				console.error('productListRef 组件初始化失败')
				uni.showToast({
					title: '组件初始化失败，请重试',
					icon: 'none'
				})
			}
		}
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
	console.log('📱 主页 onLoad 开始')

	// 显示统一的加载状态
	uni.showLoading({
		title: '加载中...',
		mask: false // 不阻塞用户操作
	})

	try {
		await initData()
		console.log('📱 主页数据初始化完成')
	} catch (error) {
		console.error('📱 主页 onLoad 失败:', error)
	} finally {
		// 确保隐藏所有loading状态
		setTimeout(() => {
			uni.hideLoading()
		}, 100)
	}
})

onShow(() => {
	console.log('📱 主页 onShow')
	console.log('🔍 当前状态检查:', {
		showSearchResults: showSearchResults.value,
		currentSearchKeyword: currentSearchKeyword.value,
		searchKeyword: searchKeyword.value
	})

	// 检查是否有保存的搜索状态，如果有则保持，否则重置到默认首页
	const hasActiveSearch = showSearchResults.value || currentSearchKeyword.value

	if (!hasActiveSearch) {
		console.log('没有活跃搜索状态，重置到默认首页')
		// 重置搜索状态，回到默认首页
		searchStore.setKeyword('')
		searchStore.hidePanel()

		// 重置页面状态到默认首页
		searchKeyword.value = ''
		showSearchResults.value = false
		currentSearchKeyword.value = ''

		// 清除产品搜索结果
		productStore.clearSearchResults()
	} else {
		console.log('保持当前搜索状态:', {
			showSearchResults: showSearchResults.value,
			currentSearchKeyword: currentSearchKeyword.value
		})
		// 保持搜索状态，只重置搜索面板
		searchStore.hidePanel()
	}

	// 设置当前页面的tabBar状态
	tabBarStore.setActiveTab('index')

	// 统一隐藏所有loading状态
	setTimeout(() => {
		hideTabSwitchLoading()
		uni.hideLoading() // 确保没有残留的loading
	}, 50)
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

<style lang="scss" scoped>
/* ==================== 搜索框样式 ==================== */
// 搜索框容器 - 全局固定定位 (位置由JS动态计算)
.search-container {
	position: fixed;
	left: 0;
	right: 0;
	background-color: #f8fafc;
	z-index: 10;
	padding: 0 4%; /* 使用百分比实现响应式左右边距 */
	box-sizing: border-box;

	/* 小屏幕适配 */
	@media screen and (max-width: 375px) {
		padding: 0 3%;
	}

	/* 大屏幕适配 */
	@media screen and (min-width: 768px) {
		padding: 0 8%;
	}
}

// 搜索框包装器
.search-wrapper {
	height: 100%;
	width: 100%;
	@include flex;
	align-items: center;
}

/* up-search组件样式调整 */
:deep(.u-search) {
	border-radius: 4px;

	.u-search__content {
		background-color: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 4px;

		&--round {
			border-radius: 4px;
		}
	}

	.u-search__input-wrapper {
		padding: 0 12px;
	}

	.u-search__input {
		font-size: 14px;
		color: #333333;

		&::placeholder {
			color: #999999;
		}
	}
}

// navbar相关样式
.navbar-home-icon {
	@include flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 16px;
	background-color: rgba(255, 255, 255, 0.9);
	border: 1px solid #e8e8e8;

	&:active {
		background-color: rgba(255, 255, 255, 0.7);
	}
}

:deep(.u-navbar) {
	z-index: 12 !important;

	&.u-navbar--fixed {
		position: fixed !important;
		top: 0 !important;
		left: 0 !important;
		right: 0 !important;
	}

	.u-navbar__content {
		background-color: #ffffff !important;
		border-bottom: 1px solid #f0f0f0;
		height: 44px !important;
		display: flex !important;
		align-items: center !important;
	}

	.u-navbar__placeholder {
		height: calc(44px + var(--status-bar-height, 44px)) !important;
	}
}

/* ==================== 页面内容区域样式 ==================== */
/* 页面整体禁用滚动，防止触发onReachBottom */
page {
	height: 100vh;
	overflow: hidden;
}

// 内容区域基础样式 (marginTop, minHeight, paddingBottom 由JS动态计算)
.page-content {
	background-color: #f8fafc;
	padding: 0 4%; /* 使用百分比实现响应式内边距 */
	box-sizing: border-box;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	overflow-y: auto; /* 内容区域可以滚动 */

	/* 小屏幕适配 */
	@media screen and (max-width: 375px) {
		padding-left: 3%;
		padding-right: 3%;
	}

	/* 大屏幕适配 */
	@media screen and (min-width: 768px) {
		padding-left: 8%;
		padding-right: 8%;
	}
}

// 搜索结果页面样式 - 高度由计算属性动态设置
.search-results {
	background-color: transparent; /* 继承父容器背景 */
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	position: relative;
}

// 首页内容样式 (继承父容器的定位和尺寸)
.home-content {
	background-color: transparent; /* 继承父容器背景 */
}
</style>
