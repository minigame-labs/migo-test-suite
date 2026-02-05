
export default [
  {
    name: 'migo.getNetworkType',
    category: 'device',
    tests: [
      {
        id: 'migo.getNetworkType',
        name: '获取网络类型',
        description: '获取当前网络状态，返回 networkType',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.getNetworkType !== 'function') {
            resolve({ _error: 'getNetworkType 不存在' });
            return;
          }
          runtime.getNetworkType({
            success: (res) => {
              // networkType: wifi/2g/3g/4g/5g/unknown/none
              const types = ['wifi', '2g', '3g', '4g', '5g', 'unknown', 'none'];
              if (res && types.includes(res.networkType)) {
                resolve('PASS');
              } else {
                resolve('FAIL');
              }
            },
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.getLocalIPAddress',
        name: '获取局域网IP地址',
        description: '获取局域网IP地址',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.getLocalIPAddress !== 'function') {
            resolve({ _error: 'getLocalIPAddress 不存在' });
            return;
          }
          runtime.getLocalIPAddress({
            success: (res) => resolve(typeof res.localip === 'string' ? 'PASS' : 'FAIL'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'migo.onNetworkStatusChange',
    category: 'device',
    tests: [
      {
        id: 'migo.onNetworkStatusChange',
        name: '监听网络状态变化',
        description: '验证 onNetworkStatusChange 回调结构 (需切换网络)',
        type: 'event',
        timeout: 10000,
        run: (runtime, callback) => {
          if (typeof runtime.onNetworkStatusChange !== 'function') return callback({ _error: 'API missing' });
          runtime.onNetworkStatusChange((res) => callback(res));
        },
        expect: {
          isConnected: '@boolean',
          networkType: '@string'
        }
      },
      {
        id: 'migo.offNetworkStatusChange',
        name: '取消监听网络状态变化',
        description: '验证 offNetworkStatusChange 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offNetworkStatusChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onNetworkWeakChange',
        name: '监听网络信号强弱变化',
        description: '验证 onNetworkWeakChange 回调结构 (需模拟弱网)',
        type: 'event',
        timeout: 10000,
        run: (runtime, callback) => {
          if (typeof runtime.onNetworkWeakChange !== 'function') return callback({ _error: 'API missing' });
          runtime.onNetworkWeakChange((res) => callback(res));
        },
        expect: {
          weakNetType: '@string',
          networkType: '@string'
        }
      },
      {
        id: 'migo.offNetworkWeakChange',
        name: '取消监听网络信号强弱变化',
        description: '验证 offNetworkWeakChange 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offNetworkWeakChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  }
];
