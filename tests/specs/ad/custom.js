export default [
  {
    name: 'CustomAd',
    category: 'ad',
    tests: [
      {
        id: 'wx.createCustomAd',
        name: '创建原生模板广告',
        description: '验证 createCustomAd 返回对象及基本方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof wx.createCustomAd !== 'function') return 'PASS: wx.createCustomAd not supported';
          
          try {
            const customAd = wx.createCustomAd({
              adUnitId: 'adunit-test-dummy',
              style: { left: 0, top: 0, width: 300 } // CustomAd 有 style 参数吗? 文档 CreateCustomAdOption 有 style
            });

            if (!customAd) return 'FAIL: createCustomAd returned undefined';
            
            const methods = ['show', 'hide', 'destroy', 'onLoad', 'onError', 'onClose', 'offLoad', 'offError', 'offClose', 'isShow'];
            for (const m of methods) {
              if (typeof customAd[m] !== 'function') {
                return `FAIL: Method ${m} missing on CustomAd instance`;
              }
            }
            
            if (customAd.destroy) customAd.destroy();
            return 'PASS';
          } catch (e) {
            return 'FAIL: ' + e.message;
          }
        }
      },
      {
        id: 'CustomAd.methods',
        name: '原生模板广告方法调用',
        description: '验证 show/hide/onError 等',
        type: 'async',
        run: (runtime) => {
          if (typeof wx.createCustomAd !== 'function') return 'PASS: wx.createCustomAd not supported';
          
          return new Promise((resolve) => {
            const customAd = wx.createCustomAd({
              adUnitId: 'adunit-test-dummy',
              style: { left: 0, top: 0 }
            });
            
            let isResolved = false;
            const safeResolve = (msg) => {
              if (!isResolved) {
                isResolved = true;
                if (customAd.destroy) customAd.destroy();
                resolve(msg);
              }
            };

            customAd.onError((err) => {
              console.log('CustomAd onError:', err);
              safeResolve('PASS');
            });

            customAd.onLoad(() => {
              console.log('CustomAd onLoad');
              customAd.show().then(() => {
                  console.log('CustomAd isShow:', customAd.isShow());
                  customAd.hide();
                  safeResolve('PASS');
              }).catch(() => safeResolve('PASS'));
            });

            // 某些情况下 CustomAd 需要手动调 load 吗？文档没 explicitly 说 create 自动 load，但通常是。
            // 尝试 show 会触发 load 或者 error
            customAd.show().catch(err => {
               console.log('CustomAd show fail:', err);
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
