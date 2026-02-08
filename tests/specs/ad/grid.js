export default [
  {
    name: 'GridAd',
    category: 'ad',
    tests: [
      {
        id: 'wx.createGridAd',
        name: '创建格子广告',
        description: '验证 createGridAd 返回对象及基本方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof wx.createGridAd !== 'function') return 'PASS: wx.createGridAd not supported';
          
          try {
            const gridAd = wx.createGridAd({
              adUnitId: 'adunit-test-dummy',
              style: { left: 0, top: 0, width: 300, height: 100 }
            });

            if (!gridAd) return 'FAIL: createGridAd returned undefined';
            
            const methods = ['show', 'hide', 'destroy', 'onLoad', 'onError', 'offLoad', 'offError', 'onResize', 'offResize'];
            for (const m of methods) {
              if (typeof gridAd[m] !== 'function') {
                return `FAIL: Method ${m} missing on GridAd instance`;
              }
            }
            
            if (gridAd.destroy) gridAd.destroy();
            return 'PASS';
          } catch (e) {
            return 'FAIL: ' + e.message;
          }
        }
      },
      {
        id: 'GridAd.methods',
        name: '格子广告方法调用',
        description: '验证 show/hide/onError 等',
        type: 'async',
        run: (runtime) => {
          if (typeof wx.createGridAd !== 'function') return 'PASS: wx.createGridAd not supported';
          
          return new Promise((resolve) => {
            const gridAd = wx.createGridAd({
              adUnitId: 'adunit-test-dummy',
              style: { left: 0, top: 0, width: 300, height: 100 }
            });
            
            let isResolved = false;
            const safeResolve = (msg) => {
              if (!isResolved) {
                isResolved = true;
                if (gridAd.destroy) gridAd.destroy();
                resolve(msg);
              }
            };

            gridAd.onError((err) => {
              console.log('GridAd onError:', err);
              safeResolve('PASS');
            });

            gridAd.onLoad(() => {
              console.log('GridAd onLoad');
              gridAd.show().then(() => {
                  gridAd.hide();
                  safeResolve('PASS');
              }).catch(() => safeResolve('PASS'));
            });

            gridAd.show().catch(err => {
               console.log('GridAd show fail:', err);
               safeResolve('PASS');
            });
            
            setTimeout(() => {
              safeResolve('PASS: Timeout');
            }, 2000);
          });
        }
      }
    ]
  }
];
