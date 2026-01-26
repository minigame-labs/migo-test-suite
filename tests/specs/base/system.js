/**
 * 系统信息相关 API 测试
 * https://developers.weixin.qq.com/minigame/dev/api/base/system/wx.getSystemInfo.html
 */

export default [
  {
    name: 'migo.getSystemInfo',
    category: 'base',
    tests: [
      {
        id: 'system-001',
        name: '获取系统信息 (同步)',
        description: '通过 getSystemInfoSync 获取完整系统信息，用于平台对比',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getSystemInfoSync !== 'function') {
            return { _error: 'getSystemInfoSync 不存在' };
          }
          return runtime.getSystemInfoSync();
        },
        expect: {}
      }
    ]
  },

  {
    name: 'migo.getWindowInfo',
    category: 'base',
    tests: [
      {
        id: 'window-001',
        name: '获取窗口信息',
        description: '通过 getWindowInfo 获取窗口尺寸和安全区域信息',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getWindowInfo !== 'function') {
            return { _error: 'getWindowInfo 不存在' };
          }
          return runtime.getWindowInfo();
        },
        expect: {}
      }
    ]
  },

  {
    name: 'migo.getDeviceInfo',
    category: 'base',
    tests: [
      {
        id: 'device-001',
        name: '获取设备信息',
        description: '通过 getDeviceInfo 获取设备硬件信息',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getDeviceInfo !== 'function') {
            return { _error: 'getDeviceInfo 不存在' };
          }
          return runtime.getDeviceInfo();
        },
        expect: {}
      }
    ]
  },

  {
    name: 'migo.getAppBaseInfo',
    category: 'base',
    tests: [
      {
        id: 'appbase-001',
        name: '获取应用基础信息',
        description: '通过 getAppBaseInfo 获取小游戏基础信息',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getAppBaseInfo !== 'function') {
            return { _error: 'getAppBaseInfo 不存在' };
          }
          return runtime.getAppBaseInfo();
        },
        expect: {}
      }
    ]
  },

  {
    name: 'migo.getSystemSetting',
    category: 'base',
    tests: [
      {
        id: 'syssetting-001',
        name: '获取系统设置',
        description: '通过 getSystemSetting 获取系统设置信息',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getSystemSetting !== 'function') {
            return { _error: 'getSystemSetting 不存在' };
          }
          return runtime.getSystemSetting();
        },
        expect: {}
      }
    ]
  },

  {
    name: 'migo.getAppAuthorizeSetting',
    category: 'base',
    tests: [
      {
        id: 'appauth-001',
        name: '获取应用授权设置',
        description: '通过 getAppAuthorizeSetting 获取应用授权状态',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getAppAuthorizeSetting !== 'function') {
            return { _error: 'getAppAuthorizeSetting 不存在' };
          }
          return runtime.getAppAuthorizeSetting();
        },
        expect: {}
      }
    ]
  },

  {
    name: 'migo.getDeviceBenchmarkInfo',
    category: 'base',
    tests: [
      {
        id: 'benchmark-001',
        name: '获取设备性能基准信息',
        description: '通过 getDeviceBenchmarkInfo 获取设备性能数据',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getDeviceBenchmarkInfo !== 'function') {
            return { _error: 'getDeviceBenchmarkInfo 不存在' };
          }
          return runtime.getDeviceBenchmarkInfo();
        },
        expect: {}
      }
    ]
  }
];
