import { defineStore } from 'pinia'

export const useTabBarStore = defineStore('tabbar', {
	state: () => ({
		activeTab: 'home', // 当前激活的标签
		userType: 'normal', // 用户类型：normal(普通用户), admin(管理员), special(特殊用户)

		// 完整的菜单配置
		allTabList: [
			{
				name: 'home',
				text: '首页',
				icon: 'home-o',
				path: '/pages/index/index',
				roles: ['normal', 'admin', 'special'] // 所有用户都可以看到
			},
			{
				name: 'maintenance',
				text: '保养',
				icon: 'service-o',
				path: '/pages/maintenance/maintenance',
				roles: ['normal', 'admin'] // 只有普通用户和管理员可以看到
            },
			{
				name: 'customer',
				text: '客户',
				icon: 'contacts-o',
				path: '/pages/customer/customer',
				roles: ['admin'] // 只有管理员可以看到
			},
			{
				name: 'rolex',
				text: '劳力士',
				icon: 'diamond-o',
				path: '/pages/rolex/rolex',
				roles: ['normal', 'special'] // 所有用户都可以看到，但特殊用户只看这个
			},
			{
				name: 'profile',
				text: '我的',
				icon: 'user-o',
				path: '/pages/profile/profile',
				roles: ['normal', 'admin', 'special'] // 所有用户都可以看到
			}
		]
	}),

	getters: {
		// 根据当前用户类型动态计算可见的tabList
		tabList(state) {
			if (state.userType === 'special') {
				// 特殊用户只显示劳力士菜单
				return state.allTabList.filter(tab => ['home', 'rolex', 'profile'].includes(tab.name))
			}

			// 普通用户和管理员根据roles过滤
			return state.allTabList.filter(tab => tab.roles.includes(state.userType))
		},

		// 获取当前激活的标签信息
		currentTab(state) {
			return state.tabList.find(tab => tab.name === state.activeTab)
		},

		// 根据路径获取对应的标签名称
		getTabByPath: (state) => (path) => {
			return state.tabList.find(tab => tab.path === path)
		},

		// 获取当前用户类型的显示名称
		userTypeText(state) {
			const typeMap = {
				'normal': '普通用户',
				'admin': '管理员',
				'special': '特殊用户'
			}
			return typeMap[state.userType] || '未知用户'
		}
	},

	actions: {
		// 设置用户类型
		setUserType(userType) {
			if (['normal', 'admin', 'special'].includes(userType)) {
				this.userType = userType
				console.log('🏷️ 用户类型更新:', userType)

				// 检查当前激活的标签是否在新的tabList中
				const currentTabExists = this.tabList.find(t => t.name === this.activeTab)
				if (!currentTabExists) {
					// 如果当前标签不在新列表中，切换到首页
					this.setActiveTab('home')
				}
			}
		},

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
			try {
				const tab = this.getTabByPath(currentPath)
				if (tab) {
					this.activeTab = tab.name
					console.log('🏷️ 根据路径自动设置标签:', tab.name)
				} else {
					console.log('🏷️ 未找到匹配的标签，路径:', currentPath)
				}
			} catch (error) {
				console.error('🏷️ 设置激活标签时出错:', error, '路径:', currentPath)
			}
		}
	}
})
