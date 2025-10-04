import { defineStore } from 'pinia'

export const useTabBarStore = defineStore('tabbar', {
	state: () => ({
		activeTab: 'home', // 当前激活的标签
		tabList: [
			{
				name: 'home',
				text: '首页',
				icon: 'home-o',
				path: '/pages/index/index'
			},
			{
				name: 'maintenance',
				text: '保养',
				icon: 'service-o',
				path: '/pages/maintenance/maintenance'
			},
			{
				name: 'rolex',
				text: '劳力士',
				icon: 'diamond-o',
				path: '/pages/rolex/rolex'
			},
			{
				name: 'profile',
				text: '我的',
				icon: 'user-o',
				path: '/pages/profile/profile'
			}
		]
	}),

	getters: {
		// 获取当前激活的标签信息
		currentTab(state) {
			return state.tabList.find(tab => tab.name === state.activeTab)
		},

		// 根据路径获取对应的标签名称
		getTabByPath: (state) => (path) => {
			return state.tabList.find(tab => tab.path === path)
		}
	},

	actions: {
		// 设置当前激活的标签
		setActiveTab(tabName) {
			const tab = this.tabList.find(t => t.name === tabName)
			if (tab) {
				this.activeTab = tabName
				console.log('🏷️ TabBar状态更新:', tabName)
			}
		},

		// 切换标签并跳转页面
		switchTab(tabName) {
			const tab = this.tabList.find(t => t.name === tabName)
			if (tab) {
				this.setActiveTab(tabName)
				console.log('🏷️ 切换标签:', tabName, '跳转到:', tab.path)
				uni.switchTab({
					url: tab.path,
					success: () => {
						console.log('✅ 标签切换成功')
					},
					fail: (err) => {
						console.error('❌ 标签切换失败:', err)
					}
				})
			}
		},

		// 根据当前页面路径自动设置激活标签
		setActiveTabByPath(currentPath) {
			const tab = this.getTabByPath(currentPath)
			if (tab) {
				this.activeTab = tab.name
				console.log('🏷️ 根据路径自动设置标签:', tab.name)
			}
		}
	}
})
