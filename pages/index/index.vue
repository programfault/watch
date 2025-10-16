<template>
    <up-navbar
        title="天辰手表"
        :fixed="true"
        :safe-area-inset-top="true"
        :placeholder="true"
        bg-color="#ffffff"
        title-color="#333333"
        height="44"
        @leftClick="leftClick"
    >
        <template #left v-if="showSearchResults">
            <view class="navbar-home-icon">
                <up-icon name="home" size="20" color="#666666"></up-icon>
            </view>
        </template>
    </up-navbar>

	<!-- 固定搜索框容器 -->
	<view class="search-container">
		<view class="search-wrapper">
            <up-search
                placeholder="搜索品牌、手表、服务..."
                v-model="searchKeyword"
                :show-action="searchStore.showSearchPanel"
                :action-text='取消'
                :animation="true"
                shape="square"
                bg-color="#ffffff"
                border-color="#e5e5e5"
                @focus="onSearchFocus"
                @search="onSearch"
                @custom="onSearchAction"
                @clear="onSearchClear"
                @change="onSearchInput"
            ></up-search>
        </view>
	</view>

	<!-- 搜索历史面板 -->
	<SearchHistoryPanel
		:visible="searchStore.showSearchPanel"
		@select-history="selectHistory"
		@clear-history="clearHistory"
	/>

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

    <!-- 悬浮客服按钮 -->
    <FloatingServiceButton />

    <CustomTabBar />
</template>

<script setup>
import BrandsComponent from '@/components/BrandsComponent.vue'
import CarouselComponent from '@/components/CarouselComponent.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import FloatingServiceButton from '@/components/FloatingServiceButton.vue'
import ProductListComponent from '@/components/ProductListComponent.vue'
import SearchHistoryPanel from '@/components/SearchHistoryPanel.vue'
import { useAppStore, useProductStore, useSearchStore, useTabBarStore, useUserStore } from '@/stores'
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
const userStore = useUserStore()
const tabBarStore = useTabBarStore()
const productStore = useProductStore()

// 搜索相关响应式数据
const searchKeyword = ref('')
const showSearchResults = ref(false)
const currentSearchKeyword = ref('')
const productListRef = ref(null)

// 等待 ProductListComponent 组件渲染完成的工具函数
const waitForProductListComponent = async (maxRetries = 10) => {
	// 检查渲染条件
	console.log('🔍 检查组件渲染条件:')
	console.log('  showSearchResults:', showSearchResults.value)
	console.log('  searchStore.showSearchPanel:', searchStore.showSearchPanel)
	console.log('  渲染条件结果:', showSearchResults.value && !searchStore.showSearchPanel)

	// 首先确保搜索结果页面已显示且搜索面板已隐藏，这样组件才会被渲染
	if (!showSearchResults.value || searchStore.showSearchPanel) {
		console.log('⚠️  组件渲染条件不满足，组件不会被渲染')
		console.log('  需要: showSearchResults=true 且 searchStore.showSearchPanel=false')
		return false
	}

	for (let i = 0; i < maxRetries; i++) {
		console.log(`等待 ProductListComponent 渲染 (第${i + 1}/${maxRetries}次)`)

		// 先等待DOM更新
		await new Promise(resolve => {
			if (uni.$nextTick) {
				uni.$nextTick(resolve)
			} else {
				setTimeout(resolve, 50)
			}
		})

		// 检查组件是否已经渲染
		if (productListRef.value) {
			console.log('✅ ProductListComponent 组件已准备就绪')
			return true
		}

		// 如果还没有，再等待一小段时间
		if (i < maxRetries - 1) {
			await new Promise(resolve => setTimeout(resolve, 100))
		}
	}

	console.error('❌ ProductListComponent 组件等待超时')
	console.log('最终状态检查:')
	console.log('  showSearchResults:', showSearchResults.value)
	console.log('  searchStore.showSearchPanel:', searchStore.showSearchPanel)
	console.log('  productListRef.value:', !!productListRef.value)
	return false
}


// 初始化数据的方法 - 简化版本
const initData = async () => {
	console.log('🚀 开始主页数据初始化')

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

	// 等待组件渲染完成
	const componentReady = await waitForProductListComponent()

	if (componentReady && productListRef.value) {
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
		console.error('productListRef 不存在或等待超时')
		uni.showToast({
			title: '组件加载失败，请重试',
			icon: 'none'
		})
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

		// 等待组件渲染完成
		const componentReady = await waitForProductListComponent()

		if (componentReady && productListRef.value) {
			console.log('组件已加载，调用 ProductListComponent.searchByBrand')
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
			console.error('productListRef 组件不存在或等待超时')
			uni.showToast({
				title: '组件加载失败，请重试',
				icon: 'none'
			})
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
// 固定搜索框容器样式
.search-container {
    position: fixed;
    top: calc(44px + var(--status-bar-height, 44px));
    left: 0;
    right: 0;
    height: 44px;
    background-color: #f8f8f8;
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
    padding: 0;
    height: 100%;
    width: 100%; /* 确保占满容器宽度 */
    @include flex;
    align-items: center;
}

/* up-search组件样式调整 */
:deep(.u-search) {
    width: 100%; /* 确保搜索框占满包装器宽度 */
    border-radius: 12px;
    height: 40px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    flex: 1; /* 让搜索框占据所有可用空间 */

    .u-search__content {
        background-color: #ffffff;
        border: 1px solid #e8e8e8;
        border-radius: 12px;
        height: 38px;
        width: 100%; /* 确保内容区域占满宽度 */
        display: flex;
        align-items: center;

        &--round {
            border-radius: 12px;
        }
    }

    .u-search__input-wrapper {
        padding: 0 16px;
        height: 36px;
        flex: 1; /* 让输入区域占据剩余空间 */
        min-width: 0; /* 允许收缩 */
    }

    .u-search__input {
        font-size: 15px;
        color: #333333;
        height: 36px;
        line-height: 36px;
        width: 100%; /* 确保输入框占满可用宽度 */
        border: none;
        outline: none;
        background: transparent;

        &::placeholder {
            color: #999999;
            font-size: 14px;
        }
    }

    .u-search__action {
        padding: 0 12px;
        font-size: 14px;
        color: #007aff;
        white-space: nowrap; /* 防止按钮文字换行 */
        flex-shrink: 0; /* 防止按钮被压缩 */
    }

    .u-search__icon {
        padding: 0 8px;
        flex-shrink: 0; /* 防止图标被压缩 */
    }

    .u-icon {
        color: #666666 !important;
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

// 搜索结果页面样式 - 简化计算
.search-results {
    background-color: #f8f8f8;
    margin-top: calc(44px + var(--status-bar-height, 44px) + 44px + 8px);
    min-height: calc(100vh - 44px - var(--status-bar-height, 44px) - 44px - 8px - 70px);
    padding-bottom: calc(100px + env(safe-area-inset-bottom));
}

// 主容器样式 - 简化计算
.container {
    min-height: calc(100vh - 44px - var(--status-bar-height, 44px) - 44px - 8px - 70px);
    padding: 4%; /* 使用百分比实现响应式内边距 */
    margin-top: calc(44px + var(--status-bar-height, 44px) + 44px + 8px);
    padding-top: 20px;
    padding-bottom: calc(100px + env(safe-area-inset-bottom));
    background-color: #f8f8f8;
    box-sizing: border-box;

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

</style>
