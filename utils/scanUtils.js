/**
 * 扫码工具
 * 提供通用的扫码功能，包括权限检查和扫码操作
 */

const ScanUtils = {
  /**
   * 检查摄像头权限
   * @returns {Promise<boolean>} 是否有摄像头权限
   */
  async checkCameraAuth() {
    return new Promise((resolve) => {
      uni.getSetting({
        success: (res) => {
          console.log('当前权限设置:', res.authSetting);

          if (res.authSetting['scope.camera'] === false) {
            // 用户曾经拒绝授权，引导到设置页面
            uni.showModal({
              title: '需要摄像头权限',
              content: '请在设置中开启摄像头权限后重试',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  uni.openSetting({
                    success: (settingRes) => {
                      if (settingRes.authSetting['scope.camera']) {
                        resolve(true);
                      } else {
                        resolve(false);
                      }
                    },
                    fail: () => resolve(false)
                  });
                } else {
                  resolve(false);
                }
              }
            });
          } else if (res.authSetting['scope.camera'] === undefined) {
            // 未授权，请求授权
            uni.authorize({
              scope: 'scope.camera',
              success: () => {
                console.log('摄像头授权成功');
                resolve(true);
              },
              fail: () => {
                console.log('摄像头授权失败');
                uni.showToast({
                  title: '需要摄像头权限才能扫码',
                  icon: 'none'
                });
                resolve(false);
              }
            });
          } else {
            // 已授权
            resolve(true);
          }
        },
        fail: () => {
          console.error('获取权限设置失败');
          resolve(false);
        }
      });
    });
  },

  /**
   * 打开扫码界面
   * @returns {Promise<object|null>} 扫码结果，用户取消返回null
   */
  async openScanCode() {
    return new Promise((resolve, reject) => {
      uni.scanCode({
        onlyFromCamera: true,
        scanType: ['barCode', 'qrCode'],
        success: (res) => {
          console.log('扫码成功:', res);
          resolve(res);
        },
        fail: (error) => {
          console.error('扫码失败:', error);
          if (error.errMsg?.includes('cancel')) {
            // 用户取消扫码
            resolve(null);
          } else {
            reject(error);
          }
        }
      });
    });
  },

  /**
   * 执行完整的扫码流程（权限检查 + 扫码）
   * @param {function} onSuccess - 扫码成功的回调函数，参数为扫码结果
   * @param {function} onError - 扫码失败的回调函数，参数为错误信息
   */
  async scan(onSuccess, onError) {
    try {
      console.log('开始扫码流程...');

      // 检查摄像头权限
      const authResult = await this.checkCameraAuth();
      if (!authResult) {
        console.log('摄像头权限检查失败');
        return;
      }

      // 打开扫码界面
      const scanResult = await this.openScanCode();
      if (scanResult?.result) {
        console.log('扫码结果:', scanResult.result);

        uni.showToast({
          title: '扫码成功',
          icon: 'success'
        });

        // 调用成功回调
        if (typeof onSuccess === 'function') {
          onSuccess(scanResult.result);
        }
      }
    } catch (error) {
      console.error('扫码失败:', error);

      uni.showToast({
        title: '扫码失败',
        icon: 'none'
      });

      // 调用失败回调
      if (typeof onError === 'function') {
        onError(error);
      }
    }
  },

  /**
   * 简化的扫码方法，只返回扫码结果
   * @returns {Promise<string|null>} 扫码结果字符串，失败或取消返回null
   */
  async quickScan() {
    try {
      const authResult = await this.checkCameraAuth();
      if (!authResult) {
        return null;
      }

      const scanResult = await this.openScanCode();
      if (scanResult?.result) {
        uni.showToast({
          title: '扫码成功',
          icon: 'success'
        });
        return scanResult.result;
      }
      return null;
    } catch (error) {
      console.error('扫码失败:', error);
      uni.showToast({
        title: '扫码失败',
        icon: 'none'
      });
      return null;
    }
  }
}

export default ScanUtils;
