import {
    addCustomer,
    getBenefits,
    getConsumers,
    getCustomers,
    getUserInfo,
    login,
    refreshToken
} from "@/api";
import { useTabBarStore } from '@/stores/tabBar';
import { defineStore } from "pinia";
export const useUserStore = defineStore("user", {
	state: () => ({
		// 用户信息
		userInfo: null,
		isLoggedIn: false,  // 默认未登录状态，需要通过检查token来确定
		userInfoLoading: false,

		// 登录状态
		loginLoading: false,

		// token 信息
		tokens: null,

		// 客户管理
		customers: [],
		customersLoading: false,
		customersPage: 1,
		customersPageSize: 20,
		customersTotal: 0,
		customersHasMore: true,

		// 消费者管理
		consumers: [],
		consumersLoading: false,
		consumersTotal: 0,
		consumersSearchKeyword: "", // 消费者搜索关键词
		consumersCardNumber: "", // 消费者搜索会员卡号

		// 福利管理（优惠券和特权）
		benefits: {
			coupons: [],
			privileges: [],
			coupons_count: 0,
			privileges_count: 0,
			total_count: 0,
			filters: {
				type: null,
				status: "active",
			},
		},
		benefitsLoading: false,

		// 权限相关
		permissions: [],

		// 用户设置
		settings: {
			notifications: true,
			theme: "light",
			language: "zh-CN",
		},
	}),

	// 配置持久化
	persist: {
		key: 'user-store',
		paths: ['userInfo', 'isLoggedIn', 'tokens', 'settings', 'permissions'],
	},

	getters: {
		// 用户昵称
		nickname: (state) => {
			return state.userInfo?.nickname || "未登录";
		},

		// 用户头像
		avatar: (state) => {
			return state.userInfo?.avatar || "/static/default-avatar.png";
		},

		// 是否是管理员
		isAdmin: (state) => {
			return parseInt(state.userInfo?.status) === 1; // status=1 是管理员（兼容字符串类型）
		},

		// 是否有特定权限
		hasPermission: (state) => (permission) => {
			return state.permissions.includes(permission);
		},

		// 是否有客户管理权限
		hasCustomerPermission: (state) => {
			const status = parseInt(state.userInfo?.status);
			return (
				state.isLoggedIn &&
				(state.permissions.includes("customer_management") ||
					status === 1) // status=1 是管理员（兼容字符串类型）
			);
		},

		// VIP 客户列表
		vipCustomers: (state) => {
			return state.customers.filter((customer) => customer.level === "vip");
		},

		// 消费者列表是否有数据
		hasConsumers: (state) => {
			return state.consumers.length > 0;
		},

		// 消费者总数
		consumersCount: (state) => {
			return state.consumers.length;
		},

		// 过滤后的消费者列表（根据搜索关键词）
		filteredConsumers: (state) => {
			console.log("🔍 filteredConsumers计算开始:", {
				consumersLength: state.consumers?.length || 0,
				searchKeyword: state.consumersSearchKeyword,
				cardNumber: state.consumersCardNumber,
			});

			// 打印前3个消费者的完整信息，用于调试
			if (state.consumers && state.consumers.length > 0) {
				console.log("🔍 前3个消费者数据样本:", state.consumers.slice(0, 3));
			}

			if (!state.consumersSearchKeyword && !state.consumersCardNumber) {
				console.log(
					"无搜索关键词，返回全部consumers:",
					state.consumers?.length || 0,
				);
				return state.consumers || [];
			}

			const keyword = state.consumersSearchKeyword.toLowerCase().trim();
			const cardNumber = state.consumersCardNumber.toLowerCase().trim();
			const filtered = (state.consumers || []).filter((consumer) => {
				// 搜索手机号和卡号
				const phone = (consumer.phone || "").toLowerCase();
				const consumerCardNumber = (consumer.card_number || "").toLowerCase();
                console.log("🔍 检查消费者:", {
					name: consumer.name || "未知",
					phone: consumer.phone || "无",
					card_number: consumer.card_number || "无",
					consumerCardNumber: consumerCardNumber,
					searchCardNumber: cardNumber
				});
				// 如果有卡号搜索条件，优先精确匹配卡号
				if (cardNumber) {
					return consumerCardNumber.includes(cardNumber);
				}

				// 否则使用关键词搜索手机号和卡号
				return phone.includes(keyword) || consumerCardNumber.includes(keyword);
			});

			console.log("搜索过滤结果:", {
				keyword: keyword,
				filteredLength: filtered.length,
			});

			return filtered;
		}, // 过滤后的消费者数量
		filteredConsumersCount: (_state, getters) => {
			return getters.filteredConsumers.length;
		},

		// 是否有过滤后的消费者数据
		hasFilteredConsumers: (state) => {
			// 直接基于 state 计算，避免 getter 依赖问题
			if (!state.consumersSearchKeyword && !state.consumersCardNumber) {
				const hasData = state.consumers && state.consumers.length > 0;
				console.log("hasFilteredConsumers计算(无搜索):", {
					consumersLength: state.consumers?.length || 0,
					hasData: hasData,
				});
				return hasData;
			} else {
				const keyword = state.consumersSearchKeyword.toLowerCase().trim();
				const cardNumber = state.consumersCardNumber.toLowerCase().trim();
				const filtered = (state.consumers || []).filter((consumer) => {
					// 搜索手机号和卡号
					const phone = (consumer.phone || "").toLowerCase();
					const consumerCardNumber = (consumer.card_number || "").toLowerCase();

					// 如果有卡号搜索条件，优先精确匹配卡号
					if (cardNumber) {
						return consumerCardNumber.includes(cardNumber);
					}

					// 否则使用关键词搜索手机号和卡号
					return phone.includes(keyword) || consumerCardNumber.includes(keyword);
				});
				const hasData = filtered.length > 0;
				console.log("hasFilteredConsumers计算(有搜索):", {
					keyword: keyword,
					cardNumber: cardNumber,
					filteredLength: filtered.length,
					hasData: hasData,
				});
				return hasData;
			}
		},

		// 福利相关 getters
		hasBenefits: (state) => {
			return (
				state.benefits.coupons.length > 0 ||
				state.benefits.privileges.length > 0
			);
		},

		// 可用优惠券数量
		availableCouponsCount: (state) => {
			return state.benefits.coupons.filter(
				(coupon) => coupon.is_valid && coupon.status,
			).length;
		},

		// 可用特权数量
		availablePrivilegesCount: (state) => {
			return state.benefits.privileges.filter(
				(privilege) => privilege.is_valid && privilege.status,
			).length;
		},

		// 获取所有优惠券（响应式）
		benefitsCoupons: (state) => {
			return state.benefits.coupons || [];
		},

		// 获取所有特权（响应式）
		benefitsPrivileges: (state) => {
			return state.benefits.privileges || [];
		},
	},

	actions: {
		// 初始化用户状态（应用启动时调用）
		async initUserState() {
			console.log('🔍 initUserState - 开始执行');
			// 检查是否刚登录，避免重复验证token
			const justLoggedIn = uni.getStorageSync("justLoggedIn");
			if (justLoggedIn === "true") {
				console.log("刚登录，跳过token验证");
				uni.removeStorageSync("justLoggedIn");
				return;
			}

			// 统一调用checkLoginStatus方法，确保逻辑一致
			await this.checkLoginStatus();
			console.log('🔍 initUserState - 执行完成');
		},

		// 微信小程序登录
		async loginUser(loginData) {
			if (this.loginLoading) return;

			this.loginLoading = true;

			// 在登录开始时就设置防跳转标志
			uni.setStorageSync("justLoggedIn", "true");

			try {
				const response = await login(loginData);

				if (response.success) {
					const { user, tokens, session_key, coupons, privileges } = response.data;

					this.userInfo = {
						...user,
						coupons: coupons || [],
						privileges: privileges || []
					};

					// 先设置登录状态，再设置权限，确保 updateTabBarUserType 时 isLoggedIn 为 true
					this.isLoggedIn = true;

					// 根据用户状态设置权限
					this.setUserPermissions(user);

					// 确保tokens是纯净的对象
					const cleanTokens = {
						access_token: tokens.access_token,
						refresh_token: tokens.refresh_token,
						token_type: tokens.token_type || 'bearer',
						expires_in: tokens.expires_in,
						refresh_expires_in: tokens.refresh_expires_in
					};

					this.tokens = cleanTokens;

					// 保存session_key到本地存储
					if (session_key) {
						uni.setStorageSync("session_key", session_key);
					}

					// 登录成功，设置最后登录时间戳，避免initUserState重复验证token
					const loginTime = Date.now();
					uni.setStorageSync("lastLoginTime", loginTime);

					return response.data;
				} else {
					throw new Error(response.message || "登录失败");
				}
			} catch (error) {
				console.error("登录失败:", error);
				this.logout(false); // 登录失败时只清理状态，不跳转页面
				throw error;
			} finally {
				this.loginLoading = false;
			}
		},

		// 获取用户信息
		async fetchUserInfo(forceRefresh = false) {
			if (this.userInfoLoading && !forceRefresh) {
				console.log('🔍 fetchUserInfo - 正在加载中，跳过重复请求');
				return;
			}

			console.log('🔍 fetchUserInfo - 开始执行，当前登录状态:', this.isLoggedIn);
			console.log('🔍 fetchUserInfo - 强制刷新模式:', forceRefresh);
			console.log('🔍 fetchUserInfo - 当前tokens状态:', this.tokens ? '存在' : '不存在');
			if (this.tokens) {
				console.log('🔍 fetchUserInfo - access_token预览:', this.tokens.access_token?.substring(0, 10) + '...');
			}

			this.userInfoLoading = true;

			try {
				console.log('🔍 fetchUserInfo - 准备调用getUserInfo API');
				const response = await getUserInfo();
				console.log('🔍 fetchUserInfo - API响应成功:', response);

				// 处理不同的响应格式
				if (response.success !== undefined) {
					// 标准格式 {success, data, message}
					if (response.success) {
						// 合并用户信息，优先使用API返回的优惠券和特权数据
						this.userInfo = {
							...this.userInfo,
							...response.data.user,
							coupons: response.data.coupons || this.userInfo?.coupons || [],
							privileges: response.data.privileges || this.userInfo?.privileges || []
						};

						// 根据用户状态设置权限
						this.setUserPermissions(response.data.user);

						// 更新登录状态
						this.isLoggedIn = true;

						// 更新最后登录时间
						const loginTime = Date.now();
						uni.setStorageSync("lastLoginTime", loginTime);
						console.log('🔍 fetchUserInfo - 刷新成功，已更新用户信息和登录时间');

						return response.data;
					} else {
						console.log('🔍 fetchUserInfo - API返回失败状态:', response);
						throw new Error(response.message || "获取用户信息失败");
					}
				} else {
					// 直接返回数据的格式（兼容旧版API）
					console.log('🔍 fetchUserInfo - 处理直接返回的数据格式');
					// 合并用户信息，优先使用API返回的优惠券和特权数据
					this.userInfo = {
						...this.userInfo,
						...response.user,
						coupons: response.coupons || this.userInfo?.coupons || [],
						privileges: response.privileges || this.userInfo?.privileges || []
					};

					// 根据用户状态设置权限
					this.setUserPermissions(response.user);

					// 更新登录状态
					this.isLoggedIn = true;

					// 更新最后登录时间
					const loginTime = Date.now();
					uni.setStorageSync("lastLoginTime", loginTime);
					console.log('🔍 fetchUserInfo - 刷新成功（直接数据格式），已更新用户信息和登录时间');

					return response;
				}
			} catch (error) {
				console.error('🔍 fetchUserInfo - 捕获异常:', error);
				console.error('🔍 fetchUserInfo - 异常详情:', {
					message: error.message,
					response: error.response,
					config: error.config
				});

				// 获取用户信息失败时，清除用户状态
				console.log('🔍 fetchUserInfo - 失败后执行logout(false)清理状态');
				this.logout(false); // 只清理状态，不跳转页面
				throw error;
			} finally {
				this.userInfoLoading = false;
				console.log('🔍 fetchUserInfo - 请求结束');
			}
		},

		// 用户登出
		logout(redirect = true) {
            const tabbarStore = useTabBarStore();
			console.log('logout 方法被调用，redirect:', redirect);

			// 清理状态
			this.userInfo = null;
			this.isLoggedIn = false;
			this.tokens = null;

			// 清理本地存储中插件不管理的数据
			uni.removeStorageSync("session_key");
			uni.removeStorageSync("lastLoginTime");
			uni.removeStorageSync("justLoggedIn");

			// 清理客户数据
			this.customers = [];
			this.customersPage = 1;
			this.customersTotal = 0;
			this.customersHasMore = true;

			// 清理消费者数据
			this.consumers = [];
			this.consumersTotal = 0;
			this.consumersSearchKeyword = "";
			this.consumersCardNumber = "";

			// 清理福利数据
			this.benefits.coupons = [];
			this.benefits.privileges = [];
			this.benefits.coupons_count = 0;
			this.benefits.privileges_count = 0;
			this.benefits.total_count = 0;

			// 重置权限
			this.permissions = [];

			// 自动更新tabBar用户类型（登出时会设置为anonymous）
			this.updateTabBarUserType();

			// 如果需要跳转到登录页
			if (redirect) {
				// 使用 uni.reLaunch 确保完全退出到首页
				uni.reLaunch({
					url: "/pages/index/index"
				});
			}
		},		// 刷新用户token
		async refreshUserToken() {
			if (!this.tokens?.refresh_token) {
				this.logout();
				return false;
			}

			try {
				const response = await refreshToken(this.tokens.refresh_token);

				if (response.success) {
					const newTokens = response.data.tokens;

					// 更新tokens
					this.tokens = {
						...this.tokens,
						access_token: newTokens.access_token,
						expires_in: newTokens.expires_in,
						refresh_expires_in: newTokens.refresh_expires_in
					};

					return true;
				} else {
					console.error("刷新token失败:", response.message);
					this.logout();
					return false;
				}
			} catch (error) {
				console.error("刷新token异常:", error);
				this.logout();
				return false;
			}
		},



		// 获取客户列表
		async fetchCustomers(params = {}, isLoadMore = false) {
			if (this.customersLoading) return;

			this.customersLoading = true;
			try {
				const requestParams = {
					page: isLoadMore ? this.customersPage : 1,
					pageSize: this.customersPageSize,
					...params,
				};

				const data = await getCustomers(requestParams);
				const { list = [], total = 0, hasMore = false } = data;

				if (isLoadMore) {
					this.customers = [...this.customers, ...list];
				} else {
					this.customers = list;
					this.customersPage = 1;
				}

				this.customersTotal = total;
				this.customersHasMore = hasMore;

				if (isLoadMore) {
					this.customersPage += 1;
				}

				return data;
			} catch (error) {
				console.error("获取客户列表失败:", error);
				if (!isLoadMore) {
					this.customers = [];
				}
				throw error;
			} finally {
				this.customersLoading = false;
			}
		},

		// 添加客户
		async createCustomer(customerData) {
			try {
				const data = await addCustomer(customerData);
				// 添加到本地列表
				this.customers.unshift(data);
				this.customersTotal += 1;
				return data;
			} catch (error) {
				console.error("添加客户失败:", error);
				throw error;
			}
		},

		// 更新客户信息
		async modifyCustomer(customerId, customerData) {
			try {
				const data = await updateCustomer(customerId, customerData);
				// 更新本地列表
				const index = this.customers.findIndex((c) => c.id === customerId);
				if (index > -1) {
					this.customers.splice(index, 1, data);
				}
				return data;
			} catch (error) {
				console.error("更新客户失败:", error);
				throw error;
			}
		},

		// 删除客户
		removeCustomer(customerId) {
			const index = this.customers.findIndex((c) => c.id === customerId);
			if (index > -1) {
				this.customers.splice(index, 1);
				this.customersTotal -= 1;
			}
		},

		// 更新用户设置
		updateSettings(newSettings) {
			this.settings = { ...this.settings, ...newSettings };
		},

		// 从本地存储加载设置
		loadSettings() {
			// 插件会自动从本地存储恢复状态，无需手动加载
		},

		// 检查登录状态
		async checkLoginStatus() {
			console.log('🔍 checkLoginStatus - 开始执行');
			// 直接从本地存储获取tokens，确保能正确恢复
			const storedTokens = uni.getStorageSync('user-store')?.tokens || null;
			const storedUserInfo = uni.getStorageSync('user-store')?.userInfo || null;
			const storedIsLoggedIn = uni.getStorageSync('user-store')?.isLoggedIn || false;

			console.log('🔍 checkLoginStatus - 本地存储tokens状态:', storedTokens ? '存在' : '不存在');
			console.log('🔍 checkLoginStatus - 本地存储用户登录状态:', storedIsLoggedIn);

			// 如果store中没有token，但本地存储有，则手动恢复
			if (!this.tokens?.access_token && storedTokens?.access_token) {
				console.log('🔍 checkLoginStatus - store中无token，从本地存储恢复');
				this.tokens = storedTokens;
				// 同时恢复用户信息和登录状态
				if (storedUserInfo && storedIsLoggedIn) {
					this.userInfo = storedUserInfo;
					this.isLoggedIn = storedIsLoggedIn;
					// 恢复权限设置
					if (storedUserInfo) {
						this.setUserPermissions(storedUserInfo);
					}
				}
			}

			// 当有token但isLoggedIn为false时，验证token并刷新用户信息
			if (this.tokens?.access_token && !this.isLoggedIn) {
				console.log('🔍 checkLoginStatus - 有token但未登录，尝试刷新用户信息');
				try {
					await this.fetchUserInfo();
				} catch (error) {
					console.error('🔍 checkLoginStatus - 验证token失败:', error);
					// token 无效，清除状态
					this.tokens = null;
				}
			} else if (!this.tokens?.access_token) {
				console.log('🔍 checkLoginStatus - 无有效token，保持未登录状态');
			} else {
				console.log('🔍 checkLoginStatus - 已登录且token有效');
			}

			// 确保tabBar用户类型与当前状态同步
			this.updateTabBarUserType();
			console.log('🔍 checkLoginStatus - 执行完成，最终登录状态:', this.isLoggedIn);
		},

		// 初始化用户状态
		async initUser() {
			console.log('🔍 initUser - 开始执行');
			// 统一调用checkLoginStatus方法，确保逻辑一致
			await this.checkLoginStatus();
			console.log('🔍 initUser - 执行完成');
		},

		// 获取消费者列表
		async fetchConsumers(params = {}) {
			if (this.consumersLoading) return;

			this.consumersLoading = true;
			try {
				console.log("发送消费者请求，参数:", params);
				const response = await getConsumers(params);
				console.log("收到消费者响应:", response);

				// 处理响应数据 - 支持多种响应格式
				let consumersData = [];
				let total = 0;

				if (response?.users) {
					// 格式1: { users: [...], total: 123 }
					consumersData = response.users || [];
					total = response.total || 0;
					console.log(
						"解析出的消费者数据(格式1):",
						consumersData,
						"总数:",
						total,
					);
				} else if (response?.data?.users) {
					// 格式2: { data: { users: [...], total: 123 } }
					consumersData = response.data.users || [];
					total = response.data.total || 0;
					console.log(
						"解析出的消费者数据(格式2):",
						consumersData,
						"总数:",
						total,
					);
				} else if (Array.isArray(response?.data)) {
					// 格式3: { data: [...] }
					consumersData = response.data || [];
					total = consumersData.length;
					console.log(
						"解析出的消费者数据(格式3):",
						consumersData,
						"总数:",
						total,
					);
				} else if (Array.isArray(response)) {
					// 格式4: 直接返回数组 [...]
					consumersData = response || [];
					total = consumersData.length;
					console.log(
						"解析出的消费者数据(格式4):",
						consumersData,
						"总数:",
						total,
					);
				} else {
					console.log("响应格式不符合预期:", response);
					console.log("响应数据类型:", typeof response);
					console.log("响应数据键:", Object.keys(response || {}));
				} // 更新数据
				this.consumers = consumersData;
				this.consumersTotal = total;
				this.consumersHasMore = false; // 不支持分页，所以设为false

				console.log("获取消费者列表成功:", {
					consumers: this.consumers,
					total: this.consumersTotal,
					hasMore: this.consumersHasMore,
				});

				return this.consumers;
			} catch (error) {
				console.error("获取消费者列表失败:", error);
				throw error;
			} finally {
				this.consumersLoading = false;
			}
		},

		// 重置消费者列表
		resetConsumers() {
			this.consumers = [];
			this.consumersPage = 1;
			this.consumersTotal = 0;
			this.consumersHasMore = true;
			this.consumersSearchKeyword = ""; // 重置搜索关键词
			this.consumersCardNumber = ""; // 重置会员卡号
		},

		// 设置消费者搜索关键词
		setConsumersSearchKeyword(keyword) {
			this.consumersSearchKeyword = keyword || "";
		},
		setConsumersCardNumber(cardNumber) {
			console.log("🔍 setConsumersCardNumber 调用:", cardNumber);
			this.consumersCardNumber = cardNumber || "";
			console.log("🔍 设置后 consumersCardNumber:", this.consumersCardNumber);
		},
		// 清除消费者搜索
		clearConsumersSearch() {
			this.consumersSearchKeyword = "";
			this.consumersCardNumber = ""; // 清除会员卡号
		},

		// 获取福利信息（优惠券和特权）
		async fetchBenefits(params = {}) {
			if (this.benefitsLoading) return;

			this.benefitsLoading = true;
			try {
				console.log("发送福利请求，参数:", params);
				const response = await getBenefits(params);
				console.log("收到福利响应:", response);

				// 处理响应数据 - 检查两种可能的数据结构
				let benefitsData = null;

				if (response?.data) {
					// 数据嵌套在 data 字段中
					benefitsData = response.data;
				} else if (response?.coupons || response?.privileges) {
					// 数据直接在根级别
					benefitsData = response;
				}

				if (benefitsData) {
					this.benefits = {
						coupons: benefitsData.coupons || [],
						privileges: benefitsData.privileges || [],
						coupons_count: benefitsData.coupons_count || 0,
						privileges_count: benefitsData.privileges_count || 0,
						total_count: benefitsData.total_count || 0,
						filters: benefitsData.filters || { type: null, status: "active" },
					};

					console.log("福利数据更新成功:", {
						coupons: this.benefits.coupons.length,
						privileges: this.benefits.privileges.length,
						total: this.benefits.total_count,
					});
				} else {
					console.log("福利响应格式不符合预期:", response);
				}

				return this.benefits;
			} catch (error) {
				console.error("获取福利信息失败:", error);
				throw error;
			} finally {
				this.benefitsLoading = false;
			}
		},

		// 重置福利数据
		resetBenefits() {
			this.benefits = {
				coupons: [],
				privileges: [],
				coupons_count: 0,
				privileges_count: 0,
				total_count: 0,
				filters: {
					type: null,
					status: "active",
				},
			};
		},

		// 手动更新用户信息
		updateUserInfo(newInfo) {
			console.log('🔍 updateUserInfo - 更新用户信息:', newInfo);
			console.log('🔍 updateUserInfo - 当前用户信息:', this.userInfo);

			// 合并用户信息
			this.userInfo = {
				...this.userInfo,
				...newInfo
			};

			console.log('🔍 updateUserInfo - 更新后的用户信息:', this.userInfo);

			// 如果传入的信息包含手机号，则更新缓存
			if (newInfo.phone !== undefined) {
				console.log('🔍 updateUserInfo - 手机号已更新:', newInfo.phone);
			}

			// 如果状态发生变化，重新设置权限
			if (newInfo.status !== undefined) {
				this.setUserPermissions(this.userInfo);
			}
		},

		// 根据用户状态设置权限
		setUserPermissions(userInfo) {
			// 清空现有权限
			this.permissions = [];

			// 根据用户状态设置权限（兼容字符串和数字类型）
			const status = parseInt(userInfo?.status);

			if (status === 1) {
				// status=1 是管理员，拥有所有权限
				this.permissions = [
					'customer_management',
					'user_management',
					'product_management',
					'order_management',
					'admin'
				];
			} else if (status === 0) {
				// status=0 是普通用户
				this.permissions = [];
			} else {
				// 其他状态或未定义状态
				this.permissions = [];
			}

			// 自动更新tabBar用户类型
			this.updateTabBarUserType();
		},		// 根据登录状态和用户status自动更新tabBar的用户类型
		updateTabBarUserType() {
			console.log('🔍 updateTabBarUserType - 开始执行');
			const tabBarStore = useTabBarStore();
			let userType = 'anonymous'; // 默认匿名用户

			console.log('🔍 updateTabBarUserType - 当前状态:', {
				isLoggedIn: this.isLoggedIn,
				userInfo: this.userInfo,
				userStatus: this.userInfo?.status
			});

			if (this.isLoggedIn && this.userInfo) {
				// 兼容字符串和数字类型的 status
				const status = parseInt(this.userInfo.status);
				console.log('🔍 updateTabBarUserType - status类型转换:', {
					originalStatus: this.userInfo.status,
					originalType: typeof this.userInfo.status,
					parsedStatus: status,
					parsedType: typeof status
				});

				if (status === 1) {
					userType = 'admin'; // 管理员
				} else if (status === 0) {
					userType = 'normal'; // 普通用户
				}
				// 其他status保持anonymous
			}

			tabBarStore.setUserType(userType);
		},
	},
});
