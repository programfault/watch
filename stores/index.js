import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

// 创建 pinia 实例
const pinia = createPinia()

// 配置 pinia-plugin-persistedstate 适配微信小程序（兼容pinia v3）
pinia.use(createPersistedState({
  // 全局配置
  storage: {
    getItem: (key) => uni.getStorageSync(key),
    setItem: (key, value) => uni.setStorageSync(key, value),
    removeItem: (key) => uni.removeStorageSync(key)
  },
  serializer: {
    serialize: (value) => JSON.stringify(value),
    deserialize: (value) => {
      try {
        return JSON.parse(value)
      } catch (error) {
        console.error('反序列化失败:', error)
        return null
      }
    }
  }
}))

export default pinia

export { useAppStore } from './app.js'
export { useConfigStore } from './config.js'
export { useFavoritesStore } from './favorites.js'
export { useProductStore } from './product.js'
// 导出所有 stores
export { useSearchStore } from './search.js'
export { useTabBarStore } from './tabBar.js'
export { useToolbarStore } from './toolbar.js'
export { useUserStore } from './user.js'
