<script>
	import { useFavoritesStore, useUserStore } from '@/stores';

	export default {
		onLaunch: async function() {
			console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch 开始')

			// 首先初始化用户状态，确保token先恢复
			console.log('App Launch - 开始初始化用户状态...')
			const userStore = useUserStore()
			try {
				await userStore.initUserState()
				console.log('App Launch - 用户状态初始化完成')
			} catch (error) {
				console.error('App Launch - 用户状态初始化失败:', error)
			}

			// 用户状态初始化完成后，再初始化其他store
			console.log('App Launch - 开始初始化收藏store...')
			const favoritesStore = useFavoritesStore()
			favoritesStore.init()
			console.log('App Launch - 收藏store初始化完成')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
    @import "@/uni_modules/uview-plus/index.scss";
	/*每个页面公共css */
	// @import '@/uni_modules/uni-scss/index.scss';
	// @import '@/static/customicons.css';


	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}


	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>
