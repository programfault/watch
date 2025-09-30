import { createPinia } from 'pinia'

// 创建 pinia 实例
const pinia = createPinia()

export default pinia

export { useAppStore } from './app.js'
export { useProductStore } from './product.js'
// 导出所有 stores
export { useSearchStore } from './search.js'
export { useUserStore } from './user.js'
