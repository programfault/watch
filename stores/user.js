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
		paths: ['userInfo', 'isLoggedIn', 'tokens', 'settings'],
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
            console.log("==============",state.userInfo?.status)
			return state.userInfo?.status === 0;
		},

		// 是否有特定权限
		hasPermission: (state) => (permission) => {
			return state.permissions.includes(permission);
		},

		// 是否有客户管理权限
		hasCustomerPermission: (state) => {
            console.log("🔍 hasCustomerPermission 被计算:", {
				isLoggedIn: state.isLoggedIn,
				userInfo: state.userInfo,
				permissions: state.permissions,
				userStatus: state.userInfo?.status,
				isAdmin: state.userInfo?.status === 0,
				stack: new Error().stack
			});
			const result = (
				state.isLoggedIn &&
				(state.permissions.includes("customer_management") ||
					state.userInfo?.status === 0 || // 假设 role_id = 1 是管理员
					state.isAdmin)
			);
			console.log("🔍 hasCustomerPermission 计算结果:", result);
			return result;
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
			// 检查是否刚登录，避免重复验证token
			const justLoggedIn = uni.getStorageSync("justLoggedIn");
			if (justLoggedIn === "true") {
				console.log("刚登录，跳过token验证");
				uni.removeStorageSync("justLoggedIn");
				return;
			}

			// 检查是否有存储的token
			if (this.tokens?.access_token) {
				// 验证token是否有效
				try {
					// 检查最后登录时间，如果超过一定时间则重新验证
					const lastLoginTime = uni.getStorageSync("lastLoginTime");
					const now = Date.now();
					const timeDiff = now - parseInt(lastLoginTime || "0");

					// 如果超过24小时，重新验证用户信息
					if (timeDiff > 24 * 60 * 60 * 1000) {
						console.log("超过24小时，重新验证用户信息");
						await this.fetchUserInfo();
					} else {
						console.log("token有效，使用缓存的用户信息");
					}
				} catch (error) {
					console.error("验证用户状态失败:", error);
					this.logout(false); // 验证失败时只清理状态，不跳转页面
				}
			} else {
				console.log("没有有效的token");
				this.logout(false); // 没有token时只清理状态，不跳转页面
			}
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
					const { user, tokens, session_key, coupons, privileges } = response.data;					this.userInfo = {
						...user,
						coupons: coupons || [],
						privileges: privileges || []
					};

					this.isLoggedIn = true;

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
		async fetchUserInfo() {
			if (this.userInfoLoading) {
				console.log('🔍 fetchUserInfo - 正在加载中，跳过重复请求');
				return;
			}

			console.log('🔍 fetchUserInfo - 开始执行，当前登录状态:', this.isLoggedIn);
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
						// 合并用户信息，保留原有的coupons和privileges
						this.userInfo = {
							...this.userInfo,
							...response.data.user,
							coupons: this.userInfo?.coupons || [],
							privileges: this.userInfo?.privileges || []
						};

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
					// 合并用户信息，保留原有的coupons和privileges
					this.userInfo = {
						...this.userInfo,
						...response.user,
						coupons: this.userInfo?.coupons || [],
						privileges: this.userInfo?.privileges || []
					};

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

            tabbarStore.setUserType("normal");
            tabbarStore.setActiveTab("home");

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
			// 插件会自动从本地存储恢复tokens状态，我们只需要检查当前状态
			if (this.tokens?.access_token && !this.isLoggedIn) {
				try {
					await this.fetchUserInfo();
				} catch {
					// token 无效，清除状态（插件会自动清理本地存储）
					this.tokens = null;
				}
			}
		},

		// 初始化用户状态
		async initUser() {
			// 插件会自动从本地存储恢复状态，我们只需要检查登录状态
			await this.checkLoginStatus();
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
	},
});
