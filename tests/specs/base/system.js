/**
 * 系统信息相关 API 测试
 */

export default [
  // 1) migo.openSystemBluetoothSetting
  {
    name: 'migo.openSystemBluetoothSetting',
    category: 'base',
    tests: [
      {
        id: 'migo.openSystemBluetoothSetting',
        name: '打开系统蓝牙设置页',
        description: '通过 openSystemBluetoothSetting 打开系统蓝牙设置页',
        type: 'navigate',
        run: (runtime) => {
          if (typeof runtime.openSystemBluetoothSetting !== 'function') {
            return { _error: 'openSystemBluetoothSetting 不存在' };
          }
          // 该类 open* 接口通常为异步（success/fail/complete）
          return runtime.openSystemBluetoothSetting({});
        },
        expect: {}
      }
    ]
  },

  // 2) migo.openAppAuthorizeSetting
  {
    name: 'migo.openAppAuthorizeSetting',
    category: 'base',
    tests: [
      {
        id: 'migo.openAppAuthorizeSetting',
        name: '打开应用授权设置页',
        description: '通过 openAppAuthorizeSetting 打开应用授权设置页',
        type: 'navigate',
        run: (runtime) => {
          if (typeof runtime.openAppAuthorizeSetting !== 'function') {
            return { _error: 'openAppAuthorizeSetting 不存在' };
          }
          return runtime.openAppAuthorizeSetting({});
        },
        expect: {}
      }
    ]
  },

  // 3) migo.getWindowInfo
  {
    name: 'migo.getWindowInfo',
    category: 'base',
    tests: [
      {
        id: 'migo.getWindowInfo',
        name: '获取窗口信息',
        description: '通过 getWindowInfo 获取窗口尺寸和安全区域信息',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getWindowInfo !== 'function') {
            return { _error: 'getWindowInfo 不存在' };
          }
          return runtime.getWindowInfo();
        },
        expect: {
          pixelRatio: '@number',
          screenWidth: '@number',
          screenHeight: '@number',
          windowWidth: '@number',
          windowHeight: '@number',
          statusBarHeight: '@number',
          safeArea: {
            left: '@number',
            right: '@number',
            top: '@number',
            bottom: '@number',
            width: '@number',
            height: '@number'
          }
        }
      }
    ]
  },

  // 4) migo.getSystemSetting
  {
    name: 'migo.getSystemSetting',
    category: 'base',
    tests: [
      {
        id: 'migo.getSystemSetting',
        name: '获取系统设置',
        description: '通过 getSystemSetting 获取系统设置信息',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getSystemSetting !== 'function') {
            return { _error: 'getSystemSetting 不存在' };
          }
          return runtime.getSystemSetting();
        },
        expect: {
          bluetoothEnabled: '@boolean',
          locationEnabled: '@boolean',
          wifiEnabled: '@boolean',
          deviceOrientation: '@string'
        }
      }
    ]
  },

  // 5) migo.getSystemInfoSync（文档不再维护：仍可测是否存在/可用）
  {
    name: 'migo.getSystemInfoSync',
    category: 'base',
    tests: [
      {
        id: 'migo.getSystemInfoSync',
        name: '获取系统信息（同步）',
        description: '通过 getSystemInfoSync 获取系统信息（该接口文档标注不再维护）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getSystemInfoSync !== 'function') {
            return { _error: 'getSystemInfoSync 不存在' };
          }
          return runtime.getSystemInfoSync();
        },
        expect: {
          brand: '@string',
          model: '@string',
          pixelRatio: '@number',
          screenWidth: '@number',
          screenHeight: '@number',
          windowWidth: '@number',
          windowHeight: '@number',
          statusBarHeight: '@number',
          language: '@string',
          version: '@string',
          system: '@string',
          platform: '@string',
          fontSizeSetting: '@number',
          SDKVersion: '@string'
        }
      }
    ]
  },

  // 6) migo.getSystemInfoAsync（文档不再维护：仍可测是否存在/可用）
  {
    name: 'migo.getSystemInfoAsync',
    category: 'base',
    tests: [
      {
        id: 'migo.getSystemInfoAsync',
        name: '获取系统信息（异步）',
        description: '通过 getSystemInfoAsync 获取系统信息（该接口文档标注不再维护）',
        type: 'async',
        timeout: 5000,
        run: (runtime) => {
          if (typeof runtime.getSystemInfoAsync !== 'function') {
            return { _error: 'getSystemInfoAsync 不存在' };
          }
          return runtime.getSystemInfoAsync({});
        },
        expect: {
          brand: '@string',
          model: '@string',
          pixelRatio: '@number',
          screenWidth: '@number',
          screenHeight: '@number',
          windowWidth: '@number',
          windowHeight: '@number',
          statusBarHeight: '@number',
          language: '@string',
          version: '@string',
          system: '@string',
          platform: '@string',
          fontSizeSetting: '@number',
          SDKVersion: '@string'
        }
      }
    ]
  },

  // 7) migo.getSystemInfo（文档不再维护：仍可测是否存在/可用）
  {
    name: 'migo.getSystemInfo',
    category: 'base',
    tests: [
      {
        id: 'migo.getSystemInfo',
        name: '获取系统信息',
        description: '通过 getSystemInfo 获取系统信息（该接口文档标注不再维护）',
        type: 'async',
        timeout: 5000,
        run: (runtime) => {
          if (typeof runtime.getSystemInfo !== 'function') {
            return { _error: 'getSystemInfo 不存在' };
          }
          return runtime.getSystemInfo({});
        },
        expect: {
          brand: '@string',
          model: '@string',
          pixelRatio: '@number',
          screenWidth: '@number',
          screenHeight: '@number',
          windowWidth: '@number',
          windowHeight: '@number',
          statusBarHeight: '@number',
          language: '@string',
          version: '@string',
          system: '@string',
          platform: '@string',
          fontSizeSetting: '@number',
          SDKVersion: '@string'
        }
      }
    ]
  },

  // 8) migo.getDeviceInfo
  {
    name: 'migo.getDeviceInfo',
    category: 'base',
    tests: [
      {
        id: 'migo.getDeviceInfo',
        name: '获取设备信息',
        description: '通过 getDeviceInfo 获取设备硬件信息',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getDeviceInfo !== 'function') {
            return { _error: 'getDeviceInfo 不存在' };
          }
          return runtime.getDeviceInfo();
        },
        expect: {
          brand: '@string',
          model: '@string',
          system: '@string',
          platform: '@string'
        }
      }
    ]
  },

  // 9) migo.getDeviceBenchmarkInfo
  {
    name: 'migo.getDeviceBenchmarkInfo',
    category: 'base',
    tests: [
      {
        id: 'migo.getDeviceBenchmarkInfo',
        name: '获取设备性能基准信息',
        description: '通过 getDeviceBenchmarkInfo 获取设备性能数据',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getDeviceBenchmarkInfo !== 'function') {
            return { _error: 'getDeviceBenchmarkInfo 不存在' };
          }
          return runtime.getDeviceBenchmarkInfo();
        },
        expect: {
          benchmarkLevel: '@number'
        }
      }
    ]
  },

  // 10) migo.getAppBaseInfo
  {
    name: 'migo.getAppBaseInfo',
    category: 'base',
    tests: [
      {
        id: 'migo.getAppBaseInfo',
        name: '获取应用基础信息',
        description: '通过 getAppBaseInfo 获取小游戏基础信息',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getAppBaseInfo !== 'function') {
            return { _error: 'getAppBaseInfo 不存在' };
          }
          return runtime.getAppBaseInfo();
        },
        expect: {
          SDKVersion: '@string',
          enableDebug: '@boolean',
          language: '@string',
          version: '@string',
          theme: '@string'
        }
      }
    ]
  },

  // 11) migo.getAppAuthorizeSetting
  {
    name: 'migo.getAppAuthorizeSetting',
    category: 'base',
    tests: [
      {
        id: 'migo.getAppAuthorizeSetting',
        name: '获取应用授权设置',
        description: '通过 getAppAuthorizeSetting 获取应用授权状态',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getAppAuthorizeSetting !== 'function') {
            return { _error: 'getAppAuthorizeSetting 不存在' };
          }
          return runtime.getAppAuthorizeSetting();
        },
        expect: {
          albumAuthorized: '@string',
          bluetoothAuthorized: '@string',
          cameraAuthorized: '@string',
          locationAuthorized: '@string',
          microphoneAuthorized: '@string',
          notificationAuthorized: '@string'
        }
      }
    ]
  }
];
