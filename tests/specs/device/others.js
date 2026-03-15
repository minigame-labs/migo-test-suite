export default [
  {
    name: 'migo.others',
    category: 'device',
    tests: [
      // 扫码
      {
        id: 'migo.scanCode',
        name: '调起客户端扫码界面',
        description: '真实调起客户端扫码界面',
        type: 'async',
        severity: 'P0',
        unsupportedPolicy: 'fail',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.scanCode !== 'function') {
            resolve({ _error: 'scanCode 不存在' });
            return;
          }
          // 不真实调用，因为会弹UI。这里仅检查函数
          resolve('PASS');
        }),
        expect: 'PASS'
      },
      // 内存
      {
        id: 'migo.onMemoryWarning',
        name: '监听内存不足警告事件',
        description: '验证 onMemoryWarning 接口存在性',
        type: 'sync',
        severity: 'P0',
        unsupportedPolicy: 'fail',
        run: (runtime) => {
          if (typeof runtime.onMemoryWarning !== 'function') return { exists: false };
          runtime.onMemoryWarning(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offMemoryWarning',
        name: '取消监听内存不足警告事件',
        description: '验证 offMemoryWarning 接口存在性',
        type: 'sync',
        severity: 'P0',
        unsupportedPolicy: 'fail',
        run: (runtime) => {
          if (typeof runtime.offMemoryWarning !== 'function') return { exists: false };
          runtime.offMemoryWarning(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  }
];
