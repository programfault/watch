import { defineStore } from 'pinia';

export const useToolbarStore = defineStore('toolbar', {
	state: () => ({
		// 价格排序状态：'none' | 'asc' | 'desc'
		sortOrder: 'none',
		// 筛选是否激活
		isFilterActive: false,
		// 显示模式：'single' | 'grid'
		displayMode: 'single',
		// 活跃的筛选条件数量
		filterCount: 0,
	}),

	getters: {
		// 是否有排序
		hasSorting: (state) => state.sortOrder !== 'none',

		// 获取排序参数，用于API调用
		getSortParams: (state) => {
			if (state.sortOrder === 'none') return {};
			return {
				sort_by: 'price',
				sort_order: state.sortOrder
			};
		},
	},

	actions: {
		// 切换价格排序
		togglePriceSort() {
			switch (this.sortOrder) {
				case 'none':
					this.sortOrder = 'asc';
					break;
				case 'asc':
					this.sortOrder = 'desc';
					break;
				case 'desc':
					this.sortOrder = 'none';
					break;
			}
		},

		// 设置价格排序
		setPriceSort(order) {
			if (['none', 'asc', 'desc'].includes(order)) {
				this.sortOrder = order;
			}
		},

		// 切换筛选状态
		toggleFilter() {
			this.isFilterActive = !this.isFilterActive;
		},

		// 设置筛选状态
		setFilterActive(active) {
			this.isFilterActive = active;
		},

		// 设置筛选条件数量
		setFilterCount(count) {
			this.filterCount = count;
		},

		// 设置显示模式
		setDisplayMode(mode) {
			if (['single', 'grid'].includes(mode)) {
				this.displayMode = mode;
			}
		},

		// 重置所有状态
		resetToolbar() {
			this.sortOrder = 'none';
			this.isFilterActive = false;
			this.displayMode = 'single';
			this.filterCount = 0;
		},
	},
});
