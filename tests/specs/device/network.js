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
        description: '验证 onNetworkStatusChange 接口存在性 (难以自动触发变化)',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onNetworkStatusChange !== 'function') {
            return { exists: false };
          }
          // 仅注册不触发
          const callback = (res) => {
            console.log('Network changed:', res.isConnected, res.networkType);
          };
          runtime.onNetworkStatusChange(callback);
          // 能够调用即视为 PASS (实际测试需人工切换网络)
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  }
];
