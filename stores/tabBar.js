import { defineStore } from 'pinia'

export const useTabBarStore = defineStore('tabbar', {
	state: () => ({
		activeTab: 'home', // 当前激活的标签
		userType: 'normal', // 用户类型：normal(普通用户), admin(管理员), special(特殊用户), anonymous(匿名用户)

		// 完整的菜单配置
		allTabList: [
			{
				name: 'home',
				text: '首页',
				icon: 'home-o',
				path: '/pages/index/index',
				roles: ['anonymous','normal', 'admin', 'special'] // 所有用户都可以看到
            },
            {
				name: 'recruitment',
				text: '我的招聘',
				icon: 'info-circle',
				path: '/pages/recruitment/recruitment',
				roles: ['anonymous'] // 只有匿名用户可以看到
			},
			{
				name: 'maintenance',
				text: '保养',
				icon: 'service-o',
				path: '/pages/maintenance/maintenance',
				roles: ['anonymous','normal', 'admin'] // 只有普通用户和管理员可以看到
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
				roles: ['anonymous','normal', 'special'] // 所有用户都可以看到，但特殊用户只看这个
			},

			{
				name: 'profile',
				text: '我的',
				icon: 'user-o',
				path: '/pages/profile/profile',
				roles: ['anonymous','normal', 'admin', 'special'] // 所有用户都可以看到
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
				'special': '特殊用户',
				'anonymous': '匿名用户'
			}
			return typeMap[state.userType] || '未知用户'
		}
	},

	actions: {
		// 设置用户类型
		setUserType(userType) {
			console.log('🔍 tabBarStore.setUserType - 开始执行:', {
				newUserType: userType,
				oldUserType: this.userType,
				timestamp: new Date().toLocaleTimeString()
			});

			if (['normal', 'admin', 'special', 'anonymous'].includes(userType)) {
				this.userType = userType
				console.log('🏷️ 用户类型更新成功:', userType)
				console.log('🏷️ 当前 tabBarStore.userType:', this.userType)

				// 检查当前激活的标签是否在新的tabList中
				const currentTabExists = this.tabList.find(t => t.name === this.activeTab)
				console.log('🏷️ 当前激活标签检查:', {
					activeTab: this.activeTab,
					currentTabExists: !!currentTabExists,
					newTabList: this.tabList.map(t => t.name)
				});

				if (!currentTabExists) {
					// 如果当前标签不在新列表中，切换到合适的默认页面
					if (userType === 'anonymous') {
						this.setActiveTab('recruitment')
					} else {
						this.setActiveTab('home')
					}
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

		// 带loading的切换标签方法
		switchTabWithLoading(tabName) {
			const tab = this.tabList.find(t => t.name === tabName)
			if (tab) {
				// 通过全局状态管理loading，避免循环依赖
				uni.$emit('showTabSwitchLoading', tabName)

				this.setActiveTab(tabName)
				console.log('🏷️ 切换标签 (带Loading):', tabName, '跳转到:', tab.path)

				uni.switchTab({
					url: tab.path,
					success: () => {
						console.log('✅ 标签切换成功')
						// 进一步缩短延迟时间，几乎立即隐藏
						setTimeout(() => {
							uni.$emit('hideTabSwitchLoading')
						}, 100)
					},
					fail: (err) => {
						console.error('❌ 标签切换失败:', err)
						uni.$emit('hideTabSwitchLoading')
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
