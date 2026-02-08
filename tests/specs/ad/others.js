export default [
  {
    name: 'AdGlobal',
    category: 'ad',
    tests: [
      {
        id: 'wx.getDirectAdStatusSync',
        name: '获取直投广告状态',
        description: '验证 getDirectAdStatusSync',
        type: 'sync',
        run: (runtime) => {
          if (typeof wx.getDirectAdStatusSync !== 'function') return 'PASS: wx.getDirectAdStatusSync not supported';
          try {
             const status = wx.getDirectAdStatusSync();
             console.log('wx.getDirectAdStatusSync:', status);
             // 只要不报错就行
             return 'PASS';
          } catch(e) {
             return 'FAIL: ' + e.message;
          }
        }
      },
      {
        id: 'wx.getShowSplashAdStatus',
        name: '获取开屏广告展示状态',
        description: '验证 getShowSplashAdStatus',
        type: 'sync',
        run: (runtime) => {
          if (typeof wx.getShowSplashAdStatus !== 'function') return 'PASS: wx.getShowSplashAdStatus not supported';
          try {
             const status = wx.getShowSplashAdStatus();
             console.log('wx.getShowSplashAdStatus:', status);
             return 'PASS';
          } catch(e) {
             return 'FAIL: ' + e.message;
          }
        }
      },
      {
        id: 'wx.onDirectAdStatusChange',
        name: '监听直投广告状态变化',
        description: '验证 onDirectAdStatusChange 注册',
        type: 'sync',
        run: (runtime) => {
          if (typeof wx.onDirectAdStatusChange !== 'function') return 'PASS: wx.onDirectAdStatusChange not supported';
          try {
             const callback = (res) => { console.log('DirectAdStatusChange', res); };
             wx.onDirectAdStatusChange(callback);
             if (typeof wx.offDirectAdStatusChange === 'function') {
                 wx.offDirectAdStatusChange(callback);
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
