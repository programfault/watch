import { createPinia } from 'pinia'

// 创建 pinia 实例
const pinia = createPinia()

export default pinia

// 导出所有 stores
export { useSearchStore } from './search.js'
