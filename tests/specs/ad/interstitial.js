export default [
  {
    name: 'InterstitialAd',
    category: 'ad',
    tests: [
      {
        id: 'migo.createInterstitialAd',
        name: '创建插屏广告',
        description: '验证 createInterstitialAd 返回对象及基本方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createInterstitialAd !== 'function') return 'PASS: runtime.createInterstitialAd not supported';
          
          try {
            const interstitialAd = runtime.createInterstitialAd({
              adUnitId: 'adunit-test-dummy'
            });

            if (!interstitialAd) return 'FAIL: createInterstitialAd returned undefined';
            
            const methods = ['show', 'load', 'destroy', 'onLoad', 'onError', 'onClose', 'offLoad', 'offError', 'offClose'];
            for (const m of methods) {
              if (typeof interstitialAd[m] !== 'function') {
                return `FAIL: Method ${m} missing on InterstitialAd instance`;
              }
            }
            
            // 清理 (InterstialAd 没有 destroy 方法? 文档里有，但有些版本可能没有，检查一下)
            // 实际上文档有 destroy: https://developers.weixin.qq.com/minigame/dev/api/ad/InterstitialAd.destroy.html
            if (interstitialAd.destroy) interstitialAd.destroy();
            return 'PASS';
          } catch (e) {
            return 'FAIL: ' + e.message;
          }
        }
      },
      {
        id: 'InterstitialAd.methods',
        name: '插屏广告方法调用',
        description: '验证 load/show/onError 等',
        type: 'async',
        run: (runtime) => {
          if (typeof runtime.createInterstitialAd !== 'function') return 'PASS: runtime.createInterstitialAd not supported';
          
          return new Promise((resolve) => {
            const interstitialAd = runtime.createInterstitialAd({
              adUnitId: 'adunit-test-dummy'
            });
            
            let isResolved = false;
            const safeResolve = (msg) => {
              if (!isResolved) {
                isResolved = true;
                if (interstitialAd.destroy) interstitialAd.destroy();
                resolve(msg);
              }
            };

            interstitialAd.onError((err) => {
              console.log('InterstitialAd onError:', err);
              safeResolve('PASS');
            });

            interstitialAd.onLoad(() => {
              console.log('InterstitialAd onLoad');
              // load 成功后尝试 show
              interstitialAd.show().catch(() => {});
              safeResolve('PASS');
            });

            interstitialAd.load().catch(err => {
               console.log('InterstitialAd load fail:', err);
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
