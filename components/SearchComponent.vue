<template>
	<view class="search-container">
		<!-- 搜索框 -->
		<view class="search-box">
			<uv-search
				:placeholder="searchPlaceholder"
				v-model="keyword"
				:showAction="true"
				actionText="取消"
				:animation="true"
				shape="square"
				@focus="onFocus"
				@clear="onClear"
				@search="onSearch"
				@custom="onCancel"
				@change="onInput"
				@blur="onBlur"
			></uv-search>
		</view>

		<!-- 搜索面板 (历史记录和热门搜索) -->
		<view class="search-panel" v-if="searchStore.showSearchPanel">
			<!-- 搜索历史 -->
			<view class="search-history">
				<view class="history-header">
					<text class="history-title">搜索历史</text>
					<text
						class="clear-btn"
						v-if="searchStore.validSearchHistory.length > 0"
						@click="clearHistory"
						>清空</text
					>
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

		<!-- 加载状态 -->
		<view class="loading" v-if="searchStore.loading">
			<uv-loading-icon mode="circle" />
		</view>
	</view>
</template>

<script setup>
import { useSearchStore } from "@/stores";
import { computed, onMounted, ref, watch } from "vue";

// 定义组件名称
defineOptions({
	name: "SearchComponent",
});

// 定义事件
const emit = defineEmits(['search']);

// 定义props
const props = defineProps({
	from: {
		type: String,
		default: "",
		validator: (value) => {
			// 可以添加验证逻辑，比如限制from的可选值
			return [
				"",
				"home",
				"index",
				"product",
				"customer",
				"maintenance",
				"rolex",
				"profile",
			].includes(value);
		},
	},
});

// 获取stores
const searchStore = useSearchStore();

// 响应式数据
const keyword = ref("");
const lastSearchTime = ref(0); // 防抖用的时间戳

// 计算属性
const searchPlaceholder = computed(() => {
	switch (props.from) {
		case "home":
			return "搜索劳力士、保养服务、客户...";
		case "index":
			return "搜索品牌、手表、服务...";
		case "product":
			return "搜索手表型号、品牌...";
		case "customer":
			return "搜索客户姓名、手机号...";
		case "maintenance":
			return "搜索保养服务、手表型号...";
		case "rolex":
			return "搜索劳力士系列、型号...";
		case "profile":
			return "搜索订单、优惠券...";
		default:
			return "搜索劳力士、保养服务、客户...";
	}
});

// 监听器
watch(
	() => searchStore.keyword,
	(newKeyword) => {
		keyword.value = newKeyword;
	},
	{ immediate: true }
);

watch(keyword, (newKeyword) => {
	searchStore.setKeyword(newKeyword);
});

// 生命周期 - onMounted
onMounted(() => {
	console.log(`SearchComponent mounted from: ${props.from}`);
	console.log(`Search placeholder: ${searchPlaceholder.value}`);
	searchStore.init();
});

// 方法定义
// 输入事件
const onInput = (value) => {
	searchStore.setKeyword(value);
};

const checkFrom = async (from, keyword) => {
    if(props.from === 'home' || props.from === 'index'){
        searchStore.hidePanel()
        uni.navigateTo({
            url:`/pages/product/list?keyword=${encodeURIComponent(keyword)}`
        })
    } else if (props.from === 'product') {
        // 产品页面发出搜索事件，让父组件处理
        console.log('SearchComponent 发出搜索事件:', { keyword })
        emit('search', { keyword })
        searchStore.hidePanel()
    } else {
        // 其他页面直接执行搜索
        await searchStore.performSearch(keyword)
        searchStore.hidePanel()
    }
}

// 搜索事件 (确认搜索)
const onSearch = async (e) => {
	console.log("onsearch", e);

	// 防抖处理：防止短时间内多次触发
	const now = Date.now();
	if (now - lastSearchTime.value < 500) {
		console.log("搜索被防抖拦截");
		return;
	}
	lastSearchTime.value = now;

	// 获取关键词，优先使用事件传递的值
	const keyword =
		(e && typeof e === "object" ? e.value : e) || searchStore.keyword;

	if (!keyword || !keyword.trim()) {
		uni.showToast({
			title: "请输入搜索关键词",
			icon: "none",
		});
		return;
	}

	// 添加到搜索历史
	searchStore.addToHistory(keyword);

	await checkFrom(props.from, keyword);
};

// 清空输入
const onClear = (e) => {
	searchStore.clearResults();
};

// 取消搜索
const onCancel = (e) => {
	searchStore.setKeyword("");
	searchStore.hidePanel();
};

// 获得焦点
const onFocus = (e) => {
	console.log("on fucs");
	searchStore.showPanel();
};

// 失去焦点
const onBlur = (e) => {};

// 关闭搜索面板
const closePanel = () => {
	searchStore.hidePanel();
};

// 选择历史记录
const selectHistory = async (keyword) => {
	searchStore.setKeyword(keyword);
	await checkFrom(props.from, keyword);
};

// 删除历史记录
const removeHistory = (keyword) => {
	searchStore.removeHistoryItem(keyword);
};

// 清空历史记录
const clearHistory = () => {
	uni.showModal({
		title: "提示",
		content: "确定要清空搜索历史吗？",
		success: (res) => {
			if (res.confirm) {
				searchStore.clearHistory();
			}
		},
	});
};
</script>

<style lang="scss">
.search-container {
	.search-box {
		margin-bottom: 10px;
	}

	.search-panel {
		padding: 15px;
		margin-bottom: 20px;
	}

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
				background: #f5f5f5;
				border: 1px solid #ddd;
				border-radius: 4px;
				cursor: pointer;
				transition: all 0.2s ease;

				&:hover {
					background: #eee;
					border-color: #ccc;
				}

				&:active {
					background: #e0e0e0;
				}

				.history-text {
					font-size: 13px;
					color: #666;
					white-space: nowrap;
				}
			}
		}

		.empty-history {
			text-align: center;
			padding: 20px 0;

			.empty-text {
				font-size: 14px;
				color: #999;
			}
		}
	}

	.hot-search {
		margin-bottom: 20px;

		.hot-header {
			margin-bottom: 10px;

			.hot-title {
				font-size: 16px;
				font-weight: bold;
				color: #333;
			}
		}

		.hot-list {
			display: flex;
			flex-wrap: wrap;
			gap: 10px;

			.hot-item {
				padding: 6px 12px;
				background: #f0f0f0;
				border-radius: 15px;
				font-size: 12px;
				color: #666;
				cursor: pointer;
				transition: background-color 0.2s ease;

				&:hover {
					background: #e0e0e0;
				}
			}
		}

		.empty-hot {
			text-align: center;
			padding: 20px 0;

			.empty-text {
				font-size: 14px;
				color: #999;
			}
		}
	}

	.search-results {
		.results-header {
			margin-bottom: 10px;

			.results-title {
				font-size: 16px;
				font-weight: bold;
				color: #333;
			}
		}

		.results-list {
			.result-item {
				padding: 15px;
				background: #fff;
				border-radius: 8px;
				margin-bottom: 10px;
				box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

				.result-title {
					font-size: 16px;
					color: #333;
					margin-bottom: 5px;
				}

				.result-type {
					font-size: 12px;
					color: #007aff;
					background: #f0f8ff;
					padding: 2px 6px;
					border-radius: 4px;
				}
			}
		}
	}

	.loading {
		text-align: center;
		padding: 20px;
	}
}
</style>
