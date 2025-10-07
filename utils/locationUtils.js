/**
 * 位置相关工具函数
 * 提供位置权限检查、请求、获取位置信息、距离计算等功能
 */

/**
 * 检查定位权限状态
 * @returns {Promise<boolean>} 权限状态
 */
export const checkLocationPermission = async () => {
    try {
        const setting = await uni.getSetting();
        return setting.authSetting['scope.userLocation'] === true;
    } catch (error) {
        console.error('检查位置权限失败:', error);
        return false;
    }
};

/**
 * 请求定位权限
 * @returns {Promise<boolean>} 授权结果
 */
export const requestLocationPermission = async () => {
    try {
        const modalResult = await uni.showModal({
            title: '位置权限请求',
            content: '为了为您提供最近门店的导航服务和距离显示，需要获取您的位置信息。',
            confirmText: '同意授权',
            cancelText: '暂不授权'
        });

        if (modalResult.confirm) {
            try {
                await uni.authorize({ scope: 'scope.userLocation' });
                uni.showToast({ title: '位置权限开启成功', icon: 'success' });
                return true;
            } catch (authError) {
                console.error('授权失败:', authError);
                uni.showToast({ title: '授权失败', icon: 'none' });
                return false;
            }
        }
        return false;
    } catch (error) {
        console.error('请求权限失败:', error);
        return false;
    }
};

/**
 * 获取用户当前位置
 * @returns {Promise<{latitude: number, longitude: number} | null>} 位置信息或null
 */
export const getUserLocation = async () => {
    try {
        const res = await uni.getLocation({
            type: 'gcj02',
            highAccuracyExpireTime: 4000,
            isHighAccuracy: true
        });

        const location = {
            latitude: res.latitude,
            longitude: res.longitude
        };

        console.log('获取用户位置成功:', location);
        return location;
    } catch (error) {
        console.error('获取位置失败:', error);
        
        // 根据错误类型给出不同提示
        if (error.errMsg?.includes('requiredPrivateInfos')) {
            uni.showModal({
                title: '配置错误',
                content: '小程序需要重新发布才能使用位置功能，请联系开发者',
                showCancel: false
            });
        } else if (error.errMsg?.includes('auth deny')) {
            uni.showToast({
                title: '位置权限被拒绝',
                icon: 'none'
            });
        } else {
            uni.showToast({
                title: '获取位置失败',
                icon: 'none'
            });
        }
        
        return null;
    }
};

/**
 * 计算两个经纬度之间的距离（球面距离公式）
 * @param {Object} point1 - 第一个点的经纬度 {latitude, longitude}
 * @param {Object} point2 - 第二个点的经纬度 {latitude, longitude}
 * @returns {number} 距离（公里），无法计算时返回Infinity
 */
export const calculateDistance = (point1, point2) => {
    if (!point1 || !point1.latitude || !point1.longitude ||
        !point2 || !point2.latitude || !point2.longitude) {
        return Infinity;
    }

    const rad1 = (parseFloat(point1.latitude) * Math.PI) / 180;
    const rad2 = (parseFloat(point2.latitude) * Math.PI) / 180;
    const deltaLat = rad2 - rad1;
    const deltaLon = ((parseFloat(point2.longitude) - parseFloat(point1.longitude)) * Math.PI) / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(rad1) * Math.cos(rad2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371 * c; // 地球半径(公里)

    return distance;
};

/**
 * 格式化距离显示
 * @param {number} distance - 距离（公里）
 * @returns {string} 格式化后的距离字符串
 */
export const formatDistance = (distance) => {
    if (distance === Infinity || Number.isNaN(distance) || !distance) {
        return '';
    }

    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
        return `${distance.toFixed(1)}km`;
    } else {
        return `${Math.round(distance)}km`;
    }
};

/**
 * 打开地图导航到指定位置
 * @param {Object} location - 目标位置信息 {latitude, longitude, name, address}
 * @returns {Promise<void>}
 */
export const openMapNavigation = async (location) => {
    if (!location || !location.latitude || !location.longitude) {
        uni.showToast({
            title: '暂无位置信息',
            icon: 'none'
        });
        return;
    }

    try {
        await uni.openLocation({
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
            name: location.name || '',
            address: location.address || '',
            success: () => {
                console.log('打开地图成功');
            }
        });
    } catch (error) {
        console.error('打开地图失败:', error);
        uni.showToast({
            title: '打开地图失败',
            icon: 'none'
        });
    }
};