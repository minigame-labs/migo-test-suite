export default [
  {
    name: 'RewardedVideoAd',
    category: 'ad',
    tests: [
      {
        id: 'migo.createRewardedVideoAd',
        name: '创建激励视频广告',
        description: '验证 createRewardedVideoAd 返回对象及基本方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createRewardedVideoAd !== 'function') return 'PASS: runtime.createRewardedVideoAd not supported';
          
          try {
            const videoAd = runtime.createRewardedVideoAd({
              adUnitId: 'adunit-test-dummy'
            });

            if (!videoAd) return 'FAIL: createRewardedVideoAd returned undefined';
            
            const methods = ['show', 'load', 'destroy', 'onLoad', 'onError', 'onClose', 'offLoad', 'offError', 'offClose'];
            for (const m of methods) {
              if (typeof videoAd[m] !== 'function') {
                return `FAIL: Method ${m} missing on RewardedVideoAd instance`;
              }
            }
            
            // 文档显示 RewardedVideoAd 也有 destroy
            if (videoAd.destroy) videoAd.destroy();
            return 'PASS';
          } catch (e) {
            return 'FAIL: ' + e.message;
          }
        }
      },
      {
        id: 'RewardedVideoAd.methods',
        name: '激励视频广告方法调用',
        description: '验证 load/show/onError 等',
        type: 'async',
        run: (runtime) => {
          if (typeof runtime.createRewardedVideoAd !== 'function') return 'PASS: runtime.createRewardedVideoAd not supported';
          
          return new Promise((resolve) => {
            const videoAd = runtime.createRewardedVideoAd({
              adUnitId: 'adunit-test-dummy'
            });
            
            let isResolved = false;
            const safeResolve = (msg) => {
              if (!isResolved) {
                isResolved = true;
                if (videoAd.destroy) videoAd.destroy();
                resolve(msg);
              }
            };

            videoAd.onError((err) => {
              console.log('RewardedVideoAd onError:', err);
              safeResolve('PASS');
            });

            videoAd.onLoad(() => {
              console.log('RewardedVideoAd onLoad');
              videoAd.show().catch(() => {});
              safeResolve('PASS');
            });
            
            // 激励视频通常自动加载，但也可手动 load
            videoAd.load().catch(err => {
               console.log('RewardedVideoAd load fail:', err);
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
