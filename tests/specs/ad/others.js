export default [
  {
    name: 'AdGlobal',
    category: 'ad',
    tests: [
      {
        id: 'migo.getDirectAdStatusSync',
        name: '获取直投广告状态',
        description: '验证 getDirectAdStatusSync',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getDirectAdStatusSync !== 'function') return 'PASS: runtime.getDirectAdStatusSync not supported';
          try {
             const status = runtime.getDirectAdStatusSync();
             console.log('runtime.getDirectAdStatusSync:', status);
             // 只要不报错就行
             return 'PASS';
          } catch(e) {
             return 'FAIL: ' + e.message;
          }
        }
      },
      {
        id: 'migo.getShowSplashAdStatus',
        name: '获取开屏广告展示状态',
        description: '验证 getShowSplashAdStatus',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getShowSplashAdStatus !== 'function') return 'PASS: runtime.getShowSplashAdStatus not supported';
          try {
             const status = runtime.getShowSplashAdStatus();
             console.log('runtime.getShowSplashAdStatus:', status);
             return 'PASS';
          } catch(e) {
             return 'FAIL: ' + e.message;
          }
        }
      },
      {
        id: 'migo.onDirectAdStatusChange',
        name: '监听直投广告状态变化',
        description: '验证 onDirectAdStatusChange 注册',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onDirectAdStatusChange !== 'function') return 'PASS: runtime.onDirectAdStatusChange not supported';
          try {
             const callback = (res) => { console.log('DirectAdStatusChange', res); };
             runtime.onDirectAdStatusChange(callback);
             if (typeof runtime.offDirectAdStatusChange === 'function') {
                 runtime.offDirectAdStatusChange(callback);
             }
             return 'PASS';
          } catch(e) {
             return 'FAIL: ' + e.message;
          }
        }
      }
    ]
  }
];
