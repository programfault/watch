/**
 * 访问时间功能使用示例
 * 展示如何在收藏和浏览记录中使用精确到分钟的访问时间
 */


import {
    formatBrowsingTime,
    getFormattedBrowsingHistory
} from '@/utils/browsingHistory.js'
import {
    formatTimeToMinute,
    getCurrentTimeToMinute,
    getRelativeTime
} from '@/utils/timeUtils.js'

/**
 * 示例1: 在商品收藏时记录访问时间
 */
export const addToFavoritesWithTime = (productData, favoritesStore) => {
    const favoriteItem = {
        id: productData.id,
        title: productData.title,
        model: productData.model,
        price: productData.price,
        images: productData.images,
        visitedAt: getCurrentTimeToMinute(), // 精确到分钟的访问时间
        addedAt: getCurrentTimeToMinute()    // 收藏时间
    }

    favoritesStore.addToFavorites(favoriteItem)
    console.log('收藏时间:', formatTimeToMinute(favoriteItem.visitedAt))
}

/**
 * 示例2: 在浏览记录中显示访问时间
 */
export const displayBrowsingHistoryWithTime = () => {
    const history = getFormattedBrowsingHistory(5)

    return history.map(item => ({
        ...item,
        // 使用相对时间显示
        relativeTime: getRelativeTime(item.visitedAt || item.viewedAt),
        // 使用具体时间显示
        absoluteTime: formatTimeToMinute(item.visitedAt || item.viewedAt),
        // 使用浏览记录专用的时间格式
        browsingTime: formatBrowsingTime(item.visitedAt || item.viewedAt)
    }))
}

/**
 * 示例3: 在Vue组件中显示访问时间
 */
export const useVisitTimeInComponent = () => {
    import { ref, computed } from 'vue'

    const browsingHistory = ref([])

    const historyWithTime = computed(() => {
        return browsingHistory.value.map(item => ({
            ...item,
            displayTime: getRelativeTime(item.visitedAt),
            fullTime: formatTimeToMinute(item.visitedAt)
        }))
    })

    return {
        browsingHistory,
        historyWithTime
    }
}

/**
 * 示例4: 时间格式的对比展示
 */
export const showTimeFormats = (timeStr) => {
    console.log('=== 访问时间格式展示 ===')
    console.log('原始时间:', timeStr)
    console.log('相对时间:', getRelativeTime(timeStr))
    console.log('具体时间:', formatTimeToMinute(timeStr))
    console.log('浏览时间:', formatBrowsingTime(timeStr))

    /* 示例输出：
    原始时间: 2025-10-06T14:30:00.000Z
    相对时间: 5分钟前访问
    具体时间: 2025-10-06 14:30
    浏览时间: 5分钟前浏览
    */
}

/**
 * 示例5: 在收藏列表中显示访问时间
 */
export const formatFavoritesWithTime = (favorites) => {
    return favorites.map(item => ({
        ...item,
        lastVisited: item.visitedAt ? getRelativeTime(item.visitedAt) : '未知',
        addedTime: item.addedAt ? getRelativeTime(item.addedAt) : '未知',
        // 区分访问时间和收藏时间
        timeInfo: {
            visited: item.visitedAt ? formatTimeToMinute(item.visitedAt) : null,
            added: item.addedAt ? formatTimeToMinute(item.addedAt) : null
        }
    }))
}
